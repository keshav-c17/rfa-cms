// FILE: frontend/src/services/rfpService.ts
// -----------------------------------------
// This file contains functions for RFP-related API calls.

import api from './api';

export const getRFPs = () => {
  return api.get('/rfps/');
};

export const createRFP = (title: string, description: string, file: File) => {
  const formData = new FormData();
  formData.append('title', title);
  formData.append('description', description);
  formData.append('file', file);

  return api.post('/rfps/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};