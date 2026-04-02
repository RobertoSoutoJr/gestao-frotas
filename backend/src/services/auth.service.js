const bcrypt = require('bcryptjs');
const { supabase } = require('../config/database');
const { AppError } = require('../middlewares/errorHandler');
const { PLANS } = require('../config/plans');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyToken
} = require('../middlewares/auth.middleware');
const emailService = require('./email.service');

class AuthService {
  async register(userData) {
    const { nome, email, password, empresa, telefone } = userData;

    // Verificar se email já existe
    const { data: existingUser } = await supabase
      .from('users')
      .select('email, email_verified')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser && existingUser.email_verified) {
      throw new AppError('Email já cadastrado', 409);
    }

    let user;

    if (existingUser && !existingUser.email_verified) {
      // Usuário existe mas não verificou — atualizar dados
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      const { data: updated, error } = await supabase
        .from('users')
        .update({ nome, password_hash, empresa: empresa || null, telefone: telefone || null })
        .eq('email', email.toLowerCase())
        .select('id, nome, email, empresa, telefone, avatar_url, email_verified, role, owner_id, motorista_id, created_at')
        .single();

      if (error) throw new AppError('Erro ao atualizar usuário', 500);
      user = updated;
    } else {
      // Criar novo usuário
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          nome,
          email: email.toLowerCase(),
          password_hash,
          empresa: empresa || null,
          telefone: telefone || null,
          email_verified: false
        })
        .select('id, nome, email, empresa, telefone, avatar_url, email_verified, role, owner_id, motorista_id, created_at')
        .single();

      if (error) throw new AppError('Erro ao criar usuário', 500);
      user = newUser;
    }

    // Gerar e enviar código de verificação
    await this.sendVerificationCode(user.id, user.email, user.nome);

    return {
      user,
      pendingVerification: true
    };
  }

  async sendVerificationCode(userId, email, nome) {
    const code = emailService.generateCode();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    // Invalidar códigos anteriores
    await supabase
      .from('email_verifications')
      .delete()
      .eq('user_id', userId);

    // Salvar novo código
    await supabase
      .from('email_verifications')
      .insert({
        user_id: userId,
        email,
        code,
        expires_at: expiresAt.toISOString()
      });

    // Enviar email
    try {
      await emailService.sendVerificationCode(email, code, nome);
    } catch (err) {
      console.error('Erro ao enviar email de verificação:', err.message);
      throw new AppError('Erro ao enviar email de verificação. Verifique o email informado.', 500);
    }
  }

  async verifyEmail(email, code) {
    const { data: verification, error } = await supabase
      .from('email_verifications')
      .select('*, users!inner(id, nome, email, empresa, telefone, avatar_url, email_verified, created_at)')
      .eq('email', email.toLowerCase())
      .eq('code', code)
      .eq('verified', false)
      .single();

    if (error || !verification) {
      throw new AppError('Código inválido', 400);
    }

    if (new Date(verification.expires_at) < new Date()) {
      throw new AppError('Código expirado. Solicite um novo código.', 400);
    }

    // Marcar código como verificado
    await supabase
      .from('email_verifications')
      .update({ verified: true })
      .eq('id', verification.id);

    // Marcar usuário como verificado
    await supabase
      .from('users')
      .update({ email_verified: true, updated_at: new Date().toISOString() })
      .eq('id', verification.user_id);

    const user = verification.users;
    user.email_verified = true;

    // Gerar tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    await this.saveRefreshToken(user.id, refreshToken);

    return { user, accessToken, refreshToken };
  }

  async resendVerificationCode(email) {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, nome, email, email_verified')
      .eq('email', email.toLowerCase())
      .single();

    if (!user) {
      throw new AppError('Email não encontrado', 404);
    }

    if (user.email_verified) {
      throw new AppError('Email já verificado', 400);
    }

    await this.sendVerificationCode(user.id, user.email, user.nome);

    return { message: 'Novo código enviado' };
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

    // Verificar se email foi confirmado
    if (!user.email_verified) {
      // Reenviar código
      await this.sendVerificationCode(user.id, user.email, user.nome);
      throw new AppError('Email não verificado. Um novo código foi enviado.', 403);
    }

    // Gerar tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    await this.saveRefreshToken(user.id, refreshToken);

    // Remover password_hash do retorno
    delete user.password_hash;

    return { user, accessToken, refreshToken };
  }

  async refreshAccessToken(refreshToken) {
    const decoded = verifyToken(refreshToken);
    if (!decoded || decoded.type !== 'refresh') {
      throw new AppError('Refresh token inválido', 401);
    }

    const { data: session } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('refresh_token', refreshToken)
      .eq('user_id', decoded.userId)
      .single();

    if (!session) {
      throw new AppError('Sessão inválida', 401);
    }

    if (new Date(session.expires_at) < new Date()) {
      await this.deleteRefreshToken(refreshToken);
      throw new AppError('Sessão expirada. Por favor, faça login novamente.', 401);
    }

    const newAccessToken = generateAccessToken(decoded.userId);
    return { accessToken: newAccessToken };
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
      .select('id, nome, email, empresa, telefone, avatar_url, email_verified, role, owner_id, motorista_id, plano, plano_inicio, created_at, updated_at')
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
    const { data: user } = await supabase
      .from('users')
      .select('password_hash')
      .eq('id', userId)
      .single();

    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isPasswordValid) {
      throw new AppError('Senha atual incorreta', 400);
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);

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

    await supabase
      .from('user_sessions')
      .delete()
      .eq('user_id', userId);

    return { message: 'Senha alterada com sucesso. Por favor, faça login novamente.' };
  }

  // RBAC: Admin creates a motorista user account
  async createMotoristaAccount(adminUserId, { nome, email, password, motoristaId }) {
    // Check if email exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existing) throw new AppError('Email já cadastrado', 409);

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const { data: user, error } = await supabase
      .from('users')
      .insert({
        nome,
        email: email.toLowerCase(),
        password_hash,
        role: 'motorista',
        owner_id: adminUserId,
        motorista_id: motoristaId || null,
        email_verified: true, // Admin-created, skip verification
        is_active: true,
      })
      .select('id, nome, email, role, motorista_id, is_active, created_at')
      .single();

    if (error) throw new AppError('Erro ao criar conta de motorista', 500);
    return user;
  }

  // List motorista accounts created by this admin
  async getMotoristaAccounts(adminUserId) {
    const { data, error } = await supabase
      .from('users')
      .select('id, nome, email, role, motorista_id, is_active, created_at')
      .eq('owner_id', adminUserId)
      .eq('role', 'motorista')
      .order('created_at', { ascending: false });

    if (error) throw new AppError('Erro ao listar contas', 500);
    return data;
  }

  // Toggle active status of a motorista account
  async toggleMotoristaAccount(adminUserId, userId, isActive) {
    const { data, error } = await supabase
      .from('users')
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .eq('owner_id', adminUserId)
      .eq('role', 'motorista')
      .select('id, nome, email, is_active')
      .single();

    if (error || !data) throw new AppError('Conta não encontrada', 404);
    return data;
  }

  async getPlanUsage(userId) {
    const { data: user } = await supabase
      .from('users')
      .select('plano, plano_inicio')
      .eq('id', userId)
      .single();

    const plano = user?.plano || 'free';
    const plan = PLANS[plano];

    // Count current usage
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const [caminhoes, motoristas, viagensMes, motoristaAccounts] = await Promise.all([
      supabase.from('caminhoes').select('id', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('motoristas').select('id', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('viagens').select('id', { count: 'exact', head: true }).eq('user_id', userId).gte('created_at', firstDay),
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('owner_id', userId).eq('role', 'motorista'),
    ]);

    return {
      plano,
      plano_nome: plan.nome,
      plano_preco: plan.preco,
      plano_inicio: user?.plano_inicio,
      recursos: plan.recursos,
      uso: {
        caminhoes: { atual: caminhoes.count || 0, limite: plan.limites.caminhoes },
        motoristas: { atual: motoristas.count || 0, limite: plan.limites.motoristas },
        viagens_mes: { atual: viagensMes.count || 0, limite: plan.limites.viagens_mes },
        motorista_accounts: { atual: motoristaAccounts.count || 0, limite: plan.limites.motorista_accounts },
      },
    };
  }

  async saveRefreshToken(userId, refreshToken) {
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
