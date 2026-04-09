import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor — attach auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — auto-refresh token on 401
let isRefreshing = false;
let failedQueue = [];
// When true, the interceptor only clears storage on a failed refresh
// instead of forcing a window.location reload — used while AuthContext
// boots so the React tree can finish hydrating without flicker.
let silentMode = false;

export const setApiSilentMode = (enabled) => {
  silentMode = enabled;
};

const clearAuthAndRedirect = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  if (silentMode) return;
  window.location.href = '/login';
};

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

// Public auth endpoints — never try to refresh tokens for these,
// otherwise a failed login or expired refresh token causes a loop.
const SKIP_REFRESH_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh-token',
  '/auth/verify-email',
  '/auth/resend-code',
  '/auth/logout',
];

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;
    const url = originalRequest?.url || '';
    const isPublicAuth = SKIP_REFRESH_PATHS.some((p) => url.includes(p));

    if (error.response?.status === 401 && !originalRequest._retry && !isPublicAuth) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest._retry = true;
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        processQueue(new Error('No refresh token'));
        isRefreshing = false;
        clearAuthAndRedirect();
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(
          `${api.defaults.baseURL}/auth/refresh-token`,
          { refreshToken }
        );
        // API returns {success, data: {accessToken}} — axios wraps in .data
        const newToken = response.data?.data?.accessToken || response.data?.accessToken;
        if (!newToken) {
          throw new Error('No token in refresh response');
        }
        localStorage.setItem('accessToken', newToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        clearAuthAndRedirect();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const message = error.response?.data?.message || 'An error occurred';
    const errors = error.response?.data?.errors;

    return Promise.reject({
      message,
      errors,
      status: error.response?.status
    });
  }
);

export default api;
