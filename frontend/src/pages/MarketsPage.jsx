import React from 'react';
import { ArrowUpRight, ArrowDownRight, Activity, TrendingUp, Search, Eye, Filter, Zap, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MarketsPage() {
  const pulseData = [
    { name: "Nifty 50", value: "22,450.30", change: "+1.2%", up: true },
    { name: "Sensex", value: "73,812.90", change: "+1.0%", up: true },
    { name: "Bank Nifty", value: "48,230.15", change: "-0.4%", up: false },
    { name: "India VIX", value: "11.20", change: "-2.1%", up: false }
  ];

  const topViewed = [
    { symbol: "RELIANCE", name: "Reliance Industries", price: "2,980.00", change: "+2.4%", up: true, ai: "Bullish" },
    { symbol: "HDFCBANK", name: "HDFC Bank", price: "1,450.20", change: "-1.1%", up: false, ai: "Neutral" },
    { symbol: "TCS", name: "Tata Consultancy", price: "3,890.50", change: "+0.5%", up: true, ai: "Bullish" },
    { symbol: "INFY", name: "Infosys", price: "1,420.00", change: "+4.2%", up: true, ai: "Strong Buy" },
    { symbol: "ITC", name: "ITC Ltd", price: "412.30", change: "-0.2%", up: false, ai: "Hold" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* AI Signal Ticker */}
      <div className="bg-orange-50 border-b border-orange-100 flex items-center px-4 py-2 overflow-hidden shadow-sm">
        <div className="flex-shrink-0 flex items-center font-black text-orange-600 text-xs uppercase tracking-widest mr-4">
          <Zap className="w-4 h-4 mr-1 fill-current" /> AI Radar
        </div>
        <div className="flex items-center whitespace-nowrap animate-marquee text-sm font-medium text-gray-700 w-full overflow-hidden">
          <span className="mr-8"><strong className="text-green-600">Golden Cross detected</strong> on INFY ↑</span>
          <span className="mr-8"><strong className="text-red-500">Death Cross</strong> on HDFCBANK ↓</span>
          <span className="mr-8"><strong className="text-orange-500">Volume Breakout:</strong> TATA POWER</span>
          <span className="mr-8"><strong className="text-green-600">RSI Oversold:</strong> ASIAN PAINT, good entry possible</span>
          {/* duplicate for continuous scroll */}
          <span className="mr-8"><strong className="text-green-600">Golden Cross detected</strong> on INFY ↑</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 w-full flex-1 py-8">
        
        {/* Pulse Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {pulseData.map((idx, i) => (
             <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="text-gray-500 text-sm font-semibold mb-1">{idx.name}</div>
                <div className="text-xl font-black text-gray-900 mb-1">{idx.value}</div>
                <div className={`text-sm font-bold flex items-center ${idx.up ? 'text-green-600' : 'text-red-500'}`}>
                   {idx.up ? <ArrowUpRight className="w-4 h-4 mr-0.5" /> : <ArrowDownRight className="w-4 h-4 mr-0.5" />} {idx.change}
                </div>
             </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
           
           {/* Left Col (2/3) */}
           <div className="col-span-1 lg:col-span-2 space-y-8">
              
              {/* Trending Stocks */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                 <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h2 className="text-lg font-extrabold text-gray-900 flex items-center"><Activity className="w-5 h-5 mr-2 text-indigo-500"/> Trending on ET</h2>
                    <button className="text-indigo-600 text-sm font-bold hover:underline">View All</button>
                 </div>
                 <div className="divide-y divide-gray-50">
                    {topViewed.map((stock, i) => (
                       <div key={i} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer group">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center font-bold text-gray-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">{stock.symbol.charAt(0)}</div>
                             <div>
                                <h4 className="font-extrabold text-gray-900 text-sm">{stock.symbol}</h4>
                                <p className="text-xs text-gray-500 font-medium">{stock.name}</p>
                             </div>
                          </div>
                          <div className="text-right flex items-center gap-6">
                             {i === 3 && ( // INFY fake trigger
                               <div className="hidden sm:flex items-center px-2 py-1 bg-green-50 rounded text-[10px] font-bold text-green-700 border border-green-100">
                                 AI: {stock.ai}
                               </div>
                             )}
                             <div>
                                <div className="font-bold text-gray-900 text-sm">{stock.price}</div>
                                <div className={`text-xs font-bold ${stock.up ? 'text-green-600' : 'text-red-500'}`}>{stock.change}</div>
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

              {/* ET Prime Inline Upsell */}
              <div className="bg-gradient-to-r from-gray-900 to-black rounded-2xl p-8 shadow-xl relative overflow-hidden text-white flex flex-col sm:flex-row items-center justify-between gap-6">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl"></div>
                 <div className="relative z-10">
                    <div className="inline-block bg-orange-500/20 text-orange-400 text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded mb-3 border border-orange-500/30">Limited Access</div>
                    <h3 className="text-2xl font-extrabold mb-2">Want AI analysis on all 5,000+ stocks?</h3>
                    <p className="text-gray-400 font-medium">Stop guessing. Get clear Buy/Sell/Hold signals powered by ET Prime.</p>
                 </div>
                 <Link to="/et-prime" className="relative z-10 whitespace-nowrap bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-lg shadow-orange-500/20">
                    Try Free for 7 Days
                 </Link>
              </div>

           </div>

           {/* Right Col (1/3) */}
           <div className="col-span-1 space-y-8">
              
              {/* Watchlist */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 min-h-[300px] flex flex-col relative overflow-hidden">
                 <h2 className="text-lg font-extrabold text-gray-900 mb-4 flex items-center"><Eye className="w-5 h-5 mr-2 text-blue-500"/> My Watchlist</h2>
                 
                 {/* Empty state for logged out / empty */}
                 <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 border border-blue-100">
                       <Search className="w-6 h-6 text-blue-400" />
                    </div>
                    <h4 className="font-bold text-gray-900 mb-1 leading-tight">Your watchlist is empty</h4>
                    <p className="text-xs text-gray-500 mb-6 font-medium">Search and add stocks to track them in real-time here.</p>
                    <div className="w-full bg-slate-50 border border-gray-200 rounded-lg p-2 text-sm text-gray-400 flex items-center">
                       <Search className="w-4 h-4 mr-2" /> Search stocks...
                    </div>
                 </div>
              </div>

              {/* Portfolio Tracker Promo */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center shadow-inner relative group cursor-pointer overflow-hidden">
                 <div className="absolute inset-0 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity z-0 duration-500"></div>
                 <div className="relative z-10 group-hover:text-white transition-colors duration-300">
                    <Lock className="w-8 h-8 mx-auto text-slate-400 group-hover:text-white mb-3" />
                    <h3 className="font-bold text-slate-900 group-hover:text-white mb-2 text-lg">Portfolio Tracker</h3>
                    <p className="text-xs text-slate-500 group-hover:text-blue-100 mb-4 font-medium">Add your holdings and track real-time P&L with AI insights.</p>
                    <span className="inline-block bg-white text-blue-600 font-bold px-4 py-2 rounded-lg text-sm shadow-sm opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                      Login to Track
                    </span>
                 </div>
              </div>

           </div>

        </div>
      </div>
    </div>
  );
}
