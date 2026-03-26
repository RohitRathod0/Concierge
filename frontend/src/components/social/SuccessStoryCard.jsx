import React from 'react';

const SuccessStoryCard = ({ story }) => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow border border-gray-100 group cursor-pointer hover:shadow-md transition-all">
      <div className="h-32 bg-gradient-to-br from-purple-700 to-indigo-900 relative">
        <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxjaXJjbGUgY3g9IjIiIGN5PSIyIiByPSIyIiBmaWxsPSIjZmZmIi8+Cjwvc3ZnPg==')]"></div>
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <span className="bg-white/20 backdrop-blur-md px-2 py-1 rounded text-xs font-bold uppercase tracking-wider mb-2 inline-block">Success Story</span>
          <h3 className="font-bold text-lg leading-tight line-clamp-2">{story.headline}</h3>
        </div>
      </div>
      <div className="p-4">
        <p className="text-sm text-gray-600 mb-4 line-clamp-3">{story.summary}</p>
        <button className="text-indigo-600 font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
          Start your story <span>→</span>
        </button>
      </div>
    </div>
  );
};

export default SuccessStoryCard;
