'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi, setToken, clearToken, type User, type Student } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  student: Student | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  student: null,
  loading: true,
  login: async () => {},
  logout: () => {},
  refresh: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const { user: u } = await authApi.me();
      setUser(u);
      setStudent(u.student || null);
    } catch {
      setUser(null);
      setStudent(null);
      clearToken();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) refresh();
    else setLoading(false);
  }, [refresh]);

  const login = async (email: string, password: string) => {
    const { token, user: u } = await authApi.login(email, password);
    setToken(token);
    await refresh();
  };

  const logout = () => {
    clearToken();
    setUser(null);
    setStudent(null);
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ user, student, loading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
