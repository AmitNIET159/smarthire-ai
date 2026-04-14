/**
 * Resume Routes
 * Protected routes for resume upload, analysis, and building.
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const {
  uploadResume,
  analyzeResume,
  buildResume,
  getResume,
} = require('../controllers/resumeController');
const { analyzeValidation, buildResumeValidation } = require('../middleware/validate');
const config = require('../config');

// ── Multer Configuration ────────────────────────────────

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.uploads.dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `resume-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (config.uploads.allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and DOCX files are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: config.uploads.maxFileSize },
});

// ── Routes ──────────────────────────────────────────────

router.post('/upload', auth, upload.single('resume'), uploadResume);
router.post('/analyze', auth, analyzeValidation, analyzeResume);
router.post('/build', auth, buildResumeValidation, buildResume);
router.get('/:id', auth, getResume);

module.exports = router;
