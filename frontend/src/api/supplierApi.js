import { apiClient } from './axiosClient';

export const supplierApi = {
  getSuppliers: (params) => apiClient.get('/suppliers', params),
  getSupplierById: (id) => apiClient.get(`/suppliers/${id}`),
  createSupplier: (data) => apiClient.post('/suppliers', data),
  updateSupplier: (id, data) => apiClient.put(`/suppliers/${id}`, data),
  deleteSupplier: (id) => apiClient.delete(`/suppliers/${id}`),
  addEvaluation: (id, evalData) => apiClient.post(`/suppliers/${id}/evaluations`, evalData)
};
