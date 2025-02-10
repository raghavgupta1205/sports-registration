import api from './api';

export const registerForEvent = async (data) => {
  try {
    const response = await api.post('/api/registrations', {
      eventId: data.eventId
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getActiveEvents = async () => {
  try {
    const response = await api.get('/api/events/active');
    return response.data;
  } catch (error) {
    throw error;
  }
}; 