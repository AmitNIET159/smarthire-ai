/**
 * Resume Service
 * Handles file parsing (PDF/DOCX) and AI-powered resume analysis/building.
 */

const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { generateText, buildPrompt } = require('./aiService');
const logger = require('../config/logger');

// ── File Parsing ────────────────────────────────────────

/**
 * Extract text content from an uploaded PDF or DOCX file.
 * @param {string} filePath - Absolute path to the uploaded file.
 * @param {string} fileType - "pdf" or "docx"
 * @returns {Promise<string>} Extracted text.
 */
async function parseResume(filePath, fileType) {
  logger.info('Parsing resume: %s (type: %s)', path.basename(filePath), fileType);

  try {
    if (fileType === 'pdf') {
      const buffer = fs.readFileSync(filePath);
      const data = await pdfParse(buffer);
      return data.text.trim();
    }

    if (fileType === 'docx') {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value.trim();
    }

    throw new Error(`Unsupported file type: ${fileType}`);
  } catch (error) {
    logger.error('Resume parsing failed: %s', error.message);
    throw new Error(`Failed to parse resume: ${error.message}`);
  }
}

// ── AI Resume Analysis ──────────────────────────────────

/**
 * Analyze a resume against a job description using AI.
 * Returns match score, missing skills, strengths, and suggestions.
 */
async function analyzeResume(resumeText, jobDescription) {
  logger.info('Analyzing resume against job description');

  const prompt = buildPrompt(
    'a senior technical recruiter and ATS (Applicant Tracking System) expert with 15+ years of experience in talent acquisition across tech companies like Google, Meta, and Amazon',
    `Analyze the following RESUME against the provided JOB DESCRIPTION. Perform a thorough ATS-style evaluation.

Return your analysis as a JSON object with this EXACT structure:
{
  "matchScore": <number 0-100>,
  "missingSkills": ["skill1", "skill2", ...],
  "strengths": ["strength1", "strength2", ...],
  "suggestions": ["suggestion1", "suggestion2", ...],
  "summary": "<2-3 sentence overall assessment>"
}`,
    `### RESUME
${resumeText.substring(0, 3000)}

### JOB DESCRIPTION
${jobDescription.substring(0, 2000)}`
  );

  const response = await generateText(prompt, { temperature: 0.2 });
  return parseJSONResponse(response);
}

// ── AI Resume Builder ───────────────────────────────────

/**
 * Generate professional resume sections from user-provided form data.
 */
async function buildResume(formData) {
  const { name, email, experience, skills, targetRole, education } = formData;
  logger.info('Building resume for role: %s', targetRole);

  const prompt = buildPrompt(
    'a professional resume writer and career coach who has helped 10,000+ candidates land jobs at Fortune 500 companies. You specialize in ATS-optimized, modern resume writing.',
    `Generate professional resume content for a candidate. Create polished, quantified, action-verb-driven content.

Return your output as a JSON object with this EXACT structure:
{
  "summary": "<3-4 sentence professional summary tailored to the target role>",
  "experience": ["<bullet point 1 starting with action verb>", "<bullet point 2>", ...],
  "skills": ["skill1", "skill2", ...],
  "fullText": "<complete formatted resume text>"
}`,
    `### CANDIDATE INFORMATION
- Name: ${name}
- Email: ${email}
- Target Role: ${targetRole}
- Education: ${education || 'Not specified'}

### RAW EXPERIENCE
${experience}

### RAW SKILLS
${skills}`
  );

  const response = await generateText(prompt, { temperature: 0.4 });
  return parseJSONResponse(response);
}

// ── Helper: Parse AI response as JSON ───────────────────

function parseJSONResponse(text) {
  try {
    // Strip markdown code fences if present
    const cleaned = text
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim();
    return JSON.parse(cleaned);
  } catch (error) {
    logger.error('Failed to parse AI JSON response: %s', error.message);
    logger.debug('Raw AI response: %s', text.substring(0, 500));
    throw new Error('AI returned an unexpected format. Please try again.');
  }
}

module.exports = { parseResume, analyzeResume, buildResume };
