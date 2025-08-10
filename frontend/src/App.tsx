// FILE: frontend/src/App.tsx
// --------------------------
// This is the main component that sets up the application's routing.

import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import { AuthProvider, useAuth } from './context/AuthContext';

// A simple component to protect routes
const PrivateRoute = ({ children }: { children: React.JSX.Element }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="bg-gray-50 min-h-screen">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            {/* Add a placeholder for the dashboard later */}
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <div><h1>Dashboard (Protected)</h1></div>
                </PrivateRoute>
              } 
            />
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;