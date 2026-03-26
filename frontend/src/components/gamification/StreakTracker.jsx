import React from 'react';

const StreakTracker = ({ count, type, shieldsLeft }) => {
  const days = Array.from({ length: 7 }, (_, i) => i + 1);
  const activeDays = (count % 7 === 0 && count > 0) ? 7 : count % 7;

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-orange-100 relative overflow-hidden">
      <div className="absolute -right-4 -top-4 text-orange-100 opacity-50 text-8xl pointer-events-none">🔥</div>
      <h4 className="font-bold text-gray-800 mb-1 flex items-center gap-2">
        <span className="text-xl">🔥</span> 
        {count} Day {type}
      </h4>
      <p className="text-sm text-gray-500 mb-4">{shieldsLeft > 0 ? `${shieldsLeft} Streak Shields active` : 'No shields active'}</p>
      
      <div className="flex justify-between items-center relative z-10">
        {days.map(day => (
          <div key={day} className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-1 transition-colors ${
              day <= activeDays 
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/40' 
                : 'bg-gray-100 text-gray-400'
            }`}>
              {day <= activeDays ? '✓' : day}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StreakTracker;
