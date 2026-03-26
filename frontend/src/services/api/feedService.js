import axios from 'axios';
import { useAuthStore } from '../../store/authStore';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const feedService = {
  async getPersonalizedFeed(userId, timeOfDay = 'morning') {
    const token = useAuthStore.getState().token;
    try {
      const response = await axios.get(`${API_BASE}/api/v1/feed/${userId}`, {
        params: { time_of_day: timeOfDay },
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      return response.data;
    } catch (error) {
      console.error('Feed fetch error:', error);
      return { feed: [] };
    }
  },
  async submitFeedback(cardId, cardType, action) {
    const token = useAuthStore.getState().token;
    try {
      await axios.post(`${API_BASE}/api/v1/feed/feedback`, 
        { card_id: cardId, card_type: cardType, action },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
    } catch (error) {
      console.error('Feed feedback error:', error);
    }
  }
};
