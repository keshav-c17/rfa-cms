// FILE: frontend/src/services/api.ts
// ----------------------------------
// This file configures our Axios instance for making API calls.

import axios from 'axios';

// Create a new Axios instance with a base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/api',
});

// Add a request interceptor to include the token in headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Export the default API instance for other services (like authService)
export default api;

// Define the complete shape of an RFP based on the backend model
interface RFP {
    _id: string;
    title: string;
    description: string;
    status: 'Draft' | 'Published' | 'Response Submitted' | 'Under Review' | 'Approved' | 'Rejected';
    buyer_id: string;
    document_url: string | null;
    created_at: string;
}



// Named exports for specific, organized API functions
export const getBuyerRFPs = async (): Promise<RFP[]> => {
    try {
        const response = await api.get('/rfps');
        return response.data;
    } catch (error) {
        console.error("API Call failed:", error);
        throw error;
    }
};

export const getPublishedRFPs = async (): Promise<RFP[]> => {
    try {
        const response = await api.get('/rfps');
        return response.data;
    } catch (error) {
        console.error("API Call failed:", error);
        throw error;
    }
};

// Function to create a new RFP with a file upload
export const createRFP = async (title: string, description: string, file: File) => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('file', file);

    try {
        const response = await api.post('/rfps', formData, {
            headers: {
                // This header is crucial for FastAPI to correctly parse the file upload
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error("Failed to create RFP:", error);
        throw error;
    }
};
