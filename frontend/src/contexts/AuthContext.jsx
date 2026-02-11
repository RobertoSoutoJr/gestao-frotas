import { createContext, useState, useEffect } from 'react';
import authService from '../services/auth';

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Carregar usuário do localStorage
    const loadUser = () => {
      const storedUser = authService.getCurrentUser();
      const token = localStorage.getItem('accessToken');

      if (storedUser && token) {
        setUser(storedUser);
        setIsAuthenticated(true);
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const register = async (data) => {
    const response = await authService.register(data);
    setUser(response.data.user);
    setIsAuthenticated(true);
    return response;
  };

  const login = async (email, password) => {
    const response = await authService.login(email, password);
    setUser(response.data.user);
    setIsAuthenticated(true);
    return response;
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

  const value = {
    user,
    loading,
    isAuthenticated,
    register,
    login,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
