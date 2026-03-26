import React from 'react';

const DailyRateDisplay = ({ yearlyPrice, productName }) => {
  const dailyRate = Math.round(yearlyPrice / 365);
  const monthlyRate = Math.round(yearlyPrice / 12);
  
  return (
    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-6 text-center transform transition-transform hover:scale-105 shadow-sm">
      <h3 className="text-gray-600 font-medium mb-2">{productName}</h3>
      <div className="flex items-end justify-center gap-1 mb-2">
        <span className="text-sm font-bold text-gray-400 mb-1 line-through">₹{monthlyRate}/mo</span>
        <span className="text-5xl font-black text-indigo-700 mx-2">₹{dailyRate}</span>
        <span className="text-lg font-bold text-gray-500 mb-1">/day</span>
      </div>
      <p className="text-sm text-indigo-600 font-semibold bg-indigo-100 inline-block px-3 py-1 rounded-full mt-2">
        Less than a cup of chai ☕
      </p>
      <div className="mt-4 text-xs text-gray-400">
        Billed annually at ₹{yearlyPrice}
      </div>
    </div>
  );
};

export default DailyRateDisplay;
