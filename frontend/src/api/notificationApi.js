import { apiClient } from './axiosClient';

export const notificationApi = {
  getNotifications: () => apiClient.get('/notifications'),
  markRead: (id) => apiClient.put(`/notifications/${id}/read`),
  markAllRead: () => apiClient.put('/notifications/read-all'),
  getAlerts: (params) => apiClient.get('/notifications/alerts', params),
  updateAlertStatus: (id, status) => apiClient.put(`/notifications/alerts/${id}/status`, { status })
};
