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
    getUserRegistrations: () => api.get('/registrations'),
    getAll: () => api.get('/admin/registrations'),
    updateStatus: (id, status) => 
        api.put(`/admin/registrations/${id}/status`, { status })
};

export { authApi, registrationApi };
export default api; 