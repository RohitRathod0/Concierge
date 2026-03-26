import useAuthStore from '../../store/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const getHeaders = (requireAuth = false) => {
  const headers = { 'Content-Type': 'application/json' };
  const token = useAuthStore.getState().token;
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

export const courseService = {
  getCourses: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.category && params.category !== 'all') queryParams.append('category', params.category);
      if (params.sort) queryParams.append('sort', params.sort);
      
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const response = await fetch(`${API_BASE_URL}/api/v1/courses${queryString}`, {
        method: 'GET',
        headers: getHeaders(false),
      });
      if (!response.ok) throw new Error('Failed to fetch courses');
      return await response.json();
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  },
  
  getRecommended: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/courses/recommended`, {
        method: 'GET',
        headers: getHeaders(false),
      });
      if (!response.ok) throw new Error('Failed to fetch recommended courses');
      return await response.json();
    } catch (error) {
      console.error('Error fetching recommended courses:', error);
      throw error;
    }
  },
  
  getCourseById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/courses/${id}`, {
        method: 'GET',
        headers: getHeaders(false),
      });
      if (!response.ok) throw new Error('Failed to fetch course');
      return await response.json();
    } catch (error) {
      console.error(`Error fetching course ${id}:`, error);
      throw error;
    }
  },
  
  enroll: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/courses/${id}/enroll`, {
        method: 'POST',
        headers: getHeaders(true),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Failed to enroll');
      }
      return await response.json();
    } catch (error) {
      console.error(`Error enrolling in course ${id}:`, error);
      throw error;
    }
  }
};
