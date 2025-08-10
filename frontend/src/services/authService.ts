// FILE: frontend/src/services/authService.ts
// ------------------------------------------
// This file contains functions for authentication-related API calls.

import api from './api';

interface UserData {
  username: string;
  email: string;
  password: string;
  role: 'Buyer' | 'Supplier';
}

export const register = (userData: UserData) => {
  return api.post('/auth/register', userData);
};

export const login = (email: string, password: string) => {
  const params = new URLSearchParams();
  params.append('username', email); // The backend expects 'username' for the email field in OAuth2 form
  params.append('password', password);
  return api.post('/auth/login', params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
};