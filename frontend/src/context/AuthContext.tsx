// FILE: frontend/src/context/AuthContext.tsx
// ------------------------------------------
// Manages global authentication state (token, user info).

import React, { createContext, useState, useContext, ReactNode } from 'react';
import { login as loginService } from '../services/authService';
import { jwtDecode } from 'jwt-decode';

interface AuthContextType {
  token: string | null;
  user: { email: string; role: string } | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<{ email: string; role: string } | null>(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      return jwtDecode(storedToken);
    }
    return null;
  });

  const login = async (email: string, password: string) => {
    const response = await loginService(email, password);
    const { access_token } = response.data;
    localStorage.setItem('token', access_token);
    setToken(access_token);
    setUser(jwtDecode(access_token));
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};