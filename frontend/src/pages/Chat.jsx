import React from 'react';
import { useChatStore } from '../store/chatStore';
import { MessageBubble } from '../components/chat/MessageBubble';
import { ChatInput } from '../components/chat/ChatInput';
import { useEffect, useRef, useState } from 'react';
import { JourneyMap } from '../components/journey/JourneyMap';
import { Bot, Zap, ChevronDown, ChevronUp } from 'lucide-react';

const AGENT_LABELS = {
  coordinator: { label: 'Coordinator', color: 'bg-blue-100 text-blue-700' },
  profiling: { label: 'Profiling', color: 'bg-green-100 text-green-700' },
  navigator: { label: 'Navigator', color: 'bg-purple-100 text-purple-700' },
  cross_sell: { label: 'Cross-Sell', color: 'bg-amber-100 text-amber-700' },
  analytics: { label: 'Analytics', color: 'bg-gray-100 text-gray-600' },
  llm_direct: { label: 'AI', color: 'bg-blue-50 text-blue-600' },
};

export default function Chat() {
  const { messages, isTyping, sendMessage, lastAgentTrace } = useChatStore();
  const bottomRef = useRef(null);
  const [showJourney, setShowJourney] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow border-b border-gray-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 leading-tight">ET AI Concierge</h1>
            <div className="text-xs text-gray-500">Multi-Agent Mode</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Agent trace badge (last response) */}
          {lastAgentTrace && (
            <div className="hidden sm:flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-full px-3 py-1">
              <Zap className="w-3 h-3 text-blue-500" />
              <span className="text-xs text-gray-600 font-medium">
                {lastAgentTrace.agents_invoked?.length ?? 0} agents
              </span>
              <span className="text-xs text-gray-400">·</span>
              <span className="text-xs text-gray-600">{lastAgentTrace.execution_time_ms}ms</span>
            </div>
          )}
          {/* Journey toggle */}
          <button
            onClick={() => setShowJourney(!showJourney)}
            className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-colors"
          >
            Journey {showJourney ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </header>

      {/* Collapsible Journey Panel */}
      {showJourney && (
        <div className="border-b border-gray-200 bg-white px-4 py-4 overflow-y-auto max-h-72 flex-shrink-0">
          <JourneyMap />
        </div>
      )}

      {/* Message thread */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mb-4">
              <Bot className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">How can I help you today?</h2>
            <p className="text-gray-500 max-w-md text-sm leading-relaxed">
              Ask me about your investment goals, portfolio strategy, or explore ET Prime, ET Markets, and Masterclasses.
            </p>
            <div className="mt-6 flex flex-wrap gap-2 justify-center">
              {['Tell me about ET Prime', 'I want to start investing', 'What is ELSS?', 'Help me plan my portfolio'].map(q => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-xs text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-colors font-medium"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble key={msg.message_id || Math.random()} message={msg} agentLabels={AGENT_LABELS} />
          ))
        )}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex w-full mt-4 space-x-3 max-w-3xl mx-auto justify-start">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Bot className="text-blue-600 w-5 h-5" />
            </div>
            <div className="p-4 rounded-lg bg-white border border-gray-200 rounded-bl-none shadow-sm">
              <span className="flex space-x-1 items-center">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </main>

      <ChatInput onSendMessage={sendMessage} isTyping={isTyping} />
    </div>
  );
}
