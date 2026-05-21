const rateLimit = require('express-rate-limit');

// Global: 100 requests per minute per IP
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Muitas requisições. Tente novamente em 1 minuto.',
  },
});

// Auth routes: 10 requests per minute (login, register, refresh)
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Muitas tentativas de autenticação. Aguarde 1 minuto.',
  },
});

// Upload/OCR routes: 5 requests per minute
const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Muitos uploads. Aguarde 1 minuto.',
  },
});

module.exports = { globalLimiter, authLimiter, uploadLimiter };
