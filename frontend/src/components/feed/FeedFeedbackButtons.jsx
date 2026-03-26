import React, { useState } from 'react';

const FeedFeedbackButtons = ({ cardId, onFeedback }) => {
  const [feedback, setFeedback] = useState(null);

  const handleFeedback = (type) => {
    setFeedback(type);
    if (onFeedback) onFeedback(cardId, type);
  };

  return (
    <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
      <button 
        onClick={(e) => { e.stopPropagation(); handleFeedback('upvote'); }}
        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${feedback === 'upvote' ? 'bg-green-100 text-green-600' : 'hover:bg-gray-200/50'}`}
        disabled={feedback !== null}
      >
        👍
      </button>
      <button 
        onClick={(e) => { e.stopPropagation(); handleFeedback('downvote'); }}
        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${feedback === 'downvote' ? 'bg-red-100 text-red-600' : 'hover:bg-gray-200/50'}`}
        disabled={feedback !== null}
      >
        👎
      </button>
    </div>
  );
};

export default FeedFeedbackButtons;
