import React from 'react';

const VisualConversationStep = ({ question, options, onSelect }) => {
  return (
    <div className="max-w-md mx-auto py-8 animate-fadeIn px-4">
      <div className="flex items-end gap-3 mb-8">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shrink-0 shadow-md">
          <span className="text-white text-xl">🤖</span>
        </div>
        <div className="bg-white rounded-2xl rounded-bl-none p-5 shadow-sm border border-gray-100 relative">
          <p className="text-lg font-medium text-gray-800 leading-snug">{question}</p>
        </div>
      </div>
      
      <div className="space-y-3 pl-12">
        {options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(option)}
            className="w-full text-left bg-indigo-50 hover:bg-indigo-600 hover:text-white group border border-indigo-100 p-4 rounded-xl transition-all duration-300 flex items-center justify-between shadow-sm hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl group-hover:scale-110 transition-transform">{option.emoji}</span>
              <span className="font-semibold text-indigo-900 group-hover:text-white transition-colors">{option.label}</span>
            </div>
            <span className="text-indigo-300 group-hover:text-white/70">→</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default VisualConversationStep;
