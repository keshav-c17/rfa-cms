import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getRFPs, deleteRFP, updateRFPStatus } from '../../services/rfpService';
import CreateRFPModal from '../modals/CreateRFPModal';

interface RFP {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
}

const BuyerDashboard: React.FC = () => {
  const [rfps, setRfps] = useState<RFP[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchRfps = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getRFPs();
      setRfps(response.data);
    } catch (err) {
      setError('Failed to fetch RFPs.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRfps();
  }, [fetchRfps]);

  const handleRfpCreated = () => {
    setIsModalOpen(false);
    fetchRfps();
  };

  const handleDelete = async (rfpId: string) => {
    if (window.confirm('Are you sure you want to delete this draft RFP?')) {
      try {
        await deleteRFP(rfpId);
        fetchRfps();
      } catch (err) {
        alert('Failed to delete RFP. It might not be a draft.');
      }
    }
  };

  const handlePublish = async (rfpId: string) => {
    if (window.confirm('Are you sure you want to publish this RFP? It will become visible to all suppliers.')) {
      try {
        await updateRFPStatus(rfpId, 'Published');
        fetchRfps(); // Refresh the list to show the new status
      } catch (err) {
        alert('Failed to publish RFP.');
      }
    }
  };
  
  // Helper to get status colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Published':
        return 'bg-green-100 text-green-800';
      case 'Approved':
        return 'bg-indigo-100 text-indigo-800';
      case 'Draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'Response Submitted':
        return 'bg-blue-100 text-blue-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="text-center p-4">Loading your RFPs...</div>;
  if (error) return <div className="text-center p-4 text-red-500">{error}</div>;

  return (
    <>
      <CreateRFPModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRfpCreated={handleRfpCreated}
      />
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-xl font-semibold text-gray-900">My RFPs</h1>
            <p className="mt-2 text-sm text-gray-700">A list of all the RFPs you have created.</p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
            >
              Create RFP
            </button>
          </div>
        </div>
        <div className="mt-8 flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Title</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Created</th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {rfps.length > 0 ? rfps.map((rfp) => (
                      <tr key={rfp.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{rfp.title}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusColor(rfp.status)}`}>
                            {rfp.status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{new Date(rfp.created_at).toLocaleDateString()}</td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 space-x-4">
                          <Link to={`/rfp/${rfp.id}`} className="text-indigo-600 hover:text-indigo-900">
                            View
                          </Link>
                          {rfp.status === 'Draft' && (
                            <>
                              <button onClick={() => handlePublish(rfp.id)} className="text-green-600 hover:text-green-900">
                                Publish
                              </button>
                              <button onClick={() => handleDelete(rfp.id)} className="text-red-600 hover:text-red-900">
                                Delete
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={4} className="text-center py-4 text-sm text-gray-500">You haven't created any RFPs yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BuyerDashboard;