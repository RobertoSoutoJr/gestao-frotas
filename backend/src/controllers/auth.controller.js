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
    message: 'Usuário cadastrado com sucesso',
    data: result
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

exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
  const result = await authService.changePassword(req.userId, currentPassword, newPassword);

  res.json({
    success: true,
    message: result.message
  });
});
