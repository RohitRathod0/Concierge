import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';

export function ChatInput({ onSendMessage, isTyping }) {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="flex space-x-4">
          <input
            type="text"
            className="flex-1 rounded-full border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            placeholder="Ask me anything about ET products..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-white focus:outline-none hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            {isTyping ? <Loader2 className="animate-spin w-5 h-5" /> : <Send className="w-5 h-5" />}
          </button>
        </form>
      </div>
    </div>
  );
}
