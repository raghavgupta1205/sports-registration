import axios from './axios';

// Create cricket registration
export const createCricketRegistration = async (data) => {
  const response = await axios.post('/api/cricket-registrations', data);
  return response.data;
};

// Get cricket registration by event registration ID
export const getCricketRegistrationByEventId = async (eventRegistrationId) => {
  const response = await axios.get(`/api/cricket-registrations/event-registration/${eventRegistrationId}`);
  return response.data;
};

// Upload Aadhaar front photo
export const uploadAadhaarFront = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axios.post('/api/cricket-registrations/upload/aadhaar-front', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

// Upload Aadhaar back photo
export const uploadAadhaarBack = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axios.post('/api/cricket-registrations/upload/aadhaar-back', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

// Upload player photo
export const uploadPlayerPhoto = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axios.post('/api/cricket-registrations/upload/player-photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

