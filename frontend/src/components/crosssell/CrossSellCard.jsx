import React from 'react';

const CrossSellCard = ({ product, onSelect }) => {
  return (
    <div className="bg-white rounded-xl shadow border border-orange-100 p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-lg text-gray-800">{product.name}</h4>
        {product.trialAvailable && <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full font-medium">Free Trial</span>}
      </div>
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
      <div className="flex items-center justify-between">
        <div>
          <span className="text-gray-400 text-xs line-through mr-2">₹{product.originalPrice}</span>
          <span className="text-lg font-bold text-gray-900">₹{product.dailyRate}/day</span>
        </div>
        <button 
          onClick={() => onSelect(product)}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700"
        >
          Explore
        </button>
      </div>
    </div>
  );
};

export default CrossSellCard;
