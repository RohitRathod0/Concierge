import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function InlineCrossSellBanner({ 
  type = 'prime', 
  title = "Unlock Premium Insights", 
  text = "See exactly which stocks the top 1% are buying right now.", 
  cta = "Get ET Prime", 
  link = "/et-prime" 
}) {
  const navigate = useNavigate();

  const themeClasses = type === 'prime' 
    ? 'from-gray-900 to-black text-white border-gray-800' 
    : 'from-blue-900 to-indigo-900 text-white border-indigo-800';

  const badgeTheme = type === 'prime'
    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
    : 'bg-white/20 text-blue-100 border border-white/30';

  const btnTheme = type === 'prime'
    ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/20'
    : 'bg-white text-indigo-900 hover:bg-gray-50 shadow-white/20';

  return (
    <div className={`my-6 rounded-2xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6 p-6 sm:p-8 bg-gradient-to-r shadow-xl ${themeClasses}`}>
      
      {/* Background accents */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
      
      <div className="relative z-10 flex-1 flex flex-col items-start sm:items-start text-center sm:text-left">
        <div className={`inline-flex items-center px-2.5 py-1 rounded text-[10px] uppercase font-bold tracking-widest mb-3 ${badgeTheme}`}>
          <Sparkles className="w-3 h-3 mr-1.5" /> Recommended for You
        </div>
        <h3 className="text-xl sm:text-2xl font-black mb-2 leading-tight">{title}</h3>
        <p className="text-sm font-medium opacity-80 max-w-lg">{text}</p>
      </div>

      <button
        onClick={() => navigate(link)}
        className={`relative z-10 whitespace-nowrap w-full sm:w-auto font-black py-3 px-8 rounded-xl shadow-lg transition-transform hover:scale-[1.02] flex items-center justify-center ${btnTheme}`}
      >
        {cta} <ArrowRight className="w-5 h-5 ml-2" />
      </button>

    </div>
  );
}
