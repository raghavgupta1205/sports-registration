import axios from 'axios';

const api = axios.create({
  baseURL: '/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  resetPassword: (email) => api.post('/auth/reset-password/request', null, { params: { email } }),
  confirmReset: (token, newPassword) => 
    api.post('/auth/reset-password/confirm', null, { params: { token, newPassword } })
};

export const registration = {
  create: (data) => api.post('/registrations', data),
  getAll: () => api.get('/registrations'),
  getById: (id) => api.get(`/registrations/${id}`)
};

export const payment = {
  initiate: (data) => api.post('/payments/initiate', data),
  verify: (data) => api.post('/payments/verify', data),
  getHistory: () => api.get('/payments/history'),
  downloadReceipt: (id) => api.get(`/payments/${id}/receipt`, { responseType: 'blob' })
};

export default api; 