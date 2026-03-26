import apiClient from './apiClient';

export const chatService = {
  getSessions: async () => {
    const response = await apiClient.get('/chat/sessions');
    return response.data;
  },
  
  createSession: async () => {
    const response = await apiClient.post('/chat/sessions');
    return response.data;
  },

  getSessionMessages: async (sessionId) => {
    const response = await apiClient.get(`/chat/sessions/${sessionId}/messages`);
    return response.data;
  },

  sendMessage: async (content, sessionId = null) => {
    const response = await apiClient.post('/chat/message', {
      content,
      session_id: sessionId
    });
    return response.data;
  }
};
