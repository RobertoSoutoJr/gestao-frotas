import { api, apiGet, apiPost } from './client';
import { storage } from '../lib/storage';
import type { AuthTokens, User } from './types';

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

interface RegisterResponse {
  email: string;
}

export const authApi = {
  async login(email: string, password: string): Promise<AuthTokens> {
    const data = await apiPost<LoginResponse>('/auth/login', { email, password });
    await storage.setAccessToken(data.accessToken);
    await storage.setRefreshToken(data.refreshToken);
    await storage.setUser(data.user);
    api.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`;
    return data;
  },

  async register(payload: {
    nome: string;
    email: string;
    password: string;
    empresa?: string;
    telefone?: string;
  }): Promise<RegisterResponse> {
    return apiPost<RegisterResponse>('/auth/register', payload);
  },

  async verifyEmail(email: string, code: string): Promise<AuthTokens> {
    const data = await apiPost<LoginResponse>('/auth/verify-email', { email, code });
    await storage.setAccessToken(data.accessToken);
    await storage.setRefreshToken(data.refreshToken);
    await storage.setUser(data.user);
    api.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`;
    return data;
  },

  async resendCode(email: string): Promise<void> {
    await apiPost('/auth/resend-code', { email });
  },

  async logout(): Promise<void> {
    const refreshToken = await storage.getRefreshToken();
    try {
      if (refreshToken) {
        await apiPost('/auth/logout', { refreshToken });
      }
    } catch {
      // ignore server-side errors on logout
    } finally {
      await storage.clearAuth();
      delete api.defaults.headers.common.Authorization;
    }
  },

  async getProfile(): Promise<User> {
    const user = await apiGet<User>('/auth/profile');
    await storage.setUser(user);
    return user;
  },
};
