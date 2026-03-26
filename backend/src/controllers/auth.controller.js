const authService = require('../services/auth.service');
const { asyncHandler } = require('../middlewares/errorHandler');
const {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  updateProfileSchema,
  changePasswordSchema
} = require('../validators/auth.validator');

exports.register = asyncHandler(async (req, res) => {
  const validatedData = registerSchema.parse(req.body);
  const result = await authService.register(validatedData);

  res.status(201).json({
    success: true,
    message: 'Código de verificação enviado para o email',
    data: result
  });
});

exports.verifyEmail = asyncHandler(async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ success: false, message: 'Email e código são obrigatórios' });
  }
  const result = await authService.verifyEmail(email, code);

  res.json({
    success: true,
    message: 'Email verificado com sucesso',
    data: result
  });
});

exports.resendCode = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email é obrigatório' });
  }
  const result = await authService.resendVerificationCode(email);

  res.json({
    success: true,
    message: result.message
  });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);
  const result = await authService.login(email, password);

  res.json({
    success: true,
    message: 'Login realizado com sucesso',
    data: result
  });
});

exports.refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = refreshTokenSchema.parse(req.body);
  const result = await authService.refreshAccessToken(refreshToken);

  res.json({
    success: true,
    data: result
  });
});

exports.logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const result = await authService.logout(refreshToken);

  res.json({
    success: true,
    message: result.message
  });
});

exports.getProfile = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.userId);

  res.json({
    success: true,
    data: user
  });
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const validatedData = updateProfileSchema.parse(req.body);
  const user = await authService.updateProfile(req.userId, validatedData);

  res.json({
    success: true,
    message: 'Perfil atualizado com sucesso',
    data: user
  });
});

// RBAC endpoints
exports.createMotoristaAccount = asyncHandler(async (req, res) => {
  const { nome, email, password, motorista_id } = req.body;
  if (!nome || !email || !password) {
    return res.status(400).json({ success: false, message: 'nome, email e password são obrigatórios' });
  }
  const user = await authService.createMotoristaAccount(req.userId, {
    nome, email, password, motoristaId: motorista_id || null
  });
  res.status(201).json({ success: true, data: user });
});

exports.getMotoristaAccounts = asyncHandler(async (req, res) => {
  const accounts = await authService.getMotoristaAccounts(req.userId);
  res.json({ success: true, data: accounts });
});

exports.toggleMotoristaAccount = asyncHandler(async (req, res) => {
  const { is_active } = req.body;
  const user = await authService.toggleMotoristaAccount(req.userId, Number(req.params.id), is_active);
  res.json({ success: true, data: user });
});

exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
  const result = await authService.changePassword(req.userId, currentPassword, newPassword);

  res.json({
    success: true,
    message: result.message
  });
});
