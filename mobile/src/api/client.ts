import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import Constants from 'expo-constants';
import { storage } from '../lib/storage';

const API_URL =
  (Constants.expoConfig?.extra?.apiUrl as string | undefined) ??
  'https://srv1443418.hstgr.cloud/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach auth token
api.interceptors.request.use(
  async (config) => {
    const token = await storage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — auto-refresh token on 401
// Mirrors frontend/src/services/api.js lines 34-94

type QueueItem = {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
};

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else if (token) resolve(token);
  });
  failedQueue = [];
};

// onUnauthorized is set by AuthContext so we can navigate to /login on refresh failure
let onUnauthorized: (() => void) | null = null;
export const setUnauthorizedHandler = (handler: (() => void) | null) => {
  onUnauthorized = handler;
};

api.interceptors.response.use(
  (response) => response.data, // unwrap to {success, data, message}
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/')
    ) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest._retry = true;
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = await storage.getRefreshToken();
      if (!refreshToken) {
        processQueue(new Error('No refresh token'));
        isRefreshing = false;
        await storage.clearAuth();
        onUnauthorized?.();
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${API_URL}/auth/refresh-token`, {
          refreshToken,
        });
        // API returns {success, data: {accessToken}} — axios wraps in .data
        const newToken: string | undefined =
          response.data?.data?.accessToken ?? response.data?.accessToken;
        if (!newToken) {
          throw new Error('No token in refresh response');
        }
        await storage.setAccessToken(newToken);
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        await storage.clearAuth();
        onUnauthorized?.();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const message =
      (error.response?.data as { message?: string } | undefined)?.message ??
      error.message ??
      'Erro ao conectar';
    const errors = (error.response?.data as { errors?: unknown } | undefined)?.errors;

    return Promise.reject({
      message,
      errors,
      status: error.response?.status,
    });
  }
);

// Helper to unwrap the data payload — after the response interceptor,
// api.get() returns the full envelope; this strips it to just .data
export async function apiGet<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = (await api.get(url, config)) as unknown as { data: T };
  return res.data;
}

export async function apiPost<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const res = (await api.post(url, body, config)) as unknown as { data: T };
  return res.data;
}

export async function apiPut<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const res = (await api.put(url, body, config)) as unknown as { data: T };
  return res.data;
}

export async function apiPatch<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const res = (await api.patch(url, body, config)) as unknown as { data: T };
  return res.data;
}

export async function apiDelete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = (await api.delete(url, config)) as unknown as { data: T };
  return res.data;
}
