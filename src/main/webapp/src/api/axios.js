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
    me: () => api.get('/auth/me'),
    changePassword: (payload) => api.post('/auth/change-password', payload)
};

const registrationApi = {
    create: (data) => api.post('/registrations', data),
    getUserRegistrations: () => api.get('/registrations'),
    getProfileHistory: () => api.get('/registrations/user'),
    getProfileBadmintonEntries: () => api.get('/registrations/user/badminton')
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

const badmintonApi = {
    getCategories: () => api.get('/badminton-registrations/categories'),
    submitBundle: (payload) => api.post('/badminton-registrations/complete', payload),
    createOrder: (bundleId) => api.post('/badminton-registrations/order', { bundleId }),
    verifyPayment: (payload) => api.post('/badminton-registrations/verify', payload),
    getPendingBundle: (eventId) => api.get(`/badminton-registrations/pending/${eventId}`),
    uploadPlayerPhoto: (formData) =>
        api.post('/badminton-registrations/upload/player-photo', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
};

const userApi = {
    search: (query) => api.get(`/users/search${buildQueryString({ query })}`)
};

export { authApi, registrationApi, adminApi, badmintonApi, userApi };
export default api; 