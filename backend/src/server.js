require('dotenv').config();
const path = require('path');
const fs = require('fs');
const Sentry = require('@sentry/node');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const pinoHttp = require('pino-http');
const logger = require('./lib/logger');
const routes = require('./routes');
const { errorHandler } = require('./middlewares/errorHandler');
const { globalLimiter } = require('./middlewares/rateLimiter');

// Initialize Sentry (only if DSN is configured)
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'production',
    tracesSampleRate: 0.2, // 20% of transactions for performance monitoring
    beforeSend(event) {
      // Redact sensitive headers
      if (event.request?.headers) {
        delete event.request.headers.authorization;
        delete event.request.headers.cookie;
      }
      return event;
    },
  });
  logger.info('Sentry initialized');
}

const app = express();

// Security headers
// contentSecurityPolicy desativado: este mesmo serviço serve o frontend (SPA),
// que carrega mapas/imagens externas — a CSP padrão do helmet quebraria a tela.
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// Gzip compression
app.use(compression());

// Rate limiting (global)
app.use(globalLimiter);

// Trust proxy (behind Nginx)
app.set('trust proxy', 1);

// CORS
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all for now (mobile app uses different origins)
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Structured request logging
app.use(pinoHttp({
  logger,
  autoLogging: {
    ignore: (req) => req.url === '/health', // skip health checks
  },
  customSuccessMessage: (req, res) => `${req.method} ${req.url} ${res.statusCode}`,
  customErrorMessage: (req, res, err) => `${req.method} ${req.url} ${res.statusCode} - ${err.message}`,
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      query: req.query,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },
}));

// API routes (sob /api)
app.use('/api', routes);

// 404 das rotas de API (JSON) — só para caminhos /api não encontrados
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint não encontrado'
  });
});

// --- Servir o frontend (SPA) a partir do mesmo serviço ---
// Em produção (Render), o build do frontend fica em frontend/dist.
const frontendDist = path.join(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  // Qualquer GET que não seja /api nem arquivo estático devolve o index.html
  // (React Router cuida do resto). Middleware sem path — compatível com Express 5.
  app.use((req, res, next) => {
    if (req.method !== 'GET') return next();
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
  logger.info('Servindo frontend estático de frontend/dist');
}

// Sentry error handler (captures exceptions before our handler)
if (process.env.SENTRY_DSN) {
  Sentry.setupExpressErrorHandler(app);
}

// Global error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  logger.info({ port: PORT, env: process.env.NODE_ENV || 'development' }, 'Server started');
});

module.exports = app;
