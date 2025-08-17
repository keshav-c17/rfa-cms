// FILE: frontend/src/services/rfpService.ts
// -----------------------------------------
// This file contains functions for RFP-related API calls.

import api from './api';

export const getRFPs = () => {
  return api.get('/rfps/');
};

export const getMySubmissions = () => {
  return api.get('/rfps/submissions/my');
};

export const searchRFPs = (query: string) => {
  return api.get('/rfps/search', { params: { q: query } });
};

export const getRFPById = (rfpId: string) => {
  return api.get(`/rfps/${rfpId}`);
};

export const getResponsesForRFP = (rfpId: string) => {
  return api.get(`/rfps/${rfpId}/responses`);
};

export const createRFP = (title: string, description: string, file: File) => {
  const formData = new FormData();
  formData.append('title', title);
  formData.append('description', description);
  formData.append('file', file);

  return api.post('/rfps/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const updateRFPStatus = (rfpId: string, status: string) => {
  return api.patch(`/rfps/${rfpId}/status`, { status });
};

export const updateResponseStatus = (rfpId: string, responseId: string, status: 'Approved' | 'Rejected') => {
  return api.patch(`/rfps/${rfpId}/responses/${responseId}/status`, { status });
};

export const deleteRFP = (rfpId: string) => {
  return api.delete(`/rfps/${rfpId}`);
};

export const submitResponse = (rfpId: string, responseText: string, file: File) => {
  const formData = new FormData();
  formData.append('response_text', responseText);
  formData.append('file', file);

  return api.post(`/rfps/${rfpId}/responses`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};