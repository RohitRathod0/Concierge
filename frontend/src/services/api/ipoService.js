import useAuthStore from '../../store/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const getHeaders = (requireAuth = false) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  const token = useAuthStore.getState().token;
  if (token && requireAuth) {
    headers['Authorization'] = `Bearer ${token}`;
  } else if (token) {
    // Even if optional, pass it if we have it
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

export const ipoService = {
  getIPOList: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.status && params.status !== 'all') queryParams.append('status', params.status);
      if (params.sector) queryParams.append('sector', params.sector);
      if (params.limit) queryParams.append('limit', params.limit);
      
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const response = await fetch(`${API_BASE_URL}/api/v1/ipo/list${queryString}`, {
        method: 'GET',
        headers: getHeaders(false),
      });
      
      if (!response.ok) throw new Error('Failed to fetch IPOs');
      return await response.json();
    } catch (error) {
      console.error('Error fetching IPOs:', error);
      throw error;
    }
  },
  
  getIPOById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/ipo/${id}`, {
        method: 'GET',
        headers: getHeaders(false),
      });
      if (!response.ok) throw new Error('Failed to fetch IPO details');
      return await response.json();
    } catch (error) {
      console.error(`Error fetching IPO ${id}:`, error);
      throw error;
    }
  },
  
  setAlert: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/ipo/${id}/alert`, {
        method: 'POST',
        headers: getHeaders(true),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Failed to set alert');
      }
      return await response.json();
    } catch (error) {
      console.error(`Error setting alert for IPO ${id}:`, error);
      throw error;
    }
  },
  
  removeAlert: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/ipo/${id}/alert`, {
        method: 'DELETE',
        headers: getHeaders(true),
      });
      if (!response.ok) throw new Error('Failed to remove alert');
      return await response.json();
    } catch (error) {
      console.error(`Error removing alert for IPO ${id}:`, error);
      throw error;
    }
  },
  
  getMyAlerts: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/ipo/my-alerts`, {
        method: 'GET',
        headers: getHeaders(true),
      });
      if (!response.ok) throw new Error('Failed to fetch my alerts');
      return await response.json();
    } catch (error) {
      console.error('Error fetching my alerts:', error);
      throw error;
    }
  }
};
