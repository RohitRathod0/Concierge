import React from 'react';
import { useChatStore } from '../store/chatStore';
import { MessageBubble } from '../components/chat/MessageBubble';
import { ChatInput } from '../components/chat/ChatInput';
import { useEffect, useRef, useState } from 'react';
import { JourneyMap } from '../components/journey/JourneyMap';
import { Bot, Zap, ExternalLink, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

// ── Dynamic Cross-Sell Card (LLM-generated, shown under each AI message) ──
function CrossSellCard({ crossSell }) {
  if (!crossSell) return null;
  const url = crossSell.url || '/et-prime';
  return (
    <div className="ml-12 mt-2 max-w-xs animate-fade-in">
      <div className="relative overflow-hidden rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 shadow-sm">
        {/* Glow accent */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-400 via-amber-400 to-orange-400" />
        <div className="p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
            <span className="text-[10px] font-extrabold text-orange-600 uppercase tracking-wider">
              Recommended for you
            </span>
          </div>
          <p className="text-xs font-extrabold text-gray-900 leading-tight mb-1">
            {crossSell.service}
          </p>
          <p className="text-[11px] text-gray-600 leading-relaxed mb-2">
            {crossSell.why_for_you}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-orange-600">{crossSell.price}</span>
            <Link
              to={url}
              className="flex items-center gap-1 text-[10px] font-extrabold text-white bg-orange-500 hover:bg-orange-600 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              {crossSell.cta || 'Explore'} <ExternalLink className="w-2.5 h-2.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const STARTER_QUESTIONS = [
  'What stocks should I buy based on my profile?',
  'Which masterclass is right for me?',
  'Explain ELSS vs PPF for tax saving',
  'How do I build a ₹1 crore portfolio?',
  'What is the best IPO to apply right now?',
  'Help me understand my risk tolerance',
];

export default function Chat() {
  const { messages, isTyping, sendMessage, lastAgentTrace, lastCrossSell } = useChatStore();
  const bottomRef = useRef(null);
  const [showJourney, setShowJourney] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* ── Header ── */}
      <header className="bg-white shadow border-b border-gray-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-sm">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-gray-900 leading-tight">ET AI Concierge</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] text-green-600 font-semibold">Supercharged by your Profile</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {lastAgentTrace && (
            <div className="hidden sm:flex items-center gap-1.5 bg-blue-50 border border-blue-100 rounded-full px-3 py-1">
              <Zap className="w-3 h-3 text-blue-500" />
              <span className="text-[10px] text-blue-700 font-bold">
                Gemini Agentic · {lastAgentTrace.execution_time_ms || 0}ms
              </span>
            </div>
          )}
          <button
            onClick={() => setShowJourney(!showJourney)}
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-colors"
          >
            Journey {showJourney ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </header>

      {/* ── Journey Panel ── */}
      {showJourney && (
        <div className="border-b border-gray-200 bg-white px-4 py-4 overflow-y-auto max-h-60 flex-shrink-0">
          <JourneyMap />
        </div>
      )}

      {/* ── Messages ── */}
      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mb-4 shadow-inner">
              <Bot className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-800 mb-2">
              Your Personal Financial AI
            </h2>
            <p className="text-gray-500 max-w-sm text-sm leading-relaxed mb-6">
              Ask me anything about stocks, tax, mutual funds, or ET services. 
              I know your profile and will give you <strong>personalized</strong> answers.
            </p>
            <div className="flex flex-wrap gap-2 justify-center max-w-sm">
              {STARTER_QUESTIONS.map(q => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-xs text-blue-700 bg-white border border-blue-200 hover:bg-blue-50 hover:border-blue-400 px-3 py-2 rounded-xl transition-all font-medium shadow-sm text-left"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.message_id || Math.random()}>
              <MessageBubble message={msg} />
              {/* Dynamic LLM-generated cross-sell under each AI message */}
              {msg.role === 'assistant' && msg.cross_sell && (
                <CrossSellCard crossSell={msg.cross_sell} />
              )}
            </div>
          ))
        )}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex w-full mt-2 max-w-3xl mx-auto justify-start">
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
              <Bot className="text-blue-600 w-4 h-4" />
            </div>
            <div className="p-3 rounded-2xl bg-white border border-gray-200 shadow-sm rounded-bl-none">
              <span className="flex space-x-1 items-center">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </main>

      {/* ── Input ── */}
      <ChatInput onSendMessage={sendMessage} isTyping={isTyping} />
    </div>
  );
}
