/**
 * API Client
 * Axios instance with base URL, auth interceptor, and timeout handling.
 */

import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 60000, // 60s for AI calls
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request Interceptor: Attach JWT ─────────────────────
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('smarthire_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor: Handle errors globally ────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle token expiry
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('smarthire_token');
        localStorage.removeItem('smarthire_user');
        // Don't redirect if we're on the login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }

    // Enhance error message
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';

    return Promise.reject(new Error(message));
  }
);

export default api;
