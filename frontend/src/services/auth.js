import { api } from './api';

// Configurar token no header
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('accessToken', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }
};

// Inicializar token do localStorage
const token = localStorage.getItem('accessToken');
if (token) {
  setAuthToken(token);
}

const authService = {
  async register(data) {
    const response = await api.post('/auth/register', data);
    if (response.data.accessToken) {
      setAuthToken(response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response;
  },

  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.accessToken) {
      setAuthToken(response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response;
  },

  async logout() {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      await api.post('/auth/logout', { refreshToken });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setAuthToken(null);
    }
  },

  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('Sem refresh token');
    }

    const response = await api.post('/auth/refresh-token', { refreshToken });
    if (response.data.accessToken) {
      setAuthToken(response.data.accessToken);
    }
    return response;
  },

  async getProfile() {
    const response = await api.get('/auth/profile');
    if (response.data) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response;
  },

  async updateProfile(data) {
    const response = await api.put('/auth/profile', data);
    if (response.data) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response;
  },

  async changePassword(currentPassword, newPassword) {
    return await api.post('/auth/change-password', { currentPassword, newPassword });
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem('accessToken');
  }
};

export default authService;
