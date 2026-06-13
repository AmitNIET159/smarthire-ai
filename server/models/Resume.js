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
    // Structured data from the interactive resume builder form
    builderData: {
      targetRole: { type: String, default: '' },
      template: { type: String, enum: ['modern', 'classic', 'minimal', 'bold'], default: 'modern' },
      personalInfo: {
        name: { type: String, default: '' },
        email: { type: String, default: '' },
        phone: { type: String, default: '' },
        linkedin: { type: String, default: '' },
        github: { type: String, default: '' },
        portfolio: { type: String, default: '' },
      },
      education: [{
        degree: { type: String, default: '' },
        university: { type: String, default: '' },
        graduationYear: { type: String, default: '' },
        cgpa: { type: String, default: '' },
        relevantCoursework: { type: String, default: '' },
      }],
      skills: {
        languages: [{ type: String }],
        frameworks: [{ type: String }],
        tools: [{ type: String }],
        databases: [{ type: String }],
        other: [{ type: String }],
      },
      projects: [{
        name: { type: String, default: '' },
        techStack: { type: String, default: '' },
        description: { type: String, default: '' },
        impact: { type: String, default: '' },
      }],
      experience: [{
        title: { type: String, default: '' },
        company: { type: String, default: '' },
        duration: { type: String, default: '' },
        type: { type: String, enum: ['internship', 'fulltime', 'freelance', 'parttime'], default: 'fulltime' },
        achievements: [{ type: String }],
      }],
      achievements: {
        hackathons: [{ type: String }],
        certifications: [{ type: String }],
        competitiveProgramming: [{ type: String }],
        other: [{ type: String }],
      },
    },
    // AI-built resume sections (for the resume builder)
    generatedResume: {
      summary: { type: String, default: '' },
      experience: [{
        title: { type: String, default: '' },
        company: { type: String, default: '' },
        duration: { type: String, default: '' },
        bullets: [{ type: String }],
      }],
      projects: [{
        name: { type: String, default: '' },
        techStack: { type: String, default: '' },
        bullets: [{ type: String }],
      }],
      education: [{
        degree: { type: String, default: '' },
        university: { type: String, default: '' },
        year: { type: String, default: '' },
        cgpa: { type: String, default: '' },
      }],
      skills: {
        languages: [{ type: String }],
        frameworks: [{ type: String }],
        tools: [{ type: String }],
        databases: [{ type: String }],
      },
      achievements: [{ type: String }],
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
