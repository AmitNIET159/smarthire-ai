/**
 * Input Validation Middleware
 * Uses express-validator to validate and sanitize request bodies.
 * Provides reusable validation chains for auth, resume, and interview routes.
 */

const { body, validationResult } = require('express-validator');

// ── Run validations and return errors if any ────────────
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({
        field: e.path,
        message: e.msg,
      })),
    });
  }
  next();
};

// ── Auth validations ────────────────────────────────────
const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2–50 characters')
    .escape(),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  handleValidation,
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
  handleValidation,
];

// ── Resume validations ──────────────────────────────────
const analyzeValidation = [
  body('resumeId')
    .notEmpty().withMessage('Resume ID is required')
    .isMongoId().withMessage('Invalid resume ID'),
  body('jobDescription')
    .trim()
    .notEmpty().withMessage('Job description is required')
    .isLength({ min: 20 }).withMessage('Job description must be at least 20 characters'),
  handleValidation,
];

const buildResumeValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .escape(),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Valid email is required'),
  body('experience')
    .trim()
    .notEmpty().withMessage('Experience description is required'),
  body('skills')
    .trim()
    .notEmpty().withMessage('Skills are required'),
  body('targetRole')
    .trim()
    .notEmpty().withMessage('Target role is required'),
  handleValidation,
];

// ── Interview validations ───────────────────────────────
const startInterviewValidation = [
  body('role')
    .trim()
    .notEmpty().withMessage('Job role is required')
    .isLength({ min: 2, max: 100 }).withMessage('Role must be 2–100 characters')
    .escape(),
  body('difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard']).withMessage('Difficulty must be easy, medium, or hard'),
  handleValidation,
];

const feedbackValidation = [
  body('interviewId')
    .notEmpty().withMessage('Interview ID is required')
    .isMongoId().withMessage('Invalid interview ID'),
  body('questionId')
    .notEmpty().withMessage('Question ID is required'),
  body('answer')
    .trim()
    .notEmpty().withMessage('Answer is required')
    .isLength({ min: 10 }).withMessage('Answer must be at least 10 characters'),
  handleValidation,
];

module.exports = {
  registerValidation,
  loginValidation,
  analyzeValidation,
  buildResumeValidation,
  startInterviewValidation,
  feedbackValidation,
};
