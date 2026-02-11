const bcrypt = require('bcryptjs');
const supabase = require('../config/database');
const { AppError } = require('../middlewares/errorHandler');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyToken
} = require('../middlewares/auth.middleware');

class AuthService {
  async register(userData) {
    const { nome, email, password, empresa, telefone } = userData;

    // Verificar se email já existe
    const { data: existingUser } = await supabase
      .from('users')
      .select('email')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      throw new AppError('Email já cadastrado', 409);
    }

    // Hash da senha
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Criar usuário
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        nome,
        email: email.toLowerCase(),
        password_hash,
        empresa: empresa || null,
        telefone: telefone || null
      })
      .select('id, nome, email, empresa, telefone, avatar_url, created_at')
      .single();

    if (error) {
      throw new AppError('Erro ao criar usuário', 500);
    }

    // Gerar tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Salvar refresh token no banco
    await this.saveRefreshToken(user.id, refreshToken);

    return {
      user,
      accessToken,
      refreshToken
    };
  }

  async login(email, password) {
    // Buscar usuário
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('is_active', true)
      .single();

    if (error || !user) {
      throw new AppError('Credenciais inválidas', 401);
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new AppError('Credenciais inválidas', 401);
    }

    // Gerar tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Salvar refresh token
    await this.saveRefreshToken(user.id, refreshToken);

    // Remover password_hash do retorno
    delete user.password_hash;

    return {
      user,
      accessToken,
      refreshToken
    };
  }

  async refreshAccessToken(refreshToken) {
    // Verificar token
    const decoded = verifyToken(refreshToken);
    if (!decoded || decoded.type !== 'refresh') {
      throw new AppError('Refresh token inválido', 401);
    }

    // Verificar se token existe no banco
    const { data: session } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('refresh_token', refreshToken)
      .eq('user_id', decoded.userId)
      .single();

    if (!session) {
      throw new AppError('Sessão inválida', 401);
    }

    // Verificar se token expirou
    if (new Date(session.expires_at) < new Date()) {
      await this.deleteRefreshToken(refreshToken);
      throw new AppError('Sessão expirada. Por favor, faça login novamente.', 401);
    }

    // Gerar novo access token
    const newAccessToken = generateAccessToken(decoded.userId);

    return {
      accessToken: newAccessToken
    };
  }

  async logout(refreshToken) {
    if (refreshToken) {
      await this.deleteRefreshToken(refreshToken);
    }
    return { message: 'Logout realizado com sucesso' };
  }

  async getProfile(userId) {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, nome, email, empresa, telefone, avatar_url, created_at, updated_at')
      .eq('id', userId)
      .single();

    if (error || !user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    return user;
  }

  async updateProfile(userId, updates) {
    const { data: user, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select('id, nome, email, empresa, telefone, avatar_url, updated_at')
      .single();

    if (error) {
      throw new AppError('Erro ao atualizar perfil', 500);
    }

    return user;
  }

  async changePassword(userId, currentPassword, newPassword) {
    // Buscar usuário
    const { data: user } = await supabase
      .from('users')
      .select('password_hash')
      .eq('id', userId)
      .single();

    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    // Verificar senha atual
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isPasswordValid) {
      throw new AppError('Senha atual incorreta', 400);
    }

    // Hash da nova senha
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);

    // Atualizar senha
    const { error } = await supabase
      .from('users')
      .update({
        password_hash,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      throw new AppError('Erro ao alterar senha', 500);
    }

    // Invalidar todas as sessões do usuário
    await supabase
      .from('user_sessions')
      .delete()
      .eq('user_id', userId);

    return { message: 'Senha alterada com sucesso. Por favor, faça login novamente.' };
  }

  async saveRefreshToken(userId, refreshToken) {
    // Calcular data de expiração (30 dias)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await supabase
      .from('user_sessions')
      .insert({
        user_id: userId,
        refresh_token: refreshToken,
        expires_at: expiresAt.toISOString()
      });
  }

  async deleteRefreshToken(refreshToken) {
    await supabase
      .from('user_sessions')
      .delete()
      .eq('refresh_token', refreshToken);
  }
}

module.exports = new AuthService();
