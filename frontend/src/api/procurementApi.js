import { apiClient } from './axiosClient';

export const procurementApi = {
  getPurchaseRequests: (params) => apiClient.get('/procurement/requests', params),
  createPurchaseRequest: (data) => apiClient.post('/procurement/requests', data),
  reviewPurchaseRequest: (id, reviewData) => apiClient.put(`/procurement/requests/${id}/review`, reviewData),
  
  getPurchaseOrders: (params) => apiClient.get('/procurement/orders', params),
  createPurchaseOrder: (data) => apiClient.post('/procurement/orders', data),
  updatePOStatus: (id, statusData) => apiClient.put(`/procurement/orders/${id}/status`, statusData),
  
  receivePurchaseOrder: (receiptData) => apiClient.post('/procurement/receive', receiptData),
  getReceipts: () => apiClient.get('/procurement/receipts')
};
