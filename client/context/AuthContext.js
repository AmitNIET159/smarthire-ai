'use client';

/**
 * AuthContext
 * Provides authentication state and methods to the entire app.
 * Stores JWT in localStorage for persistence.
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Load user from localStorage on mount ──────────────
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('smarthire_user');
      const token = localStorage.getItem('smarthire_token');
      if (storedUser && token) {
        setUser(JSON.parse(storedUser));
      }
    } catch {
      localStorage.removeItem('smarthire_user');
      localStorage.removeItem('smarthire_token');
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Register ──────────────────────────────────────────
  const register = useCallback(async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    const { token, user: userData } = data.data;
    localStorage.setItem('smarthire_token', token);
    localStorage.setItem('smarthire_user', JSON.stringify(userData));
    setUser(userData);
    return data;
  }, []);

  // ── Login ─────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    const { token, user: userData } = data.data;
    localStorage.setItem('smarthire_token', token);
    localStorage.setItem('smarthire_user', JSON.stringify(userData));
    setUser(userData);
    return data;
  }, []);

  // ── Logout ────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem('smarthire_token');
    localStorage.removeItem('smarthire_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
