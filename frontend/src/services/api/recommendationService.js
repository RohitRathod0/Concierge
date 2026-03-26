import apiClient from './apiClient';

export const recommendationService = {
  getRecommendations: async (limit = 3) => {
    const response = await apiClient.get('/recommendations', { params: { limit } });
    return response.data;
  }
};
