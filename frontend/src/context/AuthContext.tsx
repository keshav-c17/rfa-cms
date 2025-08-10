// FILE: frontend/src/context/AuthContext.tsx
// ------------------------------------------
// Manages global authentication state (token, user info).

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { login as loginService } from '../services/authService';
import { jwtDecode } from 'jwt-decode';

// Define the new shape of our context, including the `loading` state
interface AuthContextType {
  token: string | null;
  user: { email: string; role: string } | null;
  loading: boolean; // Added the loading state
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<{ email: string; role: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // Initialize loading state

  // Use useEffect to handle initial token check and user loading
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        setUser(jwtDecode(storedToken));
      }
    } catch (error) {
      console.error("Failed to decode token:", error);
      // If token is invalid, clear it
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    } finally {
      // Set loading to false once the check is complete
      setLoading(false);
    }
  }, []);

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
    <AuthContext.Provider value={{ token, user, loading, login, logout }}>
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
