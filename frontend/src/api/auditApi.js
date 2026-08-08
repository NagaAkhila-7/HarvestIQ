import { apiClient } from './axiosClient';

export const auditApi = {
  getAuditLogs: (params) => apiClient.get('/audit-logs', params)
};
