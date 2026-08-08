import { apiClient } from './axiosClient';

export const farmerApi = {
  getFarmers: (params) => apiClient.get('/farmers', params),
  getFarmerById: (id) => apiClient.get(`/farmers/${id}`),
  createFarmer: (data) => apiClient.post('/farmers', data),
  createFarm: (data) => apiClient.post('/farmers/farms', data),
  createField: (data) => apiClient.post('/farmers/fields', data),
  getFields: () => apiClient.get('/farmers/fields'),
  recordObservation: (data) => apiClient.post('/farmers/observations', data),
  recordHarvest: (data) => apiClient.post('/farmers/harvests', data)
};
