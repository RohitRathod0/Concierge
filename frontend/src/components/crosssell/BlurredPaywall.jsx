import React from 'react';

const BlurredPaywall = ({ title, teaserText, dailyRate, originalPrice, onUnlock }) => {
  return (
    <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-white">
      {/* Top 60% Content (Visible) */}
      <div className="p-6 pb-12">
        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600">{teaserText}</p>
        
        {/* Mock content representation */}
        <div className="mt-6 space-y-3">
          <div className="h-4 bg-gray-100 rounded w-3/4"></div>
          <div className="h-4 bg-gray-100 rounded w-full"></div>
          <div className="h-4 bg-gray-100 rounded w-5/6"></div>
        </div>
      </div>
      
      {/* Bottom 40% (Blurred) */}
      <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-white via-white/95 to-transparent backdrop-blur-[2px] flex flex-col items-center justify-end pb-6 px-6">
        <div className="bg-white shadow-xl rounded-2xl p-5 w-full max-w-sm border border-indigo-50 text-center transform translate-y-2">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full mx-auto flex items-center justify-center mb-3">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h4 className="font-bold text-gray-900 mb-1">Unlock Premium Insights</h4>
          <p className="text-sm text-gray-500 mb-4">Join ET Wealth Circle to access this content.</p>
          
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-xs text-gray-400 line-through">₹{originalPrice}</span>
            <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded">Save 40%</span>
          </div>
          
          <button 
            onClick={onUnlock}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all transform hover:scale-[1.02]"
          >
            Just ₹{dailyRate}/day
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlurredPaywall;
