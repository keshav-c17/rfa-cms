// FILE: frontend/src/components/layout/SupplierDashboard.tsx
// --------------------------
// This component displays the dashboard for a Supplier user.
// It fetches all published RFPs from the backend API.

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getRFPs, getMySubmissions, searchRFPs } from '../../services/rfpService';
import { SupplierSkeleton } from '../common/SkeletonLoader'; // Import the skeleton loader

// Interfaces remain the same
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
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const fetchInitialData = useCallback(async () => {
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
    fetchInitialData();
  }, [fetchInitialData]);

  const availableRfps = useMemo(() => {
    const submittedRfpIds = new Set(submissions.map(sub => sub.rfp_id));
    return rfps.filter(rfp => !submittedRfpIds.has(rfp.id));
  }, [rfps, submissions]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchInitialData();
      return;
    }
    
    try {
      setIsSearching(true);
      setError(null);
      const response = await searchRFPs(searchQuery);
      setRfps(response.data);
    } catch (err) {
      setError('Failed to perform search.');
    } finally {
      setIsSearching(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      case 'Submitted': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Use the skeleton loader while fetching data
  if (loading) return <SupplierSkeleton />;
  if (error) return <div className="text-center p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-12">
      {/* My Submissions Section */}
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

      {/* Available RFPs Section with Search */}
      <div>
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Available RFPs</h2>
            <p className="mt-2 text-sm text-gray-700">A list of all published RFPs open for responses.</p>
          </div>
          <form onSubmit={handleSearch} className="mt-4 sm:mt-0 flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keyword..."
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="ml-2 px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
            >
              {isSearching ? '...' : 'Search'}
            </button>
          </form>
        </div>
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
              No published RFPs found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupplierDashboard;
