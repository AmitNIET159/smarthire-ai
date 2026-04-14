/**
 * Winston logger configuration.
 * - Console transport (colorized in dev, JSON in prod)
 * - File transport for errors (logs/error.log)
 * - File transport for combined logs (logs/combined.log)
 */

const { createLogger, format, transports } = require('winston');
const path = require('path');
const config = require('./index');

const logDir = path.join(__dirname, '..', 'logs');

const logger = createLogger({
  level: config.env === 'development' ? 'debug' : 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: 'smarthire-api' },
  transports: [
    // Write error-level logs to error.log
    new transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5 * 1024 * 1024, // 5 MB
      maxFiles: 5,
    }),
    // Write all logs to combined.log
    new transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5 * 1024 * 1024,
      maxFiles: 5,
    }),
  ],
});

// In development, also log to console with colors
if (config.env !== 'production') {
  logger.add(
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(({ level, message, timestamp, stack }) => {
          return `${timestamp} ${level}: ${stack || message}`;
        })
      ),
    })
  );
}

module.exports = logger;
