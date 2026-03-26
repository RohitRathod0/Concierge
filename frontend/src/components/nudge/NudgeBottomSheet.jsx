import React from 'react';

const NudgeBottomSheet = ({ nudge, onClose, onAction }) => {
  if (!nudge) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end flex-col pointer-events-none">
      <div className="bg-black/40 absolute inset-0 pointer-events-auto" onClick={onClose} />
      <div className="bg-white rounded-t-2xl p-6 pb-8 transform transition-transform pointer-events-auto shadow-2xl relative z-10 animate-[slideUp_0.3s_ease-out]">
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6" />
        <h3 className="text-xl font-semibold mb-2 text-gray-900">Recommended for you</h3>
        <p className="text-gray-600 mb-6">{nudge.nudge_copy}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-700 font-medium">
            Maybe Later
          </button>
          <button onClick={() => { onAction && onAction(nudge); onClose(); }} className="flex-1 py-3 px-4 rounded-xl bg-orange-600 text-white font-medium shadow-md shadow-orange-600/20">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default NudgeBottomSheet;
