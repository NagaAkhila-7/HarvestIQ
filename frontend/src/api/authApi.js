import { apiClient } from './axiosClient';

export const authApi = {
  login: async (credentials) => {
    const data = await apiClient.post('/auth/login', credentials);
    if (data.accessToken) apiClient.setToken(data.accessToken);
    return data;
  },
  register: async (userData) => {
    const data = await apiClient.post('/auth/register', userData);
    if (data.accessToken) apiClient.setToken(data.accessToken);
    return data;
  },
  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      apiClient.setToken(null);
    }
  },
  getMe: () => apiClient.get('/auth/me'),
  forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (payload) => apiClient.post('/auth/reset-password', payload)
};
