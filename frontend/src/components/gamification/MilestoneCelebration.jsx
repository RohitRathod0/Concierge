import React, { useEffect, useState } from 'react';

const MilestoneCelebration = ({ milestone, onShare, onClose }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (milestone) {
      setTimeout(() => setShow(true), 100);
    }
  }, [milestone]);

  if (!milestone) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-500 ${show ? 'bg-black/80 backdrop-blur-sm' : 'bg-transparent pointer-events-none'}`}>
      <div className={`relative bg-gradient-to-b from-indigo-900 to-purple-900 p-8 rounded-3xl max-w-sm w-full mx-4 shadow-2xl border border-indigo-500/30 text-center transform transition-all duration-700 delay-100 ${show ? 'scale-100 translate-y-0 opacity-100' : 'scale-90 translate-y-10 opacity-0'}`}>
        
        {/* Confetti simulation using CSS would go here */}
        
        <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white">✕</button>
        
        <div className="w-24 h-24 mx-auto bg-gradient-to-tr from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center text-5xl shadow-[0_0_30px_rgba(234,179,8,0.5)] mb-6 animate-bounce">
          🏆
        </div>
        
        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500 mb-2">
          Milestone Unlocked!
        </h2>
        <p className="text-indigo-200 mb-8 font-medium">
          {milestone.title || "First SIP set up via ET"}
        </p>
        
        <div className="bg-black/20 rounded-xl p-4 mb-8">
          <p className="text-white font-bold text-lg mb-1">+{milestone.xpReward || 200} XP Earned</p>
          <p className="text-indigo-300 text-sm">You're in the top 15% today!</p>
        </div>
        
        <button 
          onClick={onShare}
          className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
        >
          <span>Share on WhatsApp</span>
        </button>
        <button onClick={onClose} className="mt-4 text-indigo-300 text-sm font-medium hover:text-white">
          Continue
        </button>
      </div>
    </div>
  );
};

export default MilestoneCelebration;
