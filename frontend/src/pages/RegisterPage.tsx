// FILE: frontend/src/pages/RegisterPage.tsx
// -----------------------------------------
// This component renders the user registration form.

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { register } from '../services/authService';

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'Buyer' | 'Supplier'>('Buyer');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const userData = { username, email, password, role };
      await register(userData);
      setSuccess('Registration successful! You can now log in.');
      setUsername('');
      setEmail('');
      setPassword('');
      setRole('Buyer');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'An unexpected error occurred.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900">Create an Account</h2>
        
        {error && <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">{error}</div>}
        {success && <div className="p-3 text-sm text-green-700 bg-green-100 rounded-lg" role="alert">{success}</div>}
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Form fields remain the same */}
          <div>
            <label htmlFor="username" className="text-sm font-medium text-gray-700">Username</label>
            <input id="username" type="text" required value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
          </div>
          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-700">Email address</label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
            <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">I am a...</label>
            <div className="flex items-center mt-2 space-x-4">
              <label className="flex items-center">
                <input type="radio" name="role" value="Buyer" checked={role === 'Buyer'} onChange={() => setRole('Buyer')} className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"/>
                <span className="ml-2 text-gray-700">Buyer</span>
              </label>
              <label className="flex items-center">
                <input type="radio" name="role" value="Supplier" checked={role === 'Supplier'} onChange={() => setRole('Supplier')} className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"/>
                <span className="ml-2 text-gray-700">Supplier</span>
              </label>
            </div>
          </div>
          <div>
            <button type="submit" className="w-full px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Register
            </button>
          </div>
        </form>
        <p className="text-sm text-center text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;