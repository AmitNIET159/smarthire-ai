/**
 * Environment-based configuration for SmartHire AI.
 * Centralizes all config values and provides defaults per environment.
 */

require('dotenv').config();

const config = {
  // ── Common ────────────────────────────────────────────
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,

  // ── MongoDB ───────────────────────────────────────────
  mongoUri:
    process.env.MONGODB_URI || 'mongodb://localhost:27017/smarthire-ai',

  // ── JWT ───────────────────────────────────────────────
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  // ── AI (Multi-Provider Fallback) ────────────────────────
  // "auto" tries providers in order: gemini → huggingface → openrouter
  // Or set to a specific provider: "gemini", "huggingface", "openrouter"
  ai: {
    provider: process.env.AI_PROVIDER || 'auto',
    geminiKey: process.env.GEMINI_API_KEY,
    huggingfaceKey: process.env.HUGGINGFACE_API_KEY,
    openrouterKey: process.env.OPENROUTER_API_KEY,
  },

  // ── CORS ──────────────────────────────────────────────
  cors: {
    origin: process.env.CLIENT_URL
      ? process.env.CLIENT_URL.split(',').map((s) => s.trim())
      : ['http://localhost:3000'],
    credentials: true,
  },

  // ── Rate Limiting ─────────────────────────────────────
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  },

  // ── Uploads ───────────────────────────────────────────
  uploads: {
    dir: 'uploads',
    maxFileSize: 10 * 1024 * 1024, // 10 MB
    allowedMimeTypes: [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
  },
};

// Production-specific overrides
if (config.env === 'production') {
  if (!process.env.MONGODB_URI) {
    console.error('⚠️  FATAL: Set MONGODB_URI in production!');
    process.exit(1);
  }
  if (config.jwt.secret === 'dev-secret-change-me') {
    console.error('⚠️  FATAL: Set JWT_SECRET in production!');
    process.exit(1);
  }
}

module.exports = config;
