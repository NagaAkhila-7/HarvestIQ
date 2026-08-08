import { apiClient } from './axiosClient';

export const inventoryApi = {
  getItems: (params) => apiClient.get('/inventory/items', params),
  getItemById: (id) => apiClient.get(`/inventory/items/${id}`),
  createItem: (data) => apiClient.post('/inventory/items', data),
  updateItem: (id, data) => apiClient.put(`/inventory/items/${id}`, data),
  deleteItem: (id) => apiClient.delete(`/inventory/items/${id}`),
  recordMovement: (data) => apiClient.post('/inventory/movements', data),
  getMovements: () => apiClient.get('/inventory/movements'),
  getCategories: () => apiClient.get('/inventory/categories'),
  getLocations: () => apiClient.get('/inventory/locations'),
  getLots: () => apiClient.get('/inventory/lots'),
  getExpiryAlerts: (daysAhead = 60) => apiClient.get('/inventory/expiry-alerts', { daysAhead })
};
