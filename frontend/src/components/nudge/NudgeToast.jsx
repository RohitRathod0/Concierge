import React, { useEffect, useState } from 'react';

const triggerIcons = {
  FOMO_TRIGGER: '📈',
  LOSS_AVERSION_TRIGGER: '🛡️',
  SOCIAL_PROOF_TRIGGER: '👥',
  URGENCY_TRIGGER: '⏰',
  RECIPROCITY_TRIGGER: '🎁',
  IDENTITY_TRIGGER: '🏆',
  PROGRESS_NUDGE: '📊',
  COMEBACK_TRIGGER: '👋'
};

const NudgeToast = ({ nudge, onDismiss, onAction }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (nudge) {
      setTimeout(() => setIsVisible(true), 100);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onDismiss, 300);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [nudge, onDismiss]);

  if (!nudge) return null;

  const icon = triggerIcons[nudge.trigger_type] || '🔔';

  return (
    <div className={`fixed bottom-4 right-4 md:bottom-6 md:right-6 bg-gray-900 text-white p-4 rounded-xl shadow-2xl transition-all duration-500 z-50 flex flex-col gap-3 min-w-[300px] max-w-sm transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
      <div className="flex items-start gap-3 justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <p className="text-sm font-semibold leading-snug">{nudge.nudge_copy}</p>
        </div>
        <button onClick={() => { setIsVisible(false); setTimeout(onDismiss, 300); }} className="text-gray-400 hover:text-white">
          ✕
        </button>
      </div>
      
      <button 
        onClick={onAction}
        className="w-full mt-1 bg-white hover:bg-gray-100 text-gray-900 font-bold py-2 rounded-lg text-sm transition-colors"
      >
        View Details
      </button>
    </div>
  );
};

export default NudgeToast;
