import React from 'react';

const LanguageToggle = ({ currentLang, onToggle }) => {
  return (
    <div className="flex bg-gray-100 p-1 rounded-full w-max shadow-inner border border-gray-200">
      <button 
        onClick={() => onToggle('en')}
        className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${currentLang === 'en' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
      >
        English
      </button>
      <button 
        onClick={() => onToggle('hi')}
        className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${currentLang === 'hi' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
      >
        हिंदी (Hindi)
      </button>
    </div>
  );
};

export default LanguageToggle;
