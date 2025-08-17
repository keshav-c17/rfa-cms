// FILE: frontend/src/components/common/SkeletonLoader.tsx
// -------------------------------------------------------
// A reusable skeleton loader component for dashboards.

import React from 'react';

// NEW: A skeleton loader for the RFP Detail Page.
export const RFPDetailSkeleton: React.FC = () => (
  <div className="p-4 sm:p-6 lg:p-8 animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
    <div className="bg-white shadow rounded-lg p-6">
      <div className="h-8 bg-gray-300 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
      <div className="h-4 bg-gray-200 rounded w-1/4 mt-4"></div>
    </div>
    <div className="mt-8">
      <div className="h-6 bg-gray-300 rounded w-1/2 mb-4"></div>
      <div className="space-y-4">
        <div className="h-24 bg-gray-200 rounded-lg"></div>
        <div className="h-24 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  </div>
);


// A full-screen loader for the initial app authentication check.
export const FullScreenLoader: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
    <svg className="animate-spin h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <p className="mt-4 text-lg text-gray-700">Loading Application...</p>
  </div>
);

// A spinner for form submissions, with customizable text
interface FormSpinnerProps {
  text?: string;
}
export const FormSpinner: React.FC<FormSpinnerProps> = ({ text = 'Processing...' }) => (
  <div className="flex flex-col items-center justify-center py-10">
    <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <p className="mt-4 text-sm text-gray-600">{text}</p>
  </div>
);


// Skeleton for the Buyer's table view
export const BuyerSkeleton: React.FC = () => (
  <div className="p-4 sm:p-6 lg:p-8">
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 rounded"></div>
        ))}
      </div>
    </div>
  </div>
);

// Skeleton for the Supplier's card view
export const SupplierSkeleton: React.FC = () => (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-36 rounded-lg"></div>
          ))}
        </div>
      </div>
    </div>
);