// FILE: frontend/src/pages/DashboardPage.tsx
// --------------------------
// The main dashboard page that conditionally renders Buyer or Supplier dashboards.

import React from 'react';
import { useAuth } from '../context/AuthContext';
import BuyerDashboard from '../components/layout/BuyerDashboard';
import SupplierDashboard from '../components/layout/SupplierDashboard';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { FullScreenLoader } from '../components/common/SkeletonLoader'; // Import the new loader

const DashboardPage: React.FC = () => {
  // Now `loading` exists in our AuthContextType
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // If still loading auth status, show the full-screen loader
  if (loading) {
    return <FullScreenLoader />;
  }

  // If not authenticated, redirect to the login page
  if (!user) {
    navigate('/login');
    return null;
  }

  // Based on the user's role, render the correct dashboard
  return (
    <Layout>
      {user?.role === 'Buyer' && <BuyerDashboard />}
      {user?.role === 'Supplier' && <SupplierDashboard />}
    </Layout>
  );
};

export default DashboardPage;
