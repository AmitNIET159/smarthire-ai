/**
 * Resume Model
 * Stores uploaded resumes, extracted text, and AI analysis results.
 */

const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      enum: ['pdf', 'docx'],
      required: true,
    },
    extractedText: {
      type: String,
      default: '',
    },
    jobDescription: {
      type: String,
      default: '',
    },
    analysis: {
      matchScore: { type: Number, min: 0, max: 100, default: null },
      missingSkills: [{ type: String }],
      suggestions: [{ type: String }],
      strengths: [{ type: String }],
      summary: { type: String, default: '' },
    },
    // AI-built resume sections (for the resume builder)
    generatedResume: {
      summary: { type: String, default: '' },
      experience: [{ type: String }],
      skills: [{ type: String }],
      fullText: { type: String, default: '' },
    },
    status: {
      type: String,
      enum: ['uploaded', 'analyzed', 'built'],
      default: 'uploaded',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient dashboard queries
resumeSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Resume', resumeSchema);
