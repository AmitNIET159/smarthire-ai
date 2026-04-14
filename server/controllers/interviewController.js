/**
 * Interview Controller
 * Handles starting interview sessions and submitting answers for feedback.
 */

const Interview = require('../models/Interview');
const { generateQuestions, evaluateAnswer } = require('../services/interviewService');
const logger = require('../config/logger');

/**
 * POST /api/interview/start
 * Generate interview questions for a given role and difficulty.
 */
async function startInterview(req, res, next) {
  try {
    const { role, difficulty = 'medium' } = req.body;

    // Generate AI questions
    const questions = await generateQuestions(role, difficulty, 5);

    // Create interview session
    const interview = await Interview.create({
      user: req.user.id,
      role,
      difficulty,
      questions: questions.map((q) => ({
        question: q.question,
        category: q.category || 'general',
        difficulty: q.difficulty || difficulty,
      })),
      status: 'in-progress',
    });

    logger.info('Interview started: %s (role: %s, user: %s)', interview._id, role, req.user.id);

    res.status(201).json({
      success: true,
      message: 'Interview session started.',
      data: {
        id: interview._id,
        role: interview.role,
        difficulty: interview.difficulty,
        questions: interview.questions.map((q) => ({
          id: q._id,
          question: q.question,
          category: q.category,
          difficulty: q.difficulty,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/interview/feedback
 * Submit an answer for a specific question and get AI feedback.
 */
async function submitFeedback(req, res, next) {
  try {
    const { interviewId, questionId, answer } = req.body;

    // Find the interview
    const interview = await Interview.findOne({
      _id: interviewId,
      user: req.user.id,
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found.',
      });
    }

    // Find the specific question
    const question = interview.questions.id(questionId);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found in this interview.',
      });
    }

    // Evaluate the answer with AI
    const feedback = await evaluateAnswer(question.question, answer, interview.role);

    // Update the question with answer and feedback
    question.answer = answer;
    question.feedback = {
      score: feedback.score,
      strengths: feedback.strengths || [],
      improvements: feedback.improvements || [],
      sampleAnswer: feedback.sampleAnswer || '',
    };

    // Check if all questions have been answered
    const allAnswered = interview.questions.every((q) => q.answer);
    if (allAnswered) {
      // Calculate overall score
      const scores = interview.questions
        .map((q) => q.feedback.score)
        .filter((s) => s != null);

      interview.overallScore =
        scores.length > 0
          ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
          : null;

      interview.overallFeedback = `Completed interview for ${interview.role}. Average score: ${interview.overallScore}/10.`;
      interview.status = 'completed';
    }

    await interview.save();

    logger.info(
      'Feedback submitted for interview %s, question %s (score: %d)',
      interviewId,
      questionId,
      feedback.score
    );

    res.json({
      success: true,
      message: 'Feedback generated.',
      data: {
        questionId,
        answer,
        feedback: question.feedback,
        interviewStatus: interview.status,
        overallScore: interview.overallScore,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/interview/:id
 * Get a specific interview session.
 */
async function getInterview(req, res, next) {
  try {
    const interview = await Interview.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found.',
      });
    }

    res.json({ success: true, data: interview });
  } catch (error) {
    next(error);
  }
}

module.exports = { startInterview, submitFeedback, getInterview };
