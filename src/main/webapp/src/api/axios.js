import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add request interceptor to add token to all requests
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

// Add response interceptor to handle auth errors
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Clear auth data
            localStorage.removeItem('token');
            delete api.defaults.headers.common['Authorization'];
            
            // Only redirect if not already on login page
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

const authApi = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    me: () => api.get('/auth/me')
};

const registrationApi = {
    create: (data) => api.post('/registrations', data),
    getUserRegistrations: () => api.get('/registrations')
};

const buildQueryString = (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, value);
        }
    });
    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
};

const adminApi = {
    getRegistrations: (params = {}) =>
        api.get(`/admin/registrations${buildQueryString(params)}`),
    getRegistrationDetail: (id) => api.get(`/admin/registrations/${id}`),
    updateRegistrationStatus: (id, status) =>
        api.patch(`/admin/registrations/${id}`, { status })
};

const uploadBadmintonFile = (path, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/badminton/registrations/upload/${path}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

const badmintonApi = {
    getCategories: (eventId) => api.get(`/badminton/events/${eventId}/categories`),
    getRegistration: (eventId) => api.get(`/badminton/registrations/event/${eventId}`),
    completeRegistration: (payload) => api.post('/badminton/registrations/complete', payload),
    uploadAadhaarFront: (file) => uploadBadmintonFile('aadhaar-front', file),
    uploadAadhaarBack: (file) => uploadBadmintonFile('aadhaar-back', file),
    uploadPlayerPhoto: (file) => uploadBadmintonFile('player-photo', file)
};

export { authApi, registrationApi, adminApi, badmintonApi };
export default api; 