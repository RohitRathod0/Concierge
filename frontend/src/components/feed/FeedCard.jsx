import React from 'react';
import FeedFeedbackButtons from './FeedFeedbackButtons';

const FeedCard = ({ card, onFeedback }) => {
  const renderCardStyle = () => {
    switch (card.type) {
        case "MARKET_ALERT":
            return "border-l-4 border-red-500 bg-red-50";
        case "LEARNING_CARD":
            return "border-l-4 border-blue-500 bg-blue-50";
        case "CROSS_SELL_NATIVE":
            return "border border-orange-200 bg-gradient-to-r from-orange-50 to-white";
        case "PEER_INSIGHT":
            return "border-l-4 border-purple-500 bg-purple-50";
        case "STREAK_REMINDER":
            return "border border-yellow-200 bg-yellow-50";
        default:
            return "border border-gray-200 bg-white";
    }
  };

  return (
    <div className={`rounded-xl p-5 mb-4 shadow-sm relative group transition-all hover:scale-[1.01] ${renderCardStyle()}`}>
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-bold uppercase tracking-widest opacity-60">
            {card.type.replace(/_/g, ' ')}
        </span>
      </div>
      <p className="font-semibold text-gray-800 text-lg mb-3 leading-snug">{card.content}</p>
      
      <div className="mt-4 flex items-center justify-between border-t border-black/5 pt-3">
        <button className="text-sm font-bold text-indigo-600 bg-white px-4 py-1.5 rounded-lg shadow-sm border border-indigo-100 hover:bg-indigo-50 transition-colors">
            Tap to View
        </button>
        <FeedFeedbackButtons cardId={card.card_id} onFeedback={onFeedback} />
      </div>
    </div>
  );
};

export default FeedCard;
