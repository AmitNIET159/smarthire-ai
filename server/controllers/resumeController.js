/**
 * Resume Controller
 * Handles file upload, AI analysis, and AI resume building.
 */

const path = require('path');
const Resume = require('../models/Resume');
const { parseResume, analyzeResume, buildResume } = require('../services/resumeService');
const logger = require('../config/logger');

/**
 * POST /api/resume/upload
 * Upload a PDF or DOCX resume file.
 */
async function uploadResume(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a PDF or DOCX file.',
      });
    }

    const fileType = req.file.originalname.endsWith('.pdf') ? 'pdf' : 'docx';
    const filePath = path.resolve(req.file.path);

    // Extract text from the uploaded file
    const extractedText = await parseResume(filePath, fileType);

    // Save resume record to database
    const resume = await Resume.create({
      user: req.user.id,
      fileName: req.file.originalname,
      fileType,
      extractedText,
      status: 'uploaded',
    });

    logger.info('Resume uploaded: %s (user: %s)', resume.fileName, req.user.id);

    res.status(201).json({
      success: true,
      message: 'Resume uploaded and parsed successfully.',
      data: {
        id: resume._id,
        fileName: resume.fileName,
        extractedText: resume.extractedText.substring(0, 500) + '...',
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/resume/analyze
 * Analyze an uploaded resume against a job description.
 */
async function analyzeResumeHandler(req, res, next) {
  try {
    const { resumeId, jobDescription } = req.body;

    // Find the resume belonging to this user
    const resume = await Resume.findOne({ _id: resumeId, user: req.user.id });
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found.',
      });
    }

    if (!resume.extractedText) {
      return res.status(400).json({
        success: false,
        message: 'Resume has no extracted text. Please re-upload.',
      });
    }

    // Run AI analysis
    const analysis = await analyzeResume(resume.extractedText, jobDescription);

    // Update resume record
    resume.jobDescription = jobDescription;
    resume.analysis = analysis;
    resume.status = 'analyzed';
    await resume.save();

    logger.info('Resume analyzed: %s (score: %d)', resume.fileName, analysis.matchScore);

    res.json({
      success: true,
      message: 'Resume analyzed successfully.',
      data: {
        id: resume._id,
        fileName: resume.fileName,
        analysis: resume.analysis,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/resume/build
 * Generate professional resume sections from form data.
 */
async function buildResumeHandler(req, res, next) {
  try {
    const formData = req.body;

    // Generate resume content via AI
    const generated = await buildResume(formData);

    // Save as a new resume record
    const resume = await Resume.create({
      user: req.user.id,
      fileName: `${formData.name}_resume_${Date.now()}`,
      fileType: 'pdf',
      generatedResume: generated,
      status: 'built',
    });

    logger.info('Resume built for user: %s', req.user.id);

    res.status(201).json({
      success: true,
      message: 'Resume generated successfully.',
      data: {
        id: resume._id,
        generatedResume: resume.generatedResume,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/resume/:id
 * Get a specific resume by ID.
 */
async function getResume(req, res, next) {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user.id });
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found.',
      });
    }

    res.json({ success: true, data: resume });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  uploadResume,
  analyzeResume: analyzeResumeHandler,
  buildResume: buildResumeHandler,
  getResume,
};
