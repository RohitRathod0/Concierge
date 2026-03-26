import React, { useState, useEffect } from 'react';

const ActivityTicker = ({ items }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!items || items.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [items]);

  if (!items || items.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-indigo-900 border-t border-indigo-800 text-indigo-100 z-40 overflow-hidden h-10 flex items-center shadow-[0_-4px_10px_rgba(0,0,0,0.1)]">
      <div className="container mx-auto px-4 flex items-center">
        <span className="font-bold text-indigo-300 mr-4 shrink-0 flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div> Live
        </span>
        <div className="flex-1 relative h-full">
          {items.map((item, index) => (
            <div 
              key={index}
              className={`absolute top-1/2 -translate-y-1/2 w-full transition-all duration-500 ease-in-out text-sm md:text-base whitespace-nowrap overflow-hidden text-ellipsis ${
                index === currentIndex ? 'opacity-100 transform-none select-auto' : 'opacity-0 translate-y-4 pointer-events-none select-none'
              }`}
            >
              <span className="font-semibold text-white">{item.anonymized_name}</span> {item.city ? `from ${item.city} ` : ''} 
              {item.action_text} <span className="font-semibold text-white">{item.entity_name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActivityTicker;
