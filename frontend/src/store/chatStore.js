import { create } from 'zustand';
import { chatService } from '../services/api/chatService';

export const useChatStore = create((set, get) => ({
  sessions: [],
  currentSessionId: null,
  messages: [],        // each AI msg now has .cross_sell attached
  isTyping: false,
  error: null,
  lastCrossSell: null,   // LLM-generated, contextual cross-sell for last response
  lastAgentTrace: null,
  pageContext: null,     // context from current page (news article, stock, IPO)

  setPageContext: (ctx) => set({ pageContext: ctx }),

  fetchSessions: async () => {},

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
    const { currentSessionId, messages, pageContext } = get();
    const tempId = Date.now().toString();
    const newMsg = { message_id: tempId, role: 'user', content, timestamp: new Date().toISOString() };
    set({ messages: [...messages, newMsg], isTyping: true, error: null });

    try {
      const aiResponse = await chatService.sendMessage(content, currentSessionId, pageContext);
      
      if (!currentSessionId && aiResponse.session_id) {
        set({ currentSessionId: aiResponse.session_id });
      }

      const responseData = aiResponse?.response || {};
      const crossSell = responseData.cross_sell || null;

      // Build the assistant message object with cross_sell embedded
      const assistantMsg = {
        message_id: aiResponse.message_id || Date.now().toString() + '_ai',
        role: 'assistant',
        content: responseData.text || '',
        cross_sell: crossSell,
        intent: responseData.intent,
        profile_used: responseData.profile_used,
        timestamp: new Date().toISOString(),
      };

      set((state) => ({
        messages: [
          ...state.messages.filter(m => m.message_id !== tempId),
          newMsg,
          assistantMsg,
        ],
        isTyping: false,
        lastCrossSell: crossSell,
        lastAgentTrace: aiResponse?.agent_trace || null,
      }));
    } catch (error) {
      set({
        error: 'Failed to send message. Please try again.',
        isTyping: false,
        messages: get().messages.filter(m => m.message_id !== tempId),
      });
    }
  },

  clearMessages: () => set({ messages: [], currentSessionId: null, lastCrossSell: null }),
}));
