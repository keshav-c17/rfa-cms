// FILE: frontend/src/components/modals/CreateRFPModal.tsx
// -------------------------------------------------------
// NEW: A modal component for the RFP creation form.

import React, { useState } from 'react';
import { createRFP } from '../../services/rfpService';

interface CreateRFPModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRfpCreated: () => void;
}

const CreateRFPModal: React.FC<CreateRFPModalProps> = ({ isOpen, onClose, onRfpCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('An RFP document is required.');
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      await createRFP(title, description, file);
      onRfpCreated();
      // Reset form
      setTitle('');
      setDescription('');
      setFile(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create RFP.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-10 overflow-y-auto bg-gray-500 bg-opacity-75 transition-opacity">
      <div className="flex items-center justify-center min-h-screen">
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Create New RFP</h3>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {error && <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg">{error}</div>}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                id="description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label htmlFor="file" className="block text-sm font-medium text-gray-700">RFP Document</label>
              <input
                type="file"
                id="file"
                onChange={handleFileChange}
                className="w-full mt-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                required
              />
            </div>
            <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Create'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateRFPModal;