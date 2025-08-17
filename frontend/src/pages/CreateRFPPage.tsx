// FILE: frontend/src/pages/CreateRFPPage.tsx
// --------------------------
// This component provides a form for a Buyer to create a new RFP.
// It includes text inputs and a file upload field.

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRFP } from '../services/rfpService'; // Corrected import path
import { useAuth } from '../context/AuthContext';
import { FormSpinner } from '../components/common/SkeletonLoader'; // Import the spinner

const CreateRFPPage: React.FC = () => {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect if not a buyer
  if (user?.role !== 'Buyer') {
    navigate('/dashboard');
    return null;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!title || !description || !file) {
      setError('All fields are required.');
      return;
    }

    setLoading(true);
    try {
      await createRFP(title, description, file);
      setSuccess('RFP created successfully! You will be redirected to your dashboard.');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Failed to create RFP:', err);
      setError('Failed to create RFP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto mt-8 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">Create New RFP</h2>
      
      {loading ? (
        <FormSpinner text="Creating RFP..." />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
          </div>
          <div>
            <label htmlFor="file" className="block text-sm font-medium text-gray-700">
              RFP Document
            </label>
            <input
              id="file"
              type="file"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {file && <p className="mt-2 text-sm text-gray-500">Selected file: {file.name}</p>}
          </div>
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          {success && <div className="text-green-500 text-sm text-center">{success}</div>}
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Create RFP
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CreateRFPPage;
