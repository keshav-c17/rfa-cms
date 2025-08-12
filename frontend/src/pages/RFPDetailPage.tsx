// FILE: frontend/src/pages/RFPDetailPage.tsx
// ------------------------------------------
// This page displays the details of a single RFP and its responses.

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getRFPById, getResponsesForRFP, updateResponseStatus, submitResponse, updateRFPStatus } from '../services/rfpService';
import Layout from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';

// Get the base API URL from environment variables for constructing document links
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000';

// Define types for our data structures
interface RFP {
  id: string;
  title: string;
  description: string;
  status: string;
  document_url: string;
}

interface Response {
  id: string;
  supplier_id: string;
  response_text: string;
  document_url: string;
  status: 'Submitted' | 'Approved' | 'Rejected';
}

const RFPDetailPage: React.FC = () => {
  const { rfpId } = useParams<{ rfpId: string }>();
  const { user } = useAuth(); // Get the current user
  const [rfp, setRfp] = useState<RFP | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for the supplier's response form
  const [responseText, setResponseText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);


  const fetchData = useCallback(async () => {
    if (!rfpId) return;
    try {
      setLoading(true);
      const rfpResponse = await getRFPById(rfpId);
      setRfp(rfpResponse.data);
      // Only fetch responses if the user is a Buyer
      if (user?.role === 'Buyer') {
        const responsesResponse = await getResponsesForRFP(rfpId);
        setResponses(responsesResponse.data);
      }
    } catch (err) {
      setError('Failed to load RFP details.');
    } finally {
      setLoading(false);
    }
  }, [rfpId, user?.role]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleResponseStatusUpdate = async (responseId: string, status: 'Approved' | 'Rejected') => {
    if (!rfpId) return;
    try {
        await updateResponseStatus(rfpId, responseId, status);
        fetchData();
    } catch (err) {
        alert('Failed to update response status.');
    }
  };

  // Handler for the "Begin Review" button
  const handleBeginReview = async () => {
    if (!rfpId) return;
    try {
      await updateRFPStatus(rfpId, 'Under Review');
      fetchData();
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleResponseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !rfpId) {
      setSubmitError('Please provide a response text and a document.');
      return;
    }
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      await submitResponse(rfpId, responseText, file);
      setSubmitSuccess('Your response has been submitted successfully!');
      // Optionally, disable the form or redirect
    } catch (err: any) {
      setSubmitError(err.response?.data?.detail || 'Failed to submit response.');
    }
  };

  if (loading) return <Layout><div className="text-center p-4">Loading RFP details...</div></Layout>;
  if (error) return <Layout><div className="text-center p-4 text-red-500">{error}</div></Layout>;
  if (!rfp) return <Layout><div className="text-center p-4">RFP not found.</div></Layout>;

  return (
    <Layout>
      <div className="p-4 sm:p-6 lg:p-8">
        <Link to="/dashboard" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 mb-4 inline-block">&larr; Back to Dashboard</Link>
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{rfp.title}</h1>
              <p className="mt-1 text-sm text-gray-500">Status: <span className="font-medium text-gray-900">{rfp.status}</span></p>
            </div>
            {user?.role === 'Buyer' && rfp.status === 'Response Submitted' && (
              <button
                onClick={handleBeginReview}
                className="ml-4 inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Begin Review
              </button>
            )}
          </div>
          <p className="mt-4 text-base text-gray-600">{rfp.description}</p>
          <a href={rfp.document_url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 font-medium mt-4 inline-block">
            View RFP Document
          </a>
        </div>

        {/* Conditional Rendering based on Role */}
        {user?.role === 'Buyer' && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900">Submitted Responses</h2>
            {responses.length > 0 ? (
              <ul className="mt-4 space-y-4">
                {responses.map((response) => (
                  <li key={response.id} className="bg-white shadow overflow-hidden sm:rounded-lg p-4">
                    <p className="text-sm text-gray-600">{response.response_text}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <a href={response.document_url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                        View Response Document
                      </a>
                      <div className="flex items-center space-x-2">
                          {/* Only show Approve/Reject buttons when the RFP is 'Under Review' */}
                          {rfp.status === 'Under Review' && response.status === 'Submitted' && (
                              <>
                                  <button onClick={() => handleResponseStatusUpdate(response.id, 'Approved')} className="px-3 py-1 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700">Approve</button>
                                  <button onClick={() => handleResponseStatusUpdate(response.id, 'Rejected')} className="px-3 py-1 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">Reject</button>
                              </>
                          )}
                          {response.status !== 'Submitted' && (
                              <span className={`text-sm font-semibold ${response.status === 'Approved' ? 'text-green-700' : 'text-red-700'}`}>{response.status}</span>
                          )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-gray-500">No responses have been submitted for this RFP yet.</p>
            )}
          </div>
        )}
        {/* The form is now visible if the status is 'Published' OR 'Response Submitted' */}
        {user?.role === 'Supplier' && ['Published', 'Response Submitted'].includes(rfp.status) && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900">Submit Your Response</h2>
            {submitSuccess ? (
              <div className="mt-4 bg-white shadow p-6 rounded-lg">
                <div className="p-3 text-sm text-green-700 bg-green-100 rounded-lg">{submitSuccess}</div>
              </div>
            ) : (
              <form onSubmit={handleResponseSubmit} className="mt-4 bg-white shadow p-6 rounded-lg space-y-4">
                {submitError && <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg">{submitError}</div>}
                <div>
                  <label htmlFor="responseText" className="block text-sm font-medium text-gray-700">Your Message</label>
                  <textarea
                    id="responseText"
                    rows={4}
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="file" className="block text-sm font-medium text-gray-700">Your Proposal Document</label>
                  <input
                    type="file"
                    id="file"
                    onChange={handleFileChange}
                    className="w-full mt-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Submit Response
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default RFPDetailPage;