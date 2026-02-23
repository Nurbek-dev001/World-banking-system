import { createContext, useState, useCallback } from 'react';
import { authService } from '../services/api.js';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(email, password);
      const { token, user } = response.data;
      
      setToken(token);
      setUser(user);
      localStorage.setItem('token', token);
      
      return { token, user };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Login failed';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (firstName, lastName, email, phone, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.register({
        firstName,
        lastName,
        email,
        phone,
        password
      });
      const { token, user } = response.data;
      
      setToken(token);
      setUser(user);
      localStorage.setItem('token', token);
      
      return { token, user };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Registration failed';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setError(null);
    localStorage.removeItem('token');
  }, []);

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
