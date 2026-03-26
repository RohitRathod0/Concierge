import React from 'react';
import { Lock, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PremiumLock({ 
  children, 
  title = "This content is exclusive to ET Prime", 
  description = "Join India\'s smartest investors to unlock deep analysis, ad-free reading, and members-only newsletters." 
}) {
  const navigate = useNavigate();

  return (
    <div className="relative rounded-2xl overflow-hidden group">
      {/* The actual content that is blurred */}
      <div className="filter blur-md opacity-40 select-none pointer-events-none transition-all duration-500 group-hover:blur-sm">
        {children}
      </div>

      {/* The glassmorphism lock overlay */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 bg-gradient-to-t from-white via-white/80 to-transparent">
        <div className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl transform transition-transform hover:scale-105">
          <div className="mx-auto w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mb-5 relative shadow-inner">
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center z-20 border-2 border-white">
              <Crown className="w-3.5 h-3.5 text-white" />
            </div>
            <Lock className="w-7 h-7 text-white" />
          </div>
          
          <h3 className="text-xl font-extrabold text-gray-900 mb-3 leading-tight">{title}</h3>
          <p className="text-sm font-medium text-gray-500 mb-6 leading-relaxed">
            {description}
          </p>
          
          <button 
            onClick={() => navigate('/et-prime')}
            className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3.5 px-6 rounded-xl shadow-lg transition-colors flex items-center justify-center text-sm"
          >
            Unlock with ET Prime
          </button>
          
          <button className="mt-4 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-wider">
            I already have an account
          </button>
        </div>
      </div>
    </div>
  );
}
