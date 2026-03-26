import React from 'react';
import { ExternalLink, Star } from 'lucide-react';

export default function ProductCardInChat({ product }) {
  if (!product) return null;
  
  return (
    <div className="mt-2 mb-1 bg-white border border-orange-100 shadow-sm rounded-xl overflow-hidden max-w-[280px]">
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-3 border-b border-orange-200 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center font-bold text-white text-xs shadow-sm">
          ET
        </div>
        <div>
          <h4 className="font-extrabold text-orange-900 text-sm leading-tight">{product.headline}</h4>
          <span className="text-[10px] uppercase font-bold text-orange-600 tracking-wider">Recommendation</span>
        </div>
      </div>
      <div className="p-3">
        <p className="text-xs text-gray-700 font-medium mb-3">{product.subtext}</p>
        <div className="flex items-center justify-between mt-1">
          <div className="font-black text-gray-900 text-sm">{product.price}</div>
          <button 
            onClick={() => window.open(product.cta_url || '#', '_blank')}
            className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold py-1.5 px-3 rounded-lg flex items-center transition-colors shadow-sm"
          >
            {product.cta_text || 'Explore'} <ExternalLink className="w-3 h-3 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
