/**
 * SmartHire AI — Server Entry Point
 *
 * Production-grade Express server with:
 * - Helmet (HTTP security headers)
 * - CORS (environment-configured origins)
 * - Rate limiting
 * - Morgan + Winston logging
 * - Global error handling
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const config = require('./config');
const logger = require('./config/logger');
const errorHandler = require('./middleware/errorHandler');

// ── Route Imports ───────────────────────────────────────
const authRoutes = require('./routes/authRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// ── Initialize Express ──────────────────────────────────
const app = express();

// ── Create upload & log directories ─────────────────────
const uploadsDir = path.join(__dirname, config.uploads.dir);
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

// ── Security Middleware ─────────────────────────────────
app.use(helmet());

// ── CORS ────────────────────────────────────────────────
app.use(cors(config.cors));

// ── Rate Limiting ───────────────────────────────────────
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
  },
});
app.use('/api/', limiter);

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: {
    success: false,
    message: 'Too many auth attempts. Please try again in 15 minutes.',
  },
});
app.use('/api/auth/', authLimiter);

// ── Body Parsing ────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Request Logging (Morgan → Winston) ──────────────────
const morganFormat = config.env === 'production' ? 'combined' : 'dev';
app.use(
  morgan(morganFormat, {
    stream: { write: (msg) => logger.http(msg.trim()) },
  })
);

// ── API Routes ──────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ── Health Check ────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'SmartHire AI API is running',
    environment: config.env,
    timestamp: new Date().toISOString(),
  });
});

// ── 404 Handler ─────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ── Global Error Handler ────────────────────────────────
app.use(errorHandler);

// ── Database Connection & Server Start ──────────────────
async function startServer() {
  try {
    await mongoose.connect(config.mongoUri);
    logger.info('✅ Connected to MongoDB');

    app.listen(config.port, () => {
      logger.info(`🚀 SmartHire AI server running on port ${config.port} (${config.env})`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server: %s', error.message);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection: %s', err.message);
  process.exit(1);
});

startServer();

module.exports = app;
