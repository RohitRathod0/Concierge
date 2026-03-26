import useAuthStore from '../../store/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const getHeaders = (requireAuth = false) => {
  const headers = { 'Content-Type': 'application/json' };
  const token = useAuthStore.getState().token;
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

export const marketService = {
  getLiveMarkets: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/markets/live`, {
        method: 'GET',
        headers: getHeaders(false),
      });
      if (!response.ok) throw new Error('Failed to fetch live markets');
      return await response.json();
    } catch (error) {
      console.error('Error fetching live markets:', error);
      throw error;
    }
  },
  
  getWatchlist: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/markets/watchlist`, {
        method: 'GET',
        headers: getHeaders(true),
      });
      if (!response.ok) throw new Error('Failed to fetch watchlist');
      return await response.json();
    } catch (error) {
      console.error('Error fetching watchlist:', error);
      throw error;
    }
  },
  
  addToWatchlist: async (symbol, assetClass) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/markets/watchlist`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify({ symbol, asset_class: assetClass })
      });
      if (!response.ok) throw new Error('Failed to add to watchlist');
      return await response.json();
    } catch (error) {
      console.error(`Error adding ${symbol} to watchlist:`, error);
      throw error;
    }
  },
  
  removeFromWatchlist: async (symbol) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/markets/watchlist/${symbol}`, {
        method: 'DELETE',
        headers: getHeaders(true),
      });
      if (!response.ok) throw new Error('Failed to remove from watchlist');
      return await response.json();
    } catch (error) {
      console.error(`Error removing ${symbol} from watchlist:`, error);
      throw error;
    }
  }
};
