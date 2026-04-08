import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { router } from 'expo-router';
import { authApi } from '../api/auth';
import { api, setUnauthorizedHandler } from '../api/client';
import { storage } from '../lib/storage';
import type { User } from '../api/types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Hydrate stored session on mount
  useEffect(() => {
    (async () => {
      try {
        const token = await storage.getAccessToken();
        const storedUser = await storage.getUser<User>();
        if (token && storedUser) {
          api.defaults.headers.common.Authorization = `Bearer ${token}`;
          setUser(storedUser);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Wire axios 401 handler to reset navigation
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
      router.replace('/(auth)/login');
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await authApi.login(email, password);
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
    router.replace('/(auth)/login');
  }, []);

  const refreshProfile = useCallback(async () => {
    const fresh = await authApi.getProfile();
    setUser(fresh);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
