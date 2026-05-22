const pino = require('pino');

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport:
    process.env.NODE_ENV === 'development'
      ? { target: 'pino/file', options: { destination: 1 } } // stdout
      : undefined,
  formatters: {
    level(label) {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  base: { service: 'fueltrack-api' },
  // Redact sensitive fields
  redact: ['req.headers.authorization', 'req.headers.cookie'],
});

module.exports = logger;
