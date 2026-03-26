import React from 'react';

const ReferralBanner = ({ onShare }) => {
  return (
    <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-xl p-6 text-white shadow-lg overflow-hidden relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full transform translate-x-1/3 -translate-y-1/3"></div>
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between">
        <div className="text-center sm:text-left mb-4 sm:mb-0">
          <h3 className="text-xl font-bold mb-1 line-clamp-1">Invite friends to ET Wealth Circle</h3>
          <p className="text-indigo-200 text-sm">Give 30-day ET Prime trial, get 500 ET Coins.</p>
        </div>
        <button 
          onClick={onShare}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 px-6 rounded-lg shadow-md flex items-center gap-2 transition-colors whitespace-nowrap"
        >
          <span>Share via WhatsApp</span>
        </button>
      </div>
    </div>
  );
};

export default ReferralBanner;
