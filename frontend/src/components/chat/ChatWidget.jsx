import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, ExternalLink, Zap } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { chatService } from '../../services/api/chatService';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasPrompted, setHasPrompted] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
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
      }, 8000); 
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
      }, 30000); 
    }
    
    return () => clearTimeout(timer);
  }, [location.pathname, hasPrompted]);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    
    const userMsg = { id: Date.now(), sender: 'user', text: inputText, time: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setLoading(true);

    try {
      const res = await chatService.sendMessage(userMsg.text, sessionId);
      if (!sessionId && res.session_id) setSessionId(res.session_id);
      
      const aiMsg = { 
        id: res.message_id || Date.now() + 1, 
        sender: 'ai', 
        text: res.content, 
        time: new Date(),
        recommendation: res.product_recommendation 
      };
      
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { id: Date.now() + 2, sender: 'sys', text: "Error connecting to AI.", time: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      {isOpen ? (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-[380px] h-[520px] flex flex-col overflow-hidden mb-4 animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-slate-900 border-b border-slate-800 text-white p-4 flex justify-between items-center z-10 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center font-black text-white shadow-inner">
                ET
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-wide">ET AI Concierge</h3>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium tracking-wide">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                  Supercharged by your Profile
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
          <div ref={scrollRef} className="flex-1 bg-slate-50 p-4 overflow-y-auto flex flex-col gap-4 scroll-smooth">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 px-4 space-y-4">
                <div className="w-20 h-20 bg-orange-100 text-orange-500 rounded-2xl flex items-center justify-center mb-2 shadow-inner group transition-transform hover:scale-105">
                  <MessageSquare className="w-10 h-10 group-hover:animate-bounce" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-800 mb-1">India's smartest financial AI.</h4>
                  <p className="text-sm font-medium text-slate-500">Ask anything about markets, your portfolio, or ET Prime.</p>
                </div>
              </div>
            )}
            {messages.map((m) => (
              <div key={m.id} className={`flex w-full flex-col ${m.sender === 'user' ? 'items-end' : m.sender === 'sys' ? 'items-center' : 'items-start'}`}>
                {m.sender === 'sys' ? (
                  <div className="text-xs text-red-500 bg-red-50 px-3 py-1 rounded-md mb-2">{m.text}</div>
                ) : (
                  <div className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm shadow-sm md:text-[15px] leading-relaxed ${
                    m.sender === 'user' 
                      ? 'bg-slate-900 text-white rounded-tr-sm shadow-md' 
                      : 'bg-white border text-slate-700 rounded-tl-sm border-slate-200'
                  }`}>
                    {m.text}
                  </div>
                )}
                
                {/* Dynamically Inject Cross-Sell UI if backend provides it */}
                {m.recommendation && (
                  <div className="mt-2 w-[85%] bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-xl p-4 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-gray-900 flex items-center gap-1.5"><Zap className="w-4 h-4 text-orange-500" />{m.recommendation.headline}</h4>
                      <span className="text-xs font-black text-orange-600 bg-orange-100 px-2 py-0.5 rounded uppercase tracking-wider">{m.recommendation.match_score || 95}% MATCH</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 font-medium">{m.recommendation.subtext}</p>
                    <button onClick={() => navigate(m.recommendation.cta_url)} className="w-full bg-slate-900 hover:bg-black text-white text-sm font-bold py-2.5 rounded-lg transition-colors flex justify-center items-center gap-2 shadow-md">
                      {m.recommendation.cta_text} <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                    <p className="text-center text-[10px] text-gray-400 mt-2 font-medium uppercase tracking-widest">{m.recommendation.price}</p>
                  </div>
                )}
              </div>
            ))}
            
            {loading && (
              <div className="flex w-full justify-start items-center gap-2 text-gray-400 mt-2 ml-2">
                <div className="w-2 h-2 bg-orange-300 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce delay-150"></div>
              </div>
            )}
          </div>
          
          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl pr-1.5 pl-4 py-1.5 flex-1 focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-transparent transition-all">
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask me anything..." 
                className="bg-transparent border-none focus:outline-none flex-1 text-sm py-2 text-slate-700 placeholder:text-slate-400 font-medium"
              />
              <button 
                onClick={handleSend}
                disabled={!inputText.trim() || loading}
                className="bg-slate-900 hover:bg-black disabled:bg-slate-300 text-white w-10 h-10 rounded-lg flex items-center justify-center transition-all shadow-sm active:scale-95"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </div>
            <div className="text-center mt-2.5 text-[9px] text-slate-400 font-bold tracking-widest uppercase flex items-center justify-center gap-1.5 opacity-70">
              <Zap className="w-3 h-3 text-orange-400" />
               ET Concierge Engine
            </div>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="relative bg-slate-900 hover:bg-black text-white w-[60px] h-[60px] rounded-2xl flex items-center justify-center shadow-2xl hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)] transition-all transform hover:-translate-y-1 group border-2 border-slate-800"
        >
          {messages.length > 0 && !isOpen && (
             <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-4 w-4 bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,1)]"></span>
             </span>
          )}
          <MessageSquare className="w-7 h-7 text-orange-500 group-hover:scale-110 transition-transform" />
        </button>
      )}
    </div>
  );
}
