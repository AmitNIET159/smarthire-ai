/**
 * AI Service — Multi-Provider Fallback System
 *
 * Provides a unified interface for AI text generation with automatic
 * failover across FREE providers:
 *
 *   1. Google Gemini   (primary)   — free tier, fast, high quality
 *   2. HuggingFace     (fallback)  — free inference via router.huggingface.co
 *   3. OpenRouter      (final)     — free-tier open models with auto-routing
 *
 * Each provider has built-in retry logic (up to 2 retries with
 * exponential backoff) for transient errors like 503 and 429.
 *
 * Usage:
 *   const { generateText, buildPrompt } = require('./aiService');
 *   const result = await generateText(prompt, { temperature: 0.3 });
 */

const config = require('../config');
const logger = require('../config/logger');

// ─────────────────────────────────────────────────────────
//  Provider Priority Order (used when AI_PROVIDER=auto)
// ─────────────────────────────────────────────────────────

const PROVIDER_CHAIN = ['gemini', 'huggingface', 'openrouter'];

// ─────────────────────────────────────────────────────────
//  Gemini Models — try these in order (less popular = less 503)
// ─────────────────────────────────────────────────────────

const GEMINI_MODELS = [
  'gemini-2.5-flash-lite',   // lighter model, usually less demand
  'gemini-2.5-flash',        // main model, can be overloaded
];

// ─────────────────────────────────────────────────────────
//  OpenRouter Free Models — try multiple to avoid rate limits
// ─────────────────────────────────────────────────────────

const OPENROUTER_MODELS = [
  'google/gemma-4-31b-it:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'google/gemma-4-26b-a4b-it:free',
];

// ─────────────────────────────────────────────────────────
//  Retry Helper — Exponential Backoff for Transient Errors
// ─────────────────────────────────────────────────────────

/**
 * Retry a function with exponential backoff for transient errors.
 */
async function withRetry(fn, maxRetries = 2, baseDelay = 2000) {
  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const msg = error.message || '';
      const isTransient =
        msg.includes('503') || msg.includes('429') ||
        msg.includes('500') || msg.includes('502') || msg.includes('504') ||
        msg.includes('high demand') || msg.includes('rate-limited') ||
        msg.includes('temporarily') || msg.includes('overloaded');

      if (!isTransient || attempt >= maxRetries) {
        throw error;
      }

      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      logger.info('⏳ Retrying in %dms (attempt %d/%d)...', Math.round(delay), attempt + 1, maxRetries);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}

// ─────────────────────────────────────────────────────────
//  Lazy-initialised Gemini client
// ─────────────────────────────────────────────────────────

let genAIInstance = null;

function getGenAI() {
  if (genAIInstance) return genAIInstance;
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  genAIInstance = new GoogleGenerativeAI(config.ai.geminiKey);
  return genAIInstance;
}

// ─────────────────────────────────────────────────────────
//  Unified generate function (public API)
// ─────────────────────────────────────────────────────────

/**
 * Generate text using the configured AI provider(s).
 * @param {string} prompt   - The full prompt to send.
 * @param {object} options  - Optional parameters.
 * @param {number} options.temperature - Creativity (0-1). Default: 0.3
 * @param {number} options.maxTokens   - Max output tokens.  Default: 2048
 * @param {number} options.timeout     - Request timeout ms.  Default: 60000
 * @returns {Promise<string>} The generated text response.
 */
async function generateText(prompt, options = {}) {
  const {
    temperature = 0.3,
    maxTokens = 2048,
    timeout = 60000,
  } = options;

  const providerSetting = config.ai.provider;

  const providersToTry =
    providerSetting === 'auto'
      ? PROVIDER_CHAIN.slice()
      : [providerSetting];

  const errors = [];

  for (const provider of providersToTry) {
    if (!hasApiKey(provider)) {
      logger.debug('Skipping %s — no API key configured', provider);
      continue;
    }

    try {
      logger.info('🤖 Attempting AI generation via: %s', provider);
      const result = await callProvider(provider, prompt, { temperature, maxTokens, timeout });
      logger.info('✅ AI response received from: %s', provider);
      return result;
    } catch (error) {
      logger.warn('⚠️  %s failed: %s — trying next provider...', provider, error.message);
      errors.push({ provider, error: error.message });
    }
  }

  const summary = errors.map((e) => `${e.provider}: ${e.error}`).join(' | ');
  logger.error('❌ ALL AI providers failed: %s', summary);
  throw new Error(`AI service unavailable. Tried: ${summary}`);
}

// ─────────────────────────────────────────────────────────
//  Provider Router
// ─────────────────────────────────────────────────────────

async function callProvider(provider, prompt, opts) {
  switch (provider) {
    case 'gemini':
      return generateWithGemini(prompt, opts);
    case 'huggingface':
      return generateWithHuggingFace(prompt, opts);
    case 'openrouter':
      return generateWithOpenRouter(prompt, opts);
    default:
      throw new Error(`Unknown AI provider: ${provider}`);
  }
}

function hasApiKey(provider) {
  switch (provider) {
    case 'gemini':      return !!config.ai.geminiKey;
    case 'huggingface': return !!config.ai.huggingfaceKey;
    case 'openrouter':  return !!config.ai.openrouterKey;
    default:            return false;
  }
}

// ─────────────────────────────────────────────────────────
//  1. GEMINI (Primary) — tries multiple models
// ─────────────────────────────────────────────────────────

async function generateWithGemini(prompt, { temperature, maxTokens, timeout }) {
  const genAI = getGenAI();
  const errors = [];

  // Try each Gemini model in order
  for (const modelName of GEMINI_MODELS) {
    try {
      logger.info('  → Trying Gemini model: %s', modelName);
      const model = genAI.getGenerativeModel({ model: modelName });

      const result = await withRetry(async () => {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeout);
        try {
          const res = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
              temperature,
              maxOutputTokens: maxTokens,
            },
          });

          const text = res.response.text();
          if (!text || text.trim().length === 0) {
            throw new Error('Gemini returned an empty response');
          }
          return text;
        } finally {
          clearTimeout(timer);
        }
      }, 1, 3000); // 1 retry per model, 3s base delay

      return result;
    } catch (error) {
      logger.warn('  ✗ Gemini model %s failed: %s', modelName, error.message);
      errors.push(`${modelName}: ${error.message}`);
    }
  }

  throw new Error(`All Gemini models failed — ${errors.join(' | ')}`);
}

// ─────────────────────────────────────────────────────────
//  2. HUGGINGFACE (Fallback — OpenAI-Compatible Chat API)
// ─────────────────────────────────────────────────────────

const HF_API_URL = 'https://router.huggingface.co/v1/chat/completions';
const HF_MODELS = [
  'meta-llama/Llama-3.1-8B-Instruct',
  'Qwen/Qwen2.5-7B-Instruct',
];

async function generateWithHuggingFace(prompt, { temperature, maxTokens, timeout }) {
  const errors = [];

  for (const modelName of HF_MODELS) {
    try {
      logger.info('  → Trying HuggingFace model: %s', modelName);

      const result = await withRetry(async () => {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeout);

        try {
          const response = await fetch(HF_API_URL, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${config.ai.huggingfaceKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: modelName,
              messages: [{ role: 'user', content: prompt }],
              temperature,
              max_tokens: maxTokens,
              stream: false,
            }),
            signal: controller.signal,
          });

          if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`HuggingFace API error (${response.status}): ${errorBody.substring(0, 200)}`);
          }

          const data = await response.json();
          const generatedText = data?.choices?.[0]?.message?.content;

          if (!generatedText || generatedText.trim().length === 0) {
            throw new Error('HuggingFace returned an empty response');
          }

          return generatedText.trim();
        } finally {
          clearTimeout(timer);
        }
      }, 1, 2000);

      return result;
    } catch (error) {
      logger.warn('  ✗ HuggingFace model %s failed: %s', modelName, error.message);
      errors.push(`${modelName}: ${error.message}`);
    }
  }

  throw new Error(`All HuggingFace models failed — ${errors.join(' | ')}`);
}

// ─────────────────────────────────────────────────────────
//  3. OPENROUTER (Final Fallback — tries multiple free models)
// ─────────────────────────────────────────────────────────

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

async function generateWithOpenRouter(prompt, { temperature, maxTokens, timeout }) {
  const errors = [];

  for (const modelName of OPENROUTER_MODELS) {
    try {
      logger.info('  → Trying OpenRouter model: %s', modelName);

      const result = await withRetry(async () => {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeout);

        try {
          const response = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${config.ai.openrouterKey}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': config.cors.origin?.[0] || 'http://localhost:3000',
              'X-Title': 'SmartHire AI',
            },
            body: JSON.stringify({
              model: modelName,
              messages: [{ role: 'user', content: prompt }],
              temperature,
              max_tokens: maxTokens,
            }),
            signal: controller.signal,
          });

          if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`OpenRouter API error (${response.status}): ${errorBody.substring(0, 200)}`);
          }

          const data = await response.json();
          const text = data?.choices?.[0]?.message?.content;
          if (!text || text.trim().length === 0) {
            throw new Error('OpenRouter returned an empty response');
          }

          return text.trim();
        } finally {
          clearTimeout(timer);
        }
      }, 1, 2000);

      return result;
    } catch (error) {
      logger.warn('  ✗ OpenRouter model %s failed: %s', modelName, error.message);
      errors.push(`${modelName}: ${error.message}`);
    }
  }

  throw new Error(`All OpenRouter models failed — ${errors.join(' | ')}`);
}

// ─────────────────────────────────────────────────────────
//  Prompt Helpers
// ─────────────────────────────────────────────────────────

/**
 * Wraps a prompt in a structured system/role format.
 * Ensures deterministic JSON output from the AI.
 */
function buildPrompt(systemRole, task, context = '') {
  return `
You are ${systemRole}.

## TASK
${task}

${context ? `## CONTEXT\n${context}\n` : ''}
## INSTRUCTIONS
- Respond ONLY with valid JSON. No markdown, no code fences, no extra text.
- Be precise, actionable, and professional.
- Use industry-standard terminology.
`.trim();
}

module.exports = { generateText, buildPrompt };
