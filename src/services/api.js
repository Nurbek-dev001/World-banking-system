import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

export const adminService = {
  getStatistics: () => api.get('/admin/statistics'),
  getUsers: (params) => api.get('/admin/users', { params }),
  getTransactions: (params) => api.get('/admin/transactions', { params }),
  blockUser: (userId) => api.post(`/admin/users/${userId}/block`),
  unblockUser: (userId) => api.post(`/admin/users/${userId}/unblock`),
  getReports: () => api.get('/admin/reports'),
  generateReport: (data) => api.post('/admin/reports/generate', data)
};

export default api;
