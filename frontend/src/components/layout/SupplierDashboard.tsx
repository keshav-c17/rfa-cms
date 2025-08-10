// FILE: frontend/src/components/layout/SupplierDashboard.tsx
// --------------------------
// This component displays the dashboard for a Supplier user.
// It fetches all published RFPs from the backend API.

import React, { useState, useEffect } from 'react';
import { getRFPs } from '../../services/rfpService';

interface RFP {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
}

const SupplierDashboard: React.FC = () => {
  const [rfps, setRfps] = useState<RFP[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRfps = async () => {
      try {
        const response = await getRFPs();
        setRfps(response.data);
      } catch (err) {
        setError('Failed to fetch available RFPs.');
      } finally {
        setLoading(false);
      }
    };

    fetchRfps();
  }, []);

  if (loading) return <div className="text-center p-4">Loading available RFPs...</div>;
  if (error) return <div className="text-center p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
        <h1 className="text-xl font-semibold text-gray-900">Available RFPs</h1>
        <p className="mt-2 text-sm text-gray-700">A list of all published RFPs open for responses.</p>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rfps.length > 0 ? rfps.map(rfp => (
                <div key={rfp.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">{rfp.title}</h3>
                    <p className="mt-2 text-sm text-gray-600 line-clamp-3">{rfp.description}</p>
                    <div className="mt-4 flex justify-between items-center">
                        <span className="text-xs text-gray-500">Published on: {new Date(rfp.created_at).toLocaleDateString()}</span>
                        <button className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                            View Details
                        </button>
                    </div>
                </div>
            )) : (
                <p className="col-span-full text-center text-gray-500">No published RFPs are available at the moment.</p>
            )}
        </div>
    </div>
  );
};

export default SupplierDashboard;
