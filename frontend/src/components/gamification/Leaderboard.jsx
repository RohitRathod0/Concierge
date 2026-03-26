import React from 'react';

const Leaderboard = ({ entries, currentUserId, title = "Top Investors" }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100">
        <h3 className="text-lg font-bold text-indigo-900">{title}</h3>
      </div>
      <ul className="divide-y divide-gray-100">
        {entries.map((entry, index) => {
          const isCurrentUser = entry.userId === currentUserId;
          return (
            <li key={entry.userId} className={`px-6 py-4 flex items-center ${isCurrentUser ? 'bg-indigo-50/30' : 'hover:bg-gray-50'}`}>
              <div className="w-8 flex justify-center mr-2">
                {index === 0 ? <span className="text-xl">🥇</span> : 
                 index === 1 ? <span className="text-xl">🥈</span> : 
                 index === 2 ? <span className="text-xl">🥉</span> : 
                 <span className="text-gray-400 font-bold">{index + 1}</span>}
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold mr-4 shrink-0">
                {entry.name.charAt(0)}
              </div>
              <div className="flex-1">
                <p className={`font-semibold ${isCurrentUser ? 'text-indigo-700' : 'text-gray-800'}`}>
                  {isCurrentUser ? 'You' : entry.name}
                </p>
                <p className="text-xs text-gray-500">{entry.segment || 'Investor'}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-800">{entry.score}</p>
                <p className="text-xs text-gray-400">XP</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Leaderboard;
