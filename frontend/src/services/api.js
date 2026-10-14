import axios from 'axios';

/**
 * Axios instance configured with the backend API base URL.
 * Automatically attaches the JWT token from localStorage to every request.
 */
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor: attach JWT token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor: handle 401 errors (expired/invalid token)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Only redirect if not already on login/register page
            if (!window.location.pathname.includes('/login') &&
                !window.location.pathname.includes('/register')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;

// ============================================================
// AUTH API
// ============================================================

export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
};

// ============================================================
// STUDENT API
// ============================================================

export const studentAPI = {
    submitComplaint: (data) => api.post('/student/complaints', data),
    getMyComplaints: () => api.get('/student/complaints'),
    getComplaintById: (id) => api.get(`/student/complaints/${id}`),
};

// ============================================================
// ADMIN API
// ============================================================

export const adminAPI = {
    getAllComplaints: () => api.get('/admin/complaints'),
    getComplaintById: (id) => api.get(`/admin/complaints/${id}`),
    assignComplaint: (id, data) => api.post(`/admin/complaints/${id}/assign`, data),
    rejectComplaint: (id, data) => api.post(`/admin/complaints/${id}/reject`, data),
    getAllStaff: () => api.get('/admin/staff'),
    getStats: () => api.get('/admin/stats'),
};

// ============================================================
// STAFF API
// ============================================================

export const staffAPI = {
    getAssignedComplaints: () => api.get('/staff/complaints'),
    getComplaintById: (id) => api.get(`/staff/complaints/${id}`),
    updateStatus: (id, data) => api.put(`/staff/complaints/${id}/status`, data),
};
