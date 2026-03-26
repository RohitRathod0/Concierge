import React, { useState } from 'react';
import { CreditCard, Home, ShieldCheck, HeartPulse, TrendingUp, Landmark, Sparkles, CheckCircle } from 'lucide-react';

export default function FinancialServicesPage() {
  const [activeTab, setActiveTab] = useState('Credit Cards');
  
  const tabs = [
    { name: 'Credit Cards', icon: <CreditCard className="w-4 h-4 mr-2" /> },
    { name: 'Personal Loans', icon: <Landmark className="w-4 h-4 mr-2" /> },
    { name: 'Home Loans', icon: <Home className="w-4 h-4 mr-2" /> },
    { name: 'Term Insurance', icon: <ShieldCheck className="w-4 h-4 mr-2" /> },
    { name: 'Health Insurance', icon: <HeartPulse className="w-4 h-4 mr-2" /> },
    { name: 'Mutual Funds', icon: <TrendingUp className="w-4 h-4 mr-2" /> }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans mb-12">
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-12 text-center">
        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">Compare. Choose. Save.</h1>
        <p className="text-lg text-gray-500 font-medium max-w-2xl mx-auto">India's most trusted financial marketplace. 0% Commission. RBI Licensed Partners.</p>
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 -mt-6 z-20">
         {/* AI Recommendation Strip */}
         <div className="bg-gradient-to-r from-orange-500 to-[#d95215] rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-center gap-6 justify-between text-white border border-orange-400 mb-10 transform hover:-translate-y-1 transition-transform cursor-pointer">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm shrink-0">
                 <Sparkles className="w-6 h-6 text-white" />
               </div>
               <div>
                  <h3 className="font-extrabold text-lg">Based on your profile, you are pre-approved!</h3>
                  <p className="text-orange-100 text-sm font-medium">We identified 3 credit cards with zero joining fee that match your spending habits.</p>
               </div>
            </div>
            <button className="bg-white text-orange-600 font-bold px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors shadow-sm whitespace-nowrap w-full sm:w-auto">
               View My Offers
            </button>
         </div>

         {/* Category Tabs */}
         <div className="flex overflow-x-auto gap-2 mb-10 pb-2 scrollbar-hide">
            {tabs.map(tab => (
               <button 
                 key={tab.name}
                 onClick={() => setActiveTab(tab.name)}
                 className={`flex items-center px-6 py-4 rounded-xl font-bold text-sm whitespace-nowrap transition-colors border ${
                    activeTab === tab.name 
                      ? 'bg-gray-900 text-white border-gray-900 shadow-md' 
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                 }`}
               >
                 {tab.icon} {tab.name}
               </button>
            ))}
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Main Content Area (2cols) */}
            <div className="md:col-span-2 space-y-6">
               <div className="flex items-center justify-between mb-2">
                 <h2 className="text-xl font-extrabold text-gray-900">Top {activeTab} for you</h2>
                 <span className="text-sm font-semibold text-gray-500">Showing 3 partners</span>
               </div>

               {/* Product Cards */}
               {[1,2,3].map((item) => (
                  <div key={item} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col sm:flex-row gap-6">
                     <div className="w-full sm:w-32 h-24 bg-gray-50 rounded-xl flex items-center justify-center font-black text-gray-400 border border-gray-200 shrink-0">
                        {activeTab === 'Credit Cards' ? 'BANK LOGO' : 'PARTNER'}
                     </div>
                     <div className="flex-1 flex flex-col justify-between">
                        <div className="mb-4">
                           <h3 className="text-lg font-extrabold text-gray-900 mb-1">Premium Rewards Card</h3>
                           <p className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded inline-block mb-3">Minimum Income: ₹40,000/mo</p>
                           
                           <ul className="space-y-1">
                              <li className="text-sm text-gray-700 flex items-center font-medium"><CheckCircle className="w-4 h-4 mr-2 text-green-500"/> Flat 5% cashback on all travel bookings</li>
                              <li className="text-sm text-gray-700 flex items-center font-medium"><CheckCircle className="w-4 h-4 mr-2 text-green-500"/> Zero annual fee for first year</li>
                           </ul>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                           <div className="text-xs text-gray-500 font-medium"><span className="text-gray-900 font-bold">124 applied</span> today</div>
                           <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-sm text-sm">
                              Apply Now
                           </button>
                        </div>
                     </div>
                  </div>
               ))}
            </div>

            {/* Sidebar Tools Area */}
            <div className="space-y-6">
               <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2"></div>
                  <h3 className="text-lg font-extrabold text-indigo-900 mb-2">Check Eligibility in 60s</h3>
                  <p className="text-sm text-indigo-700/80 mb-6 font-medium">Find exactly what you qualify for, with absolutely no impact to your credit score.</p>
                  
                  <div className="space-y-3 mb-6 relative z-10">
                     <input type="text" placeholder="Your Monthly Income" className="w-full bg-white border border-indigo-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                     <input type="text" placeholder="PAN Number" className="w-full bg-white border border-indigo-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase" />
                  </div>
                  
                  <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-md text-sm relative z-10">
                     Check Offers For Me
                  </button>
               </div>

               <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center text-sm font-medium text-gray-600 space-y-4">
                 <div className="flex justify-center mb-2">
                    <ShieldCheck className="w-8 h-8 text-green-500" />
                 </div>
                 <h4 className="font-extrabold text-gray-900">100% Secure & Trustworthy</h4>
                 <p>All our lending partners are regulated by RBI. Insurance partners are IRDAI licensed. We never share your data without consent.</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
