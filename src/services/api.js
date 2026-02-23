import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

export const authService = {
  register: (userData) => api.post('/auth/register', userData),
  login: (email, password) => api.post('/auth/login', { email, password }),
  verifyPhone: (phone, otp) => api.post('/auth/verify-phone', { phone, otp }),
  logout: () => api.post('/auth/logout')
};

export const bankingService = {
  getAccounts: () => api.get('/banking/accounts'),
  getAccountDetails: (id) => api.get(`/banking/accounts/${id}`),
  getBalance: () => api.get('/banking/balance'),
  getCards: () => api.get('/banking/cards'),
  createCard: (cardData) => api.post('/banking/cards', cardData),
  updateCard: (id, cardData) => api.put(`/banking/cards/${id}`, cardData),
  deleteCard: (id) => api.delete(`/banking/cards/${id}`),
  getTransactions: (params) => api.get('/banking/transactions', { params }),
  deposit: (data) => api.post('/banking/deposit', data),
  withdraw: (data) => api.post('/banking/withdraw', data)
};

export const transferService = {
  transferByPhone: (data) => api.post('/transfers/phone', data),
  transferByCard: (data) => api.post('/transfers/card', data),
  transferToAccount: (data) => api.post('/transfers/account', data),
  internationalTransfer: (data) => api.post('/transfers/international', data),
  getHistory: () => api.get('/transfers/history'),
  getRecipients: () => api.get('/transfers/recipients'),
  addRecipient: (data) => api.post('/transfers/recipients', data)
};

export const paymentService = {
  createPayment: (data) => api.post('/payments/create', data),
  payUtilities: (data) => api.post('/payments/utilities', data),
  payInternet: (data) => api.post('/payments/internet', data),
  payEducation: (data) => api.post('/payments/education', data),
  payGovernment: (data) => api.post('/payments/government', data),
  payMerchant: (data) => api.post('/payments/merchant', data),
  getHistory: () => api.get('/payments/history'),
  getCategories: () => api.get('/payments/categories')
};

export const marketplaceService = {
  getProducts: (params) => api.get('/marketplace/products', { params }),
  getProductDetails: (id) => api.get(`/marketplace/products/${id}`),
  getCategories: () => api.get('/marketplace/categories'),
  createOrder: (orderData) => api.post('/marketplace/orders', orderData),
  getOrders: () => api.get('/marketplace/orders'),
  getOrderDetails: (id) => api.get(`/marketplace/orders/${id}`),
  cancelOrder: (id) => api.post(`/marketplace/orders/${id}/cancel`),
  reviewProduct: (id, review) => api.post(`/marketplace/products/${id}/review`, review)
};

export const userService = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (data) => api.post('/users/change-password', data),
  getAnalytics: () => api.get('/users/analytics'),
  getCashback: () => api.get('/users/cashback'),
  getLoans: () => api.get('/users/loans'),
  getDeposits: () => api.get('/users/deposits'),
  getNotifications: () => api.get('/users/notifications'),
  enableTwoFactor: (data) => api.post('/users/two-factor', data)
};

export default api;
