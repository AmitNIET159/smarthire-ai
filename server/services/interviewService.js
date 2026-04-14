/**
 * Interview Service
 * Handles AI-powered interview question generation and answer evaluation.
 */

const { generateText, buildPrompt } = require('./aiService');
const logger = require('../config/logger');

// ── Generate Interview Questions ────────────────────────

/**
 * Generate role-specific interview questions.
 * @param {string} role - The job role (e.g. "Senior React Developer")
 * @param {string} difficulty - "easy" | "medium" | "hard"
 * @param {number} count - Number of questions to generate.
 * @returns {Promise<Array>} Array of question objects.
 */
async function generateQuestions(role, difficulty = 'medium', count = 5) {
  logger.info('Generating %d %s questions for: %s', count, difficulty, role);

  const prompt = buildPrompt(
    'a senior technical interviewer at a FAANG company with 12+ years of experience conducting interviews for top tech firms. You design interview questions that assess both technical depth and practical problem-solving ability.',
    `Generate exactly ${count} interview questions for the role of "${role}" at ${difficulty} difficulty level.

Mix question types: technical (40%), behavioral (30%), and situational (30%).

Return your output as a JSON object with this EXACT structure:
{
  "questions": [
    {
      "question": "<the interview question>",
      "category": "<technical|behavioral|situational>",
      "difficulty": "${difficulty}",
      "keyPoints": ["<key point the interviewer looks for>", ...]
    }
  ]
}`,
    `### GUIDELINES
- Technical questions should test real-world problem-solving, not textbook trivia.
- Behavioral questions should use the STAR format expectation.
- Situational questions should present realistic workplace scenarios.
- Difficulty "${difficulty}" means:
  - easy: entry-level / junior, fundamentals-focused
  - medium: mid-level, practical application
  - hard: senior-level, system design & architecture`
  );

  const response = await generateText(prompt, { temperature: 0.5 });
  const parsed = parseJSONResponse(response);
  return parsed.questions || parsed;
}

// ── Evaluate Interview Answer ───────────────────────────

/**
 * Evaluate a candidate's answer to an interview question.
 * @param {string} question - The original interview question.
 * @param {string} answer - The candidate's answer.
 * @param {string} role - The job role for context.
 * @returns {Promise<object>} Feedback object.
 */
async function evaluateAnswer(question, answer, role) {
  logger.info('Evaluating answer for role: %s', role);

  const prompt = buildPrompt(
    `a senior technical interviewer at Google who is evaluating a candidate for the role of "${role}". You provide constructive, specific, and actionable feedback that helps candidates improve.`,
    `Evaluate the candidate's answer to the following interview question.

Return your evaluation as a JSON object with this EXACT structure:
{
  "score": <number 1-10>,
  "strengths": ["<specific strength 1>", "<specific strength 2>"],
  "improvements": ["<specific actionable improvement 1>", "<specific actionable improvement 2>"],
  "sampleAnswer": "<a concise model answer demonstrating best practices>"
}`,
    `### INTERVIEW QUESTION
${question}

### CANDIDATE'S ANSWER
${answer}

### SCORING RUBRIC
- 1-3: Poor — missing key concepts, irrelevant, or too vague
- 4-5: Below Average — partially correct but lacks depth or structure
- 6-7: Good — solid answer with minor gaps
- 8-9: Excellent — comprehensive, well-structured, demonstrates expertise
- 10: Outstanding — perfect, insightful, goes above and beyond`
  );

  const response = await generateText(prompt, { temperature: 0.2 });
  return parseJSONResponse(response);
}

// ── Helper ──────────────────────────────────────────────

function parseJSONResponse(text) {
  try {
    const cleaned = text
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim();
    return JSON.parse(cleaned);
  } catch (error) {
    logger.error('Failed to parse AI JSON (interview): %s', error.message);
    throw new Error('AI returned an unexpected format. Please try again.');
  }
}

module.exports = { generateQuestions, evaluateAnswer };
