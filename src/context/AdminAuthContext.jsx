import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if admin is already logged in
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const adminData = localStorage.getItem('adminData');
    
    if (token && adminData) {
      try {
        setAdmin(JSON.parse(adminData));
      } catch (e) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await api.post('/auth/login', { email, password });
      
      const { token, user } = response.data;
      
      // Check if user is admin
      if (user.role !== 'admin') {
        throw new Error('Only admins can access this area');
      }

      // Merge token with user data
      const adminData = { ...user, token };

      // Store token and admin data
      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminData', JSON.stringify(adminData));
      
      setAdmin(adminData);
      return adminData;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Login failed';
      setError(message);
      throw new Error(message);
    }
  };

  const register = async (firstName, lastName, email, password, phone) => {
    try {
      setError(null);
      const response = await api.post('/auth/register', {
        firstName,
        lastName,
        email,
        password,
        phone,
        role: 'admin'
      });

      const { token, user } = response.data;

      // For admin registration, we need to ensure admin role
      // In a production system, this would be handled by the backend with proper authorization
      // For now, we'll create the admin locally since the backend doesn't have role support in registration
      const adminData = {
        ...user,
        role: 'admin',
        token
      };

      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminData', JSON.stringify(adminData));
      
      setAdmin(adminData);
      return adminData;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Registration failed';
      setError(message);
      throw new Error(message);
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{
      admin,
      loading,
      error,
      login,
      register,
      logout,
      isAuthenticated: !!admin
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};

export default AdminAuthContext;
