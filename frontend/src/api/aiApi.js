import { apiClient } from './axiosClient';

export const aiApi = {
  getRecommendations: (params) => apiClient.get('/ai/recommendations', params),
  triggerAnalysis: () => apiClient.post('/ai/analyze'),
  decideRecommendation: (id, decisionData) => apiClient.put(`/ai/recommendations/${id}/decide`, decisionData),
  askCopilot: (prompt, lang) => apiClient.post('/ai/copilot', { prompt, lang }),
  getAIRuns: () => apiClient.get('/ai/runs')
};
