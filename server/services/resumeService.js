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
async function buildResume(builderData) {
  const { targetRole, personalInfo, education, skills, projects, experience, achievements } = builderData;
  logger.info('Building resume for role: %s', targetRole);

  // Format structured data for the AI prompt
  const educationText = education?.length
    ? education.map(e => `${e.degree} from ${e.university} (${e.graduationYear})${e.cgpa ? ', CGPA: ' + e.cgpa : ''}${e.relevantCoursework ? ', Coursework: ' + e.relevantCoursework : ''}`).join('\n')
    : 'Not specified';

  const skillsText = Object.entries(skills || {})
    .filter(([, vals]) => vals?.length > 0)
    .map(([cat, vals]) => `${cat}: ${vals.join(', ')}`)
    .join('\n') || 'Not specified';

  const projectsText = projects?.length
    ? projects.map(p => `Project: ${p.name} | Tech: ${p.techStack} | Description: ${p.description}${p.impact ? ' | Impact: ' + p.impact : ''}`).join('\n')
    : 'Not specified';

  const experienceText = experience?.length
    ? experience.map(e => `Role: ${e.title} at ${e.company} (${e.duration}, ${e.type})\nAchievements:\n${(e.achievements || []).map(a => '- ' + a).join('\n')}`).join('\n\n')
    : 'Not specified';

  const achievementsText = [
    ...(achievements?.hackathons || []).map(h => `Hackathon: ${h}`),
    ...(achievements?.certifications || []).map(c => `Certification: ${c}`),
    ...(achievements?.competitiveProgramming || []).map(cp => `Competitive Programming: ${cp}`),
    ...(achievements?.other || []).map(o => o),
  ].join('\n') || 'Not specified';

  const prompt = buildPrompt(
    'a world-class professional resume writer and career strategist who has helped 10,000+ candidates land jobs at Fortune 500 companies like Google, Meta, Amazon, and Microsoft. You are an expert in ATS optimization, the XYZ formula for bullet points, and modern resume best practices.',
    `Generate a professional, ATS-optimized resume for a candidate targeting the role of "${targetRole}". 

CRITICAL INSTRUCTIONS:
1. Rewrite EVERY experience bullet point and project description using the XYZ formula: "Accomplished [X] as measured by [Y], by doing [Z]"
2. Begin each bullet with a STRONG action verb (Engineered, Spearheaded, Optimized, Architected, Developed, Implemented, Reduced, Increased, Automated, Designed, Led, Built, Deployed, Streamlined, etc.)
3. If the candidate did not provide specific metrics, infer reasonable and realistic ones based on the context
4. Tailor the professional summary specifically to the target role
5. Organize skills by category
6. Keep the resume concise, professional, and highly scannable

Return your output as a JSON object with this EXACT structure:
{
  "summary": "3-4 sentence professional summary tailored to ${targetRole}",
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "duration": "Start - End",
      "bullets": ["XYZ-formula bullet 1", "XYZ-formula bullet 2", "..."]
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "techStack": "React, Node.js, ...",
      "bullets": ["XYZ-formula bullet 1", "XYZ-formula bullet 2"]
    }
  ],
  "education": [
    {
      "degree": "B.Tech in Computer Science",
      "university": "University Name",
      "year": "2024",
      "cgpa": "8.5/10"
    }
  ],
  "skills": {
    "languages": ["JavaScript", "Python", ...],
    "frameworks": ["React", "Node.js", ...],
    "tools": ["Git", "Docker", ...],
    "databases": ["MongoDB", "PostgreSQL", ...]
  },
  "achievements": ["Achievement 1", "Achievement 2", ...],
  "fullText": "Complete formatted resume as clean markdown text with sections"
}`,
    `### CANDIDATE INFORMATION
- Name: ${personalInfo?.name || 'Not specified'}
- Email: ${personalInfo?.email || 'Not specified'}
- Phone: ${personalInfo?.phone || 'Not specified'}
- LinkedIn: ${personalInfo?.linkedin || 'Not specified'}
- GitHub: ${personalInfo?.github || 'Not specified'}
- Portfolio: ${personalInfo?.portfolio || 'Not specified'}
- Target Role: ${targetRole}

### EDUCATION
${educationText}

### TECHNICAL SKILLS
${skillsText}

### PROJECTS
${projectsText}

### WORK EXPERIENCE
${experienceText}

### ACHIEVEMENTS & EXTRACURRICULARS
${achievementsText}`
  );

  const response = await generateText(prompt, { temperature: 0.4, maxTokens: 4096 });
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
