import React, { useState } from 'react';

const BilingualTooltip = ({ term, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleMouseEnter = () => {
    setIsOpen(true);
    if (!data && !loading) {
      setLoading(true);
      fetch(`/api/v1/vernacular/translate?term=${encodeURIComponent(term)}&target=hi`)
        .then(res => res.json())
        .then(resData => {
          setData(resData);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  };

  return (
    <span 
      className="relative inline-block cursor-help border-b border-dashed border-indigo-400 text-indigo-700 font-medium z-10"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsOpen(false)}
    >
      {children || term}
      
      {isOpen && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-gray-900 text-white text-sm rounded-xl p-3 shadow-xl pointer-events-none transform transition-all translate-y-0 opacity-100">
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900 w-0 h-0"></div>
          {loading ? (
            <div className="animate-pulse flex space-x-2">
              <div className="h-2 bg-gray-600 rounded w-full"></div>
            </div>
          ) : data ? (
            <div>
              <div className="font-bold text-indigo-300 mb-1 border-b border-gray-700 pb-1 flex justify-between">
                <span>{term}</span>
                <span className="font-serif text-yellow-400">{data.translated}</span>
              </div>
              <p className="text-gray-300 leading-snug">{data.explanation}</p>
            </div>
          ) : (
            <span>Translation unavailable</span>
          )}
        </div>
      )}
    </span>
  );
};

export default BilingualTooltip;
