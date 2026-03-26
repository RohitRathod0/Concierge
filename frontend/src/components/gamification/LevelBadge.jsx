import React from 'react';

const LevelBadge = ({ level, name, badgeEmoji, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-10 h-10 text-xl',
    md: 'w-16 h-16 text-3xl',
    lg: 'w-24 h-24 text-5xl',
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 p-1 shadow-lg shadow-yellow-500/30 flex items-center justify-center relative`}>
        <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold border-2 border-white shadow-sm">
          {level}
        </div>
        <span className="drop-shadow-md">{badgeEmoji}</span>
      </div>
      {name && <span className="mt-3 font-semibold text-gray-800 tracking-tight">{name}</span>}
    </div>
  );
};

export default LevelBadge;
