import api from './api';

export const auth = {
  changePassword: (data) => api.post('/auth/change-password', data),
  resetPassword: (email) => api.post('/auth/reset-password/request', { email }),
  confirmResetPassword: (token, password) => api.post('/auth/reset-password/confirm', { token, password })
};

export default auth; 