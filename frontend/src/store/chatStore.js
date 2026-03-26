import { create } from 'zustand';
import { chatService } from '../services/api/chatService';

export const useChatStore = create((set, get) => ({
  sessions: [],
  currentSessionId: null,
  messages: [],
  isTyping: false,
  error: null,

  fetchSessions: async () => {
    try {
      // Future: add endpoint support
    } catch (error) {
      console.error("Failed to fetch sessions", error);
    }
  },

  setCurrentSession: (sessionId) => {
    set({ currentSessionId: sessionId });
    get().fetchMessages(sessionId);
  },

  fetchMessages: async (sessionId) => {
    try {
      const msgs = await chatService.getSessionMessages(sessionId);
      set({ messages: msgs });
    } catch (error) {
      console.error(error);
    }
  },

  sendMessage: async (content) => {
    const { currentSessionId, messages } = get();
    // Optimistic UI for user message
    const tempId = Date.now().toString();
    const newMsg = { message_id: tempId, role: 'user', content, timestamp: new Date().toISOString() };
    set({ messages: [...messages, newMsg], isTyping: true });

    try {
      const aiResponse = await chatService.sendMessage(content, currentSessionId);
      if (!currentSessionId && aiResponse.session_id) {
        set({ currentSessionId: aiResponse.session_id });
      }
      set((state) => ({ 
        messages: [...state.messages.filter(m => m.message_id !== tempId), newMsg, aiResponse],
        isTyping: false 
      }));
    } catch (error) {
      set({ error: 'Failed to send message', isTyping: false });
      // revert optimistic
      set((state) => ({ messages: state.messages.filter(m => m.message_id !== tempId) }));
    }
  },

  clearMessages: () => set({ messages: [], currentSessionId: null }),
}));
