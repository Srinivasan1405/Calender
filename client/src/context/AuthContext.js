import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await authAPI.getMe();
          if (!cancelled) setUser(response.data);
        } catch (err) {
          console.error('Auth error:', err);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      if (!cancelled) setLoading(false);
    };
    initAuth();
    return () => { cancelled = true; };
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      setError(null);
      const response = await authAPI.login({ email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.msg || 'Login failed';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    try {
      setError(null);
      const response = await authAPI.register({ name, email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.msg || 'Registration failed';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const updateDefaultRoutine = useCallback(async (defaultRoutine) => {
    try {
      const response = await authAPI.updateDefaultRoutine({ defaultRoutine });
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.msg || 'Update failed';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateDefaultRoutine,
    isAuthenticated: !!user,
  }), [user, loading, error, login, register, logout, updateDefaultRoutine]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};