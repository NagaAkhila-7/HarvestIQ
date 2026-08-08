import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';
import { apiClient } from '../api/axiosClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [organisation, setOrganisation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('harvestiq_access_token');
      if (token) {
        apiClient.setToken(token);
        try {
          const res = await authApi.getMe();
          setUser(res.user);
          setOrganisation(res.user.organisationId);
        } catch (err) {
          console.warn('Session expired, clearing token');
          apiClient.setToken(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (credentials) => {
    const res = await authApi.login(credentials);
    setUser(res.user);
    setOrganisation(res.organisation);
    return res;
  };

  const register = async (userData) => {
    const res = await authApi.register(userData);
    setUser(res.user);
    setOrganisation(res.organisation);
    return res;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // Ignore
    } finally {
      setUser(null);
      setOrganisation(null);
    }
  };

  const hasRole = (...roles) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, organisation, loading, login, register, logout, hasRole, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
