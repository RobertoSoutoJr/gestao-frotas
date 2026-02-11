const { z } = require('zod');

exports.registerSchema = z.object({
  nome: z.string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome muito longo'),
  email: z.string()
    .email('Email inválido')
    .max(255, 'Email muito longo'),
  password: z.string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .max(100, 'Senha muito longa'),
  empresa: z.string()
    .max(100, 'Nome da empresa muito longo')
    .optional(),
  telefone: z.string()
    .max(20, 'Telefone muito longo')
    .optional()
});

exports.loginSchema = z.object({
  email: z.string()
    .email('Email inválido'),
  password: z.string()
    .min(1, 'Senha é obrigatória')
});

exports.refreshTokenSchema = z.object({
  refreshToken: z.string()
    .min(1, 'Refresh token é obrigatório')
});

exports.updateProfileSchema = z.object({
  nome: z.string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome muito longo')
    .optional(),
  empresa: z.string()
    .max(100, 'Nome da empresa muito longo')
    .optional(),
  telefone: z.string()
    .max(20, 'Telefone muito longo')
    .optional(),
  avatar_url: z.string()
    .url('URL inválida')
    .optional()
});

exports.changePasswordSchema = z.object({
  currentPassword: z.string()
    .min(1, 'Senha atual é obrigatória'),
  newPassword: z.string()
    .min(6, 'Nova senha deve ter pelo menos 6 caracteres')
    .max(100, 'Senha muito longa')
});
