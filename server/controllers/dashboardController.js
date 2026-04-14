/**
 * Dashboard Controller
 * Returns aggregated user data for the dashboard view.
 */

const Resume = require('../models/Resume');
const Interview = require('../models/Interview');
const logger = require('../config/logger');

/**
 * GET /api/dashboard
 * Returns user stats, recent resumes, and recent interviews.
 * Supports optional query params: ?filter=resumes|interviews&limit=10
 */
async function getDashboard(req, res, next) {
  try {
    const userId = req.user.id;
    const { filter, limit = 10 } = req.query;
    const limitNum = Math.min(parseInt(limit, 10) || 10, 50);

    let resumes = [];
    let interviews = [];

    // Fetch resumes (unless filtering only interviews)
    if (!filter || filter === 'resumes') {
      resumes = await Resume.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(limitNum)
        .select('fileName fileType status analysis.matchScore generatedResume.summary createdAt')
        .lean();
    }

    // Fetch interviews (unless filtering only resumes)
    if (!filter || filter === 'interviews') {
      interviews = await Interview.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(limitNum)
        .select('role difficulty status overallScore questions createdAt')
        .lean();
    }

    // Calculate stats
    const totalResumes = await Resume.countDocuments({ user: userId });
    const totalInterviews = await Interview.countDocuments({ user: userId });

    const analyzedResumes = await Resume.find({
      user: userId,
      'analysis.matchScore': { $ne: null },
    }).select('analysis.matchScore').lean();

    const avgMatchScore =
      analyzedResumes.length > 0
        ? Math.round(
            analyzedResumes.reduce((sum, r) => sum + (r.analysis.matchScore || 0), 0) /
              analyzedResumes.length
          )
        : 0;

    const completedInterviews = await Interview.find({
      user: userId,
      status: 'completed',
    }).select('overallScore').lean();

    const avgInterviewScore =
      completedInterviews.length > 0
        ? Math.round(
            (completedInterviews.reduce((sum, i) => sum + (i.overallScore || 0), 0) /
              completedInterviews.length) *
              10
          ) / 10
        : 0;

    logger.debug('Dashboard loaded for user: %s', userId);

    res.json({
      success: true,
      data: {
        stats: {
          totalResumes,
          totalInterviews,
          avgMatchScore,
          avgInterviewScore,
          completedInterviews: completedInterviews.length,
        },
        resumes: resumes.map((r) => ({
          id: r._id,
          fileName: r.fileName,
          fileType: r.fileType,
          status: r.status,
          matchScore: r.analysis?.matchScore || null,
          summary: r.generatedResume?.summary || '',
          createdAt: r.createdAt,
        })),
        interviews: interviews.map((i) => ({
          id: i._id,
          role: i.role,
          difficulty: i.difficulty,
          status: i.status,
          overallScore: i.overallScore,
          questionCount: i.questions?.length || 0,
          answeredCount: i.questions?.filter((q) => q.answer).length || 0,
          createdAt: i.createdAt,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getDashboard };
