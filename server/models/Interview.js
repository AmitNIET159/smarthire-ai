/**
 * Interview Model
 * Stores AI-generated interview sessions with questions, answers, and feedback.
 */

const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    category: { type: String, default: 'general' }, // technical, behavioral, situational
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    answer: { type: String, default: '' },
    feedback: {
      score: { type: Number, min: 0, max: 10, default: null },
      strengths: [{ type: String }],
      improvements: [{ type: String }],
      sampleAnswer: { type: String, default: '' },
    },
  },
  { _id: true }
);

const interviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    role: {
      type: String,
      required: [true, 'Job role is required'],
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    questions: [questionSchema],
    overallScore: {
      type: Number,
      min: 0,
      max: 10,
      default: null,
    },
    overallFeedback: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['in-progress', 'completed'],
      default: 'in-progress',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient dashboard queries
interviewSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Interview', interviewSchema);
