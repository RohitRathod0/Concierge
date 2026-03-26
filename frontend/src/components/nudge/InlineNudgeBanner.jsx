import React from 'react';

const InlineNudgeBanner = ({ nudge, onAction }) => {
  if (!nudge) return null;

  return (
    <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-4 my-4 flex items-center shadow-sm">
      <div className="bg-orange-500 rounded-full w-10 h-10 flex items-center justify-center shrink-0 mr-4 shadow-sm shadow-orange-500/30">
        <span className="text-white font-bold">ET</span>
      </div>
      <div className="flex-1">
        <p className="text-gray-800 font-medium text-sm md:text-base leading-snug">
          {nudge.nudge_copy}
        </p>
      </div>
      <button 
        onClick={() => onAction && onAction(nudge)}
        className="ml-4 shrink-0 text-orange-600 font-semibold hover:text-orange-700 transition-colors text-sm uppercase tracking-wide"
      >
        Explore
      </button>
    </div>
  );
};

export default InlineNudgeBanner;
