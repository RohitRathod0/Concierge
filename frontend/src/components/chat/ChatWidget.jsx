import React, { useState, useEffect } from 'react';
import { MessageSquare, X, Send, ChevronDown } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [hasPrompted, setHasPrompted] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Reset when changing pages
    setHasPrompted(false);
    
    let timer;
    if (location.pathname === '/' || location.pathname === '/landing') {
      timer = setTimeout(() => {
        if (!hasPrompted) {
          setMessages([{
            id: 'sys-1',
            sender: 'ai',
            text: "👋 Hi! I'm ET Advisor. Tell me one financial goal and I'll show you exactly how to get there. What's on your mind — investing, learning, or planning?",
            time: new Date()
          }]);
          setIsOpen(true);
          setHasPrompted(true);
        }
      }, 8000); // 8 second delay for landing page
    } else if (location.pathname === '/dashboard') {
      timer = setTimeout(() => {
        if (!hasPrompted) {
          setMessages([{
            id: 'sys-2',
            sender: 'ai',
            text: "Still here? 😊 Your profile is 42% complete — let me ask you 2 quick questions and I'll unlock a personalized recommendation list just for you.",
            time: new Date()
          }]);
          setIsOpen(true);
          setHasPrompted(true);
        }
      }, 30000); // 30 second delay for dashboard
    }
    
    return () => clearTimeout(timer);
  }, [location.pathname, hasPrompted]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen ? (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-[380px] h-[520px] flex flex-col overflow-hidden mb-4 animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-[#1a1a1a] text-white p-4 flex justify-between items-center z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#f26522] to-orange-600 flex items-center justify-center font-bold text-white shadow-inner">
                ET
              </div>
              <div>
                <h3 className="font-bold text-sm">ET Advisor</h3>
                <div className="flex items-center gap-1.5 text-xs text-green-400">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  Powered by ET's AI Concierge Engine
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {/* Messages Area */}
          <div className="flex-1 bg-slate-50 p-4 overflow-y-auto flex flex-col gap-4">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 px-4 space-y-3">
                <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mb-2">
                  <MessageSquare className="w-8 h-8" />
                </div>
                <p className="text-sm font-medium">India's smartest financial AI.</p>
                <p className="text-xs">Ask anything about markets, investments, or ET Prime.</p>
              </div>
            )}
            {messages.map((m) => (
              <div key={m.id} className={`flex w-full ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                  m.sender === 'user' 
                    ? 'bg-[#f26522] text-white rounded-tr-sm' 
                    : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          
          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-100">
            <div className="flex items-center gap-2 bg-slate-50 border border-gray-200 rounded-full pr-1 pl-4 py-1 flex-1 focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-transparent transition-all">
              <input 
                type="text" 
                placeholder="Ask me anything..." 
                className="bg-transparent border-none focus:outline-none flex-1 text-sm py-2"
              />
              <button className="bg-[#f26522] hover:bg-[#d95215] text-white w-9 h-9 rounded-full flex items-center justify-center transition-colors">
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </div>
            <div className="text-center mt-2 text-[10px] text-gray-400 font-medium tracking-wide">
              POWERED BY ET AI
            </div>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="relative bg-[#f26522] hover:bg-orange-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 group"
        >
          {messages.length > 0 && !isOpen && (
             <span className="absolute -top-1 -right-1 flex h-4 w-4">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white"></span>
             </span>
          )}
          <MessageSquare className="w-6 h-6 group-hover:rotate-12 transition-transform" />
        </button>
      )}
    </div>
  );
}
