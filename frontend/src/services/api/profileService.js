import apiClient from './apiClient';

export const profileService = {
  getProfile: async () => {
    const response = await apiClient.get('/profile/me');
    return response.data;
  },
  
  updateProfile: async (profileData) => {
    const response = await apiClient.patch('/profile', profileData);
    return response.data.profile || response.data;
  }
};

