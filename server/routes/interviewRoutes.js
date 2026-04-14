/**
 * Interview Routes
 * Protected routes for interview sessions.
 */

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  startInterview,
  submitFeedback,
  getInterview,
} = require('../controllers/interviewController');
const {
  startInterviewValidation,
  feedbackValidation,
} = require('../middleware/validate');

router.post('/start', auth, startInterviewValidation, startInterview);
router.post('/feedback', auth, feedbackValidation, submitFeedback);
router.get('/:id', auth, getInterview);

module.exports = router;
