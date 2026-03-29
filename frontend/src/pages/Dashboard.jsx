import React, { useState, useEffect } from 'react';
import { RecommendationCarousel } from '../components/recommendations/RecommendationCarousel';
import { JourneyMap } from '../components/journey/JourneyMap';
import { useAuthStore } from '../store/authStore';
import PersonalizedFeed from '../components/feed/PersonalizedFeed';
import ActivityTicker from '../components/social/ActivityTicker';
import XPProgressBar from '../components/gamification/XPProgressBar';
import NudgeToast from '../components/nudge/NudgeToast';
import NudgeBottomSheet from '../components/nudge/NudgeBottomSheet';
import FinancialHealthGauge from '../components/healthscore/FinancialHealthGauge';
import StreakTracker from '../components/gamification/StreakTracker';
import { useNudgeEngine } from '../hooks/useNudgeEngine';
import { useNavigate } from 'react-router-dom';
import { 
  MessageSquare, LogOut, ArrowUpRight, ArrowDownRight, Bell, AlertCircle, 
  TrendingUp, PlayCircle, ClipboardList, CreditCard, Shield, PlusCircle, CheckCircle2 
} from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { activeNudge, dismissNudge, convertNudge, isBottomSheetOpen } = useNudgeEngine();
  const userId = user?.user_id ?? user?.id;
  const [greeting, setGreeting] = useState('');
  
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  const marketData = [
    { name: "Nifty 50", val: "22,450.30", change: "+0.8%", up: true },
    { name: "Sensex", val: "73,812.90", change: "+0.7%", up: true },
    { name: "USD/INR", val: "83.45", change: "-0.1%", up: false },
    { name: "Gold", val: "71,200", change: "+1.2%", up: true }
  ];

  return (
    <div className="min-h-screen bg-slate-50 relative pb-24">
      
      {/* 2. MARKET_PULSE_BAR */}
      <div className="w-full bg-gray-900 border-b border-gray-800 flex overflow-x-auto scrollbar-hide">
        {marketData.map((m, i) => (
          <div key={i} className="flex-shrink-0 px-6 py-2.5 border-r border-gray-800 flex items-center gap-3 w-48 sm:w-auto">
            <span className="text-gray-400 font-bold text-xs uppercase tracking-wider">{m.name}</span>
            <div className={`flex items-center text-sm font-bold ${m.up ? 'text-green-500' : 'text-red-500'}`}>
              {m.val} {m.up ? <ArrowUpRight className="w-3 h-3 ml-1" /> : <ArrowDownRight className="w-3 h-3 ml-1" />}
            </div>
          </div>
        ))}
        <div className="flex-shrink-0 px-6 py-2.5 flex items-center gap-2 cursor-pointer hover:bg-gray-800 transition-colors">
          <span className="text-orange-500 font-bold text-xs uppercase tracking-wider">Top Gainer:</span>
          <span className="text-white text-sm font-bold">RELIANCE +3.4%</span>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* 1. PERSONALIZED_GREETING_HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-200 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
              {greeting}, {user?.name || 'Rohit'} <span className="text-2xl">🌅</span>
            </h1>
            <p className="text-gray-500 font-medium mt-1 flex items-center">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span> Markets are open
            </p>
          </div>
          <div className="flex gap-3">
             <div className="bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm flex flex-col items-center justify-center">
               <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">XP Level</span>
               <span className="text-sm font-black text-gray-900">Novice</span> 
             </div>
             <div className="bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm flex flex-col items-center justify-center">
               <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Active Streak</span>
               <span className="text-sm font-black text-orange-600">3 Days 🔥</span> 
             </div>
             <div className="bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm flex flex-col items-center justify-center">
               <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Health Score</span>
               <span className="text-sm font-black text-green-600">720</span> 
             </div>
          </div>
        </div>

        {/* 3. SMART_ALERT_BANNER */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-4 shadow-lg text-white flex items-center justify-between cursor-pointer hover:shadow-xl transition-shadow">
           <div className="flex items-center gap-4">
              <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm"><AlertCircle className="w-6 h-6" /></div>
              <div>
                <h4 className="font-extrabold text-white text-sm md:text-base">IPO OPEN: Swiggy Ltd closes in 2 days</h4>
                <p className="text-orange-100 text-xs md:text-sm font-medium">Your profile marks this as a strong fit for listing gains.</p>
              </div>
           </div>
           <button className="bg-white text-red-600 px-4 py-2 rounded-lg font-bold text-sm shadow-sm hidden sm:block">View Details</button>
        </div>

        {/* 9. QUICK_ACTIONS_ROW */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          {[
            {icon: <TrendingUp/>, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Check Markets', to: '/markets'},
            {icon: <PlayCircle/>, color: 'text-purple-600', bg: 'bg-purple-100', label: 'Browse Masterclass', to: '/masterclass'},
            {icon: <ClipboardList/>, color: 'text-indigo-600', bg: 'bg-indigo-100', label: 'Upcoming IPOs', to: '/ipo'},
            {icon: <CreditCard/>, color: 'text-green-600', bg: 'bg-green-100', label: 'Best Credit Card', to: '/financial-services'},
            {icon: <Shield/>, color: 'text-orange-600', bg: 'bg-orange-100', label: 'ET Prime', to: '/et-prime'},
            {icon: <MessageSquare/>, color: 'text-gray-900', bg: 'bg-gray-200', label: 'Ask AI', to: '#chat'}
          ].map((action, i) => (
             <button key={i} onClick={() => action.to === '#chat' ? null : navigate(action.to)} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-gray-200 transition-all flex flex-col items-center justify-center gap-3 group">
                <div className={`w-12 h-12 rounded-full ${action.bg} ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                   {React.cloneElement(action.icon, { className: "w-6 h-6" })}
                </div>
                <span className="text-xs font-bold text-gray-700 text-center">{action.label}</span>
             </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           
           {/* Main Feed Area (2/3) */}
           <div className="lg:col-span-2 space-y-8">
              
              {/* 5. MY_JOURNEY_PROGRESS */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-extrabold text-gray-900 text-lg">My Investment Journey</h3>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">Stage 1 of 4</span>
                </div>
                
                <div className="relative mb-8">
                   <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 z-0"></div>
                   <div className="absolute top-1/2 left-0 w-1/4 h-1 bg-blue-500 -translate-y-1/2 z-0"></div>
                   
                   <div className="relative z-10 flex justify-between">
                     <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white ring-4 ring-white shadow-sm"><CheckCircle2 className="w-5 h-5"/></div>
                        <span className="text-[10px] font-bold text-gray-900 mt-2 uppercase tracking-wide">Discover</span>
                     </div>
                     <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-white border-2 border-blue-500 flex items-center justify-center text-blue-600 ring-4 ring-white shadow-sm">2</div>
                        <span className="text-[10px] font-bold text-blue-600 mt-2 uppercase tracking-wide">Learn</span>
                     </div>
                     <div className="flex flex-col items-center opacity-50">
                        <div className="w-8 h-8 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center text-gray-400 ring-4 ring-white shadow-sm">3</div>
                        <span className="text-[10px] font-bold text-gray-500 mt-2 uppercase tracking-wide">Invest</span>
                     </div>
                     <div className="flex flex-col items-center opacity-50">
                        <div className="w-8 h-8 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center text-gray-400 ring-4 ring-white shadow-sm">4</div>
                        <span className="text-[10px] font-bold text-gray-500 mt-2 uppercase tracking-wide">Grow</span>
                     </div>
                   </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex justify-between items-center">
                   <div>
                     <p className="text-sm font-extrabold text-blue-900">Next Action: Complete your profile</p>
                     <p className="text-xs text-blue-700 font-medium">Unlock Stage 2 and personalized stock recommendations.</p>
                   </div>
                   <button onClick={() => navigate('/onboarding')} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-4 rounded-lg transition-colors">Complete Now</button>
                </div>
              </div>

              {/* 4. PERSONALIZED_FEED */}
              <div>
                <h3 className="font-extrabold text-gray-900 text-xl mb-4">Your Intelligence Feed</h3>
                <PersonalizedFeed userId={userId || '00000000-0000-0000-0000-000000000000'} />
              </div>

              {/* 6. RECOMMENDED_FOR_YOU */}
              <div>
                <h3 className="font-extrabold text-gray-900 text-xl mb-4">Selected For You</h3>
                <RecommendationCarousel />
              </div>
           </div>

           {/* Sidebar Area (1/3) */}
           <div className="space-y-8">
              
              {/* 8. FINANCIAL_HEALTH_SCORE */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                  <h3 className="font-extrabold text-gray-900 text-lg">Financial Health</h3>
                </div>
                <div className="p-2">
                  <FinancialHealthGauge userId={userId} />
                </div>
                <div className="bg-slate-50 p-5 border-t border-gray-100 space-y-3">
                   <button className="w-full text-left bg-white border border-gray-200 p-3 rounded-lg shadow-sm hover:border-gray-300 flex justify-between items-center">
                     <div>
                       <div className="text-sm font-bold text-gray-900">Add Term Insurance</div>
                       <div className="text-xs text-green-600 font-medium">+40 Score</div>
                     </div>
                     <PlusCircle className="w-5 h-5 text-gray-400"/>
                   </button>
                   <button className="w-full text-left bg-white border border-gray-200 p-3 rounded-lg shadow-sm hover:border-gray-300 flex justify-between items-center">
                     <div>
                       <div className="text-sm font-bold text-gray-900">Start a SIP</div>
                       <div className="text-xs text-green-600 font-medium">+65 Score</div>
                     </div>
                     <PlusCircle className="w-5 h-5 text-gray-400"/>
                   </button>
                </div>
              </div>

              {/* 7. XP_LEVEL_CARD */}
              <div className="bg-gray-900 rounded-2xl shadow-xl overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 rounded-full blur-2xl"></div>
                <div className="p-6 relative z-10 text-white">
                   <div className="flex justify-between items-start mb-6">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Level 1</div>
                        <h3 className="font-extrabold text-xl">Financial Novice</h3>
                      </div>
                      <div className="flex items-center bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-1 rounded text-xs font-bold">
                        🔥 3-day streak
                      </div>
                   </div>
                   
                   <XPProgressBar userId={userId} />
                   
                   <div className="mt-8 space-y-3">
                     <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-800 pb-2">Recent Actions</h4>
                     <div className="flex justify-between items-center bg-white/5 rounded-lg p-2 px-3 border border-white/5">
                        <span className="text-sm text-gray-300 font-medium">Logged in today</span>
                        <span className="text-xs font-bold text-green-400">+10 XP</span>
                     </div>
                     <div className="flex justify-between items-center bg-white/5 rounded-lg p-2 px-3 border border-white/5">
                        <span className="text-sm text-gray-300 font-medium">Viewed Nifty analysis</span>
                        <span className="text-xs font-bold text-green-400">+15 XP</span>
                     </div>
                   </div>
                </div>
              </div>

           </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 w-full z-20">
        <ActivityTicker items={[]} />
      </div>
      
      {activeNudge && !isBottomSheetOpen && (
        <NudgeToast 
          nudge={activeNudge} 
          onDismiss={() => dismissNudge(activeNudge.id)} 
          onAction={() => convertNudge(activeNudge.id, activeNudge.cta_url)} 
        />
      )}
      
      {activeNudge && isBottomSheetOpen && (
        <NudgeBottomSheet 
          nudge={activeNudge} 
          onClose={() => dismissNudge(activeNudge.id)} 
          onAction={() => convertNudge(activeNudge.id, activeNudge.cta_url)} 
        />
      )}
    </div>
  );
}
