import { createContext, useState, useEffect } from 'react';
import authService from '../services/auth';
import { setApiSilentMode } from '../services/api';

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(null); // email aguardando verificação

  useEffect(() => {
    const loadUser = async () => {
      const storedUser = authService.getCurrentUser();
      const token = localStorage.getItem('accessToken');

      if (!storedUser || !token) {
        setLoading(false);
        return;
      }

      // Validate the stored token by fetching the profile. If both the
      // access token and the refresh token are dead, the api interceptor
      // will silently clear storage (silentMode prevents the page reload
      // mid-boot) and we just stay logged out — no toast, no flicker.
      setApiSilentMode(true);
      try {
        const response = await authService.getProfile();
        const freshUser = response?.data || storedUser;
        setUser(freshUser);
        setIsAuthenticated(true);
      } catch {
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setApiSilentMode(false);
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const register = async (data) => {
    const response = await authService.register(data);
    // Não autentica ainda — precisa verificar email
    setPendingVerification(data.email);
    return response;
  };

  const verifyEmail = async (email, code) => {
    const response = await authService.verifyEmail(email, code);
    setUser(response.data.user);
    setIsAuthenticated(true);
    setPendingVerification(null);
    return response;
  };

  const resendCode = async (email) => {
    return await authService.resendCode(email);
  };

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      setUser(response.data.user);
      setIsAuthenticated(true);
      return response;
    } catch (err) {
      // Se o erro for 403, email não verificado
      if (err.status === 403) {
        setPendingVerification(email);
      }
      throw err;
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const cancelVerification = () => {
    setPendingVerification(null);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    pendingVerification,
    register,
    verifyEmail,
    resendCode,
    login,
    logout,
    updateUser,
    cancelVerification
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
