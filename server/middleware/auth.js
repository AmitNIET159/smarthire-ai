/**
 * JWT Authentication Middleware
 * Extracts and verifies JWT from the Authorization header.
 * Attaches user payload to req.user on success.
 */

const jwt = require('jsonwebtoken');
const config = require('../config');
const logger = require('../config/logger');

const auth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret);

    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch (error) {
    logger.warn('Authentication failed: %s', error.message);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.',
    });
  }
};

module.exports = auth;
