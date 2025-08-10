// FILE: frontend/src/App.tsx
// --------------------------
// This is the main component that sets up the application's routing.

import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import RFPDetailPage from './pages/RFPDetailPage'; // Import the new page
import { AuthProvider, useAuth } from './context/AuthContext';

const PrivateRoute = ({ children }: { children: React.ReactElement }) => {
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
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <DashboardPage />
                </PrivateRoute>
              }
            />
            {/* Add the new route with a dynamic parameter for the RFP ID */}
            <Route
              path="/rfp/:rfpId"
              element={
                <PrivateRoute>
                  <RFPDetailPage />
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