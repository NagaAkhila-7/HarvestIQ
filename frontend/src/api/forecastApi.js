import { apiClient } from './axiosClient';

export const forecastApi = {
  getForecasts: (params) => apiClient.get('/forecasts', params),
  generateForecast: (data) => apiClient.post('/forecasts/generate', data),
  getDemandHistory: (itemId) => apiClient.get(`/forecasts/history/${itemId}`)
};
