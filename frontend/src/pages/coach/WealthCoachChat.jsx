import React, { useState, useEffect } from 'react';

const WealthCoachChat = ({ userId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    // Simulate initial check-in message
    setMessages([
      {
        id: 1,
        sender: 'coach',
        text: "Hi there! Happy Sunday! You've had a great week — I noticed you completed 2 learning modules. Your Financial Health Score is holding steady at 640. I see your Emergency Fund needs attention. Let's tackle that this week. Ready for a quick 2-minute review?",
        time: "10:00 AM",
        suggestedActions: ["Yes, let's do it!", "Remind me later"]
      }
    ]);
  }, []);

  const handleSend = (text) => {
    if (!text) return;
    
    // Add user message
    const newMsg = { id: Date.now(), sender: 'user', text, time: "Now" };
    setMessages(prev => [...prev, newMsg]);
    setInput("");
    
    // Simulate coach reply
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'coach',
        text: "That makes sense. Even starting with ₹500 a month into a liquid fund builds the habit. Should we set up a reminder for your next payday?",
        time: "Now",
        suggestedActions: ["Set Reminder", "Tell me more about Liquid Funds"]
      }]);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-[600px] max-w-md mx-auto bg-gray-50 border border-gray-200 rounded-3xl overflow-hidden shadow-lg relative">
      <div className="bg-white px-6 py-4 flex items-center gap-4 border-b border-gray-200 z-10 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-2xl border-2 border-white shadow-sm">
          👨‍🏫
        </div>
        <div>
          <h2 className="font-bold text-gray-900 leading-tight">ET Wealth Coach</h2>
          <span className="text-xs font-semibold text-green-500 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1 w-max mt-1">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block"></span> Online
          </span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
              msg.sender === 'user' 
                ? 'bg-indigo-600 text-white rounded-br-sm' 
                : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm'
            }`}>
              <p className="text-sm sm:text-base leading-relaxed">{msg.text}</p>
            </div>
            <span className="text-[10px] text-gray-400 mt-1 px-1">{msg.time}</span>
            
            {msg.suggestedActions && msg.sender === 'coach' && (
              <div className="flex flex-wrap gap-2 mt-2">
                {msg.suggestedActions.map((action, i) => (
                  <button 
                    key={i}
                    onClick={() => handleSend(action)}
                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors transition-transform hover:scale-105 active:scale-95"
                  >
                    {action}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full p-1 pl-4 shadow-inner">
          <input 
            type="text" 
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSend(input)}
            placeholder="Reply to coach..." 
            className="flex-1 bg-transparent border-none outline-none text-sm text-gray-800"
          />
          <button 
            onClick={() => handleSend(input)}
            className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center text-white transition-transform transform active:scale-90 shadow-md flex-shrink-0"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
};

export default WealthCoachChat;
