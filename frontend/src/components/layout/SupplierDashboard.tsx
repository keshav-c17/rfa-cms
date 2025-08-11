// FILE: frontend/src/components/layout/SupplierDashboard.tsx
// --------------------------
// This component displays the dashboard for a Supplier user.
// It fetches all published RFPs from the backend API.

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getRFPs, getMySubmissions } from '../../services/rfpService';

// Define the shape of the data we expect
interface RFP {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
}

interface Submission {
  id: string;
  rfp_id: string;
  status: string;
  rfp_title: string;
}

const SupplierDashboard: React.FC = () => {
  const [rfps, setRfps] = useState<RFP[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [rfpResponse, submissionResponse] = await Promise.all([
        getRFPs(),
        getMySubmissions(),
      ]);
      setRfps(rfpResponse.data);
      setSubmissions(submissionResponse.data);
    } catch (err) {
      setError('Failed to fetch dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Memoize the filtered list of available RFPs to avoid re-calculating on every render.
  const availableRfps = useMemo(() => {
    // Create a set of RFP IDs that the supplier has already submitted a response to.
    const submittedRfpIds = new Set(submissions.map(sub => sub.rfp_id));
    // Filter the main RFP list to exclude any that are in the submitted set.
    return rfps.filter(rfp => !submittedRfpIds.has(rfp.id));
  }, [rfps, submissions]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Submitted':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="text-center p-4">Loading dashboard...</div>;
  if (error) return <div className="text-center p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-12">
      {/* My Submissions Section (no changes here) */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">My Submissions</h2>
        <p className="mt-2 text-sm text-gray-700">The status of RFPs you have responded to.</p>
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {submissions.length > 0 ? submissions.map((sub) => (
            <div key={sub.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <p className="text-sm text-gray-500">Response to RFP</p>
              <h3 className="text-lg font-semibold text-gray-900 truncate" title={sub.rfp_title}>{sub.rfp_title}</h3>
              <div className="mt-4 flex justify-between items-center">
                <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusColor(sub.status)}`}>
                  {sub.status}
                </span>
                <Link to={`/rfp/${sub.rfp_id}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                  View RFP
                </Link>
              </div>
            </div>
          )) : (
            <div className="col-span-full text-center text-gray-500 bg-gray-50 py-8 rounded-lg">
              You have not submitted any responses yet.
            </div>
          )}
        </div>
      </div>

      {/* Available RFPs Section (now uses the filtered list) */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Available RFPs</h2>
        <p className="mt-2 text-sm text-gray-700">A list of all published RFPs open for responses.</p>
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {availableRfps.length > 0 ? availableRfps.map(rfp => (
            <div key={rfp.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">{rfp.title}</h3>
              <p className="mt-2 text-sm text-gray-600 line-clamp-3">{rfp.description}</p>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-xs text-gray-500">Published on: {new Date(rfp.created_at).toLocaleDateString()}</span>
                <Link to={`/rfp/${rfp.id}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                  View Details
                </Link>
              </div>
            </div>
          )) : (
            <div className="col-span-full text-center text-gray-500 bg-gray-50 py-8 rounded-lg">
              No new RFPs are available for you to respond to.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupplierDashboard;
