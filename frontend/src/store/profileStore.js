import { create } from 'zustand';
import { profileService } from '../services/api/profileService';

export const useProfileStore = create((set) => ({
  profile: null,
  fullData: null,
  isLoading: false,
  error: null,

  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await profileService.getProfile();
      set({ profile: data.profile, fullData: data, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch profile', isLoading: false });
    }
  },

  updateProfile: async (profileData) => {
    set({ isLoading: true, error: null });
    try {
      const pData = await profileService.updateProfile(profileData);
      set({ profile: pData, isLoading: false });
      return pData;
    } catch (error) {
      set({ error: 'Failed to update profile', isLoading: false });
      throw error;
    }
  }
}));

