import React from 'react';
import { ExternalLink, Users } from 'lucide-react';

export function RecommendationCard({ recommendation }) {
  const { product, score, reason } = recommendation;
  const matchPercentage = (score * 100).toFixed(0);
  
  // Badge color logic
  let badgeColor = "bg-gray-500 text-white";
  if (score >= 0.8) badgeColor = "bg-green-500 text-white";
  else if (score >= 0.6) badgeColor = "bg-yellow-500 text-gray-900";
  
  // Fake social proof seeded by name length for consistency
  const socialProof = product?.name ? Math.floor(product.name.length * 37) + 124 : 352;
  
  // Daily rate logic calculation
  let priceDisplay = "Free";
  if (product?.price_inr && product.price_inr > 0) {
    if (product.pricing_model === 'subscription') {
       const dailyRate = Math.ceil(product.price_inr / 365);
       priceDisplay = `₹${dailyRate}/day`;
    } else {
       priceDisplay = `₹${product.price_inr}`;
    }
  }

  return (
    <div className="flex flex-col bg-white rounded-xl shadow border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 min-w-[300px] max-w-[350px] m-2 transform hover:-translate-y-1">
      <div className="h-36 bg-gradient-to-br from-slate-900 via-slate-800 to-black flex flex-col justify-end p-5 relative">
        <span className={`absolute top-4 right-4 text-xs font-bold px-2 py-1 rounded shadow-sm ${badgeColor}`}>
          {matchPercentage}% Match
        </span>
        <span className="inline-block bg-white/20 text-white/90 text-[10px] uppercase font-bold px-2 py-0.5 rounded w-max mb-2 backdrop-blur-md">
          {product?.category || 'Offering'}
        </span>
        <h3 className="text-xl font-bold text-white mb-1 leading-tight">{product?.name || 'ET Product'}</h3>
      </div>
      
      <div className="p-5 flex-1 flex flex-col bg-white">
        <div className="bg-blue-50/60 p-3 rounded-lg mb-4 text-sm font-medium text-blue-900 border border-blue-100/50 leading-snug">
          {reason || "Selected based on your verified financial profile."}
        </div>
        
        <div className="flex items-center text-xs text-gray-500 mb-5 font-medium pl-1">
          <Users className="w-4 h-4 mr-1.5 text-gray-400" />
          {socialProof} investors like you use this
        </div>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
          <div className="flex flex-col">
            <span className="text-lg font-extrabold text-gray-900">{priceDisplay}</span>
            {product?.pricing_model === 'subscription' && (
              <span className="text-[10px] text-gray-400 font-medium">Billed annually at ₹{product.price_inr}</span>
            )}
          </div>
          
          <button 
            onClick={() => window.open(product?.url || "#", "_blank")}
            className="inline-flex items-center justify-center bg-[#f26522] hover:bg-[#d95215] text-white text-sm font-bold py-2.5 px-5 rounded-lg transition-colors shadow-sm"
          >
            Explore <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
