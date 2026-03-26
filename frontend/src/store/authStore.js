import { create } from 'zustand';
import { authService } from '../services/api/authService';
import { setToken, removeToken, removeUserCache, setUserCache, getUserCache, getToken } from '../utils/storage';

export const useAuthStore = create((set) => ({
  user: getUserCache(),
  token: getToken(),
  isAuthenticated: !!getToken(),
  isLoading: false,
  error: null,
  
  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authService.login(credentials);
      setToken(data.access_token);
      setUserCache(data.user);
      set({ user: data.user, token: data.access_token, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.detail || 'Login failed', isLoading: false });
      throw error;
    }
  },
  
  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authService.register(userData);
      setToken(data.access_token);
      setUserCache(data.user);
      set({ user: data.user, token: data.access_token, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.detail || 'Registration failed', isLoading: false });
      throw error;
    }
  },
  
  logout: () => {
    removeToken();
    removeUserCache();
    set({ user: null, token: null, isAuthenticated: false });
  }
}));
