import apiClient from './apiClient';
import { getToken } from '../../utils/storage';

const createAuthRequiredResponse = () => {
  const text = 'Sign in to continue chatting with your personalized ET AI Concierge.';
  return {
    session_id: null,
    message_id: `guest-${Date.now()}`,
    content: text,
    response: { text, cross_sell: null },
    agent_trace: null,
    requires_auth: true,
  };
};

const normalizeChatResponse = (data) => {
  const text = data?.response?.text ?? data?.content ?? '';
  return {
    ...data,
    content: text,
    response: {
      ...data?.response,
      text,
      cross_sell: data?.response?.cross_sell ?? null,
    },
    agent_trace: data?.agent_trace ?? null,
  };
};

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

  /**
   * Send a message to the agentic LLM.
   * @param {string} content - User's message
   * @param {string|null} sessionId - Existing session ID or null
   * @param {Object|null} pageContext - e.g. {page:'/news', article:'...', stock:'RELIANCE'}
   */
  sendMessage: async (content, sessionId = null, pageContext = null) => {
    if (!getToken()) {
      return createAuthRequiredResponse();
    }
    const response = await apiClient.post('/chat/agent-message', {
      message: content,
      session_id: sessionId,
      context: pageContext || undefined,
    });
    return normalizeChatResponse(response.data);
  },
};
