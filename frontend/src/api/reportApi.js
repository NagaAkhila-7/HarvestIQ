import { apiClient } from './axiosClient';

export const reportApi = {
  getDashboardSummary: () => apiClient.get('/reports/dashboard-summary'),
  downloadCsv: async (reportType) => {
    try {
      const blob = await apiClient.request(`/reports/export-csv?reportType=${reportType}`, {
        method: 'GET',
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `HarvestIQ_${reportType || 'report'}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('CSV Export Error:', error);
      throw error;
    }
  }
};
