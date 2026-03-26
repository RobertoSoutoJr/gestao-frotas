const jwt = require('jsonwebtoken');
const { supabase } = require('../config/database');
const { AppError } = require('./errorHandler');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = '7d';
const REFRESH_TOKEN_EXPIRES_IN = '30d';

// Gerar access token
exports.generateAccessToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Gerar refresh token
exports.generateRefreshToken = (userId) => {
  return jwt.sign({ userId, type: 'refresh' }, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
};

// Verificar token
exports.verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Middleware para proteger rotas
exports.protect = async (req, res, next) => {
  try {
    // Pegar token do header
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new AppError('Não autenticado. Por favor, faça login.', 401);
    }

    // Verificar token
    const decoded = exports.verifyToken(token);
    if (!decoded || decoded.type === 'refresh') {
      throw new AppError('Token inválido ou expirado.', 401);
    }

    // Adicionar user ID ao request
    req.userId = decoded.userId;

    // Load role info (cached per request)
    const { data: user } = await supabase
      .from('users')
      .select('role, owner_id, motorista_id')
      .eq('id', decoded.userId)
      .single();

    req.userRole = user?.role || 'admin';
    req.ownerId = user?.owner_id || null;
    req.motoristaId = user?.motorista_id || null;

    // For motorista accounts, scope data to the admin who created them
    if (req.userRole === 'motorista' && req.ownerId) {
      req.userId = req.ownerId; // Data belongs to the admin
      req.realUserId = decoded.userId; // Keep real identity
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Middleware opcional - não falha se não houver token
exports.optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = exports.verifyToken(token);
      if (decoded && decoded.type !== 'refresh') {
        req.userId = decoded.userId;
      }
    }
    next();
  } catch (error) {
    next();
  }
};

// Middleware: require admin role
exports.requireAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return next(new AppError('Acesso restrito a administradores', 403));
  }
  next();
};

// Middleware: require motorista role
exports.requireMotorista = (req, res, next) => {
  if (req.userRole !== 'motorista') {
    return next(new AppError('Acesso restrito a motoristas', 403));
  }
  next();
};

exports.JWT_SECRET = JWT_SECRET;
exports.JWT_EXPIRES_IN = JWT_EXPIRES_IN;
exports.REFRESH_TOKEN_EXPIRES_IN = REFRESH_TOKEN_EXPIRES_IN;
