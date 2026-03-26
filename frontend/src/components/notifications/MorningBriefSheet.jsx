import React, { useState, useEffect } from 'react';

const MorningBriefSheet = ({ userId, onClose }) => {
  const [brief, setBrief] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    fetch(`/api/v1/notifications/${userId}/morning-brief`)
      .then(res => res.json())
      .then(data => {
        setBrief(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userId]);

  if (loading) return (
    <div className="fixed inset-x-0 bottom-0 bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-6 z-50 animate-pulse h-64">
        <div className="h-6 bg-gray-200 w-1/3 rounded mb-4"></div>
        <div className="h-20 bg-gray-100 rounded-xl mb-4"></div>
        <div className="h-10 bg-gray-200 rounded-lg"></div>
    </div>
  );

  if (!brief) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.15)] z-50 transform transition-transform duration-300">
      <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mt-3 mb-5"></div>
      
      <div className="px-6 pb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900">{brief.greeting}</h2>
            <p className="text-sm font-medium text-gray-500 mt-1">Your 60-second ET wealth brief</p>
          </div>
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className={`w-12 h-12 flex items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 ${isPlaying ? 'bg-red-500 shadow-red-500/30' : 'bg-indigo-600 shadow-indigo-600/30'}`}
          >
            {isPlaying ? (
              <span className="w-4 h-4 bg-white rounded-sm"></span>
            ) : (
              <span className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-white border-b-8 border-b-transparent ml-1"></span>
            )}
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex gap-4">
            <span className="text-2xl mt-1">🌍</span>
            <div>
              <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide opacity-50 mb-1">Market Context</h4>
              <p className="font-medium text-gray-800">{brief.market_summary}</p>
            </div>
          </div>
          
          <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl flex gap-4">
            <span className="text-2xl mt-1">💼</span>
            <div>
              <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide opacity-50 mb-1">Portfolio Impact</h4>
              <p className="font-medium text-gray-800">{brief.portfolio_impact}</p>
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-100 p-4 rounded-2xl flex gap-4">
            <span className="text-2xl mt-1">💡</span>
            <div>
              <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide opacity-50 mb-1">AI Suggestion</h4>
              <p className="font-medium text-gray-800">{brief.suggested_action}</p>
            </div>
          </div>
        </div>

        <button onClick={onClose} className="w-full mt-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-colors">
          Dismiss for now
        </button>
      </div>
    </div>
  );
};

export default MorningBriefSheet;
