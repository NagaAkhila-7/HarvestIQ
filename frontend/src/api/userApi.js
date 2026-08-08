import { apiClient } from './axiosClient';

export const userApi = {
  getUsers: (params) => apiClient.get('/users', params),
  createUser: (data) => apiClient.post('/users', data),
  updateUser: (id, data) => apiClient.put(`/users/${id}`, data)
};
