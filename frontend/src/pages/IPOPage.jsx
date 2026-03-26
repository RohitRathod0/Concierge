import React, { useState } from 'react';
import { Calendar, Bell, AlertCircle, Award, Shield, ChevronRight, Star } from 'lucide-react';

export default function IPOPage() {
  const [activeTab, setActiveTab] = useState('Open IPOs');
  const tabs = ['Open IPOs', 'Upcoming', 'Recently Listed', 'GMP Tracker'];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Tracker Header */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white pt-8 pb-32 px-4 shadow-inner relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 blur-sm pointer-events-none"></div>
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-extrabold mb-2 tracking-tight">IPO Center & GMP Tracker</h1>
            <p className="text-blue-100 font-medium">Never miss a listing gain. Get AI-powered ratings before you apply.</p>
          </div>
          <button className="mt-4 md:mt-0 flex items-center bg-white/10 hover:bg-white/20 border border-white/30 backdrop-blur-md px-4 py-2 rounded-lg text-sm font-bold transition-colors">
            <Bell className="w-4 h-4 mr-2" /> Get WhatsApp Alerts
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-20 relative z-20 w-full flex-1 mb-24">
        
        {/* Demat Prompt */}
        <div className="bg-white rounded-2xl p-5 shadow-lg border-l-4 border-orange-500 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 mr-4 flex-shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">You need a Demat to apply</h3>
              <p className="text-sm text-gray-500">Open one for free in 10 minutes with our certified partners.</p>
            </div>
          </div>
          <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-6 rounded-xl transition-colors whitespace-nowrap shadow-sm">
            Open Demat — Free
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 bg-white p-2 rounded-xl shadow-sm border border-gray-100 mb-8 overflow-x-auto">
          {tabs.map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${activeTab === tab ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* IPO Content */}
        <div className="space-y-6">
          {/* Swiggy Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
            <div className="border-b border-gray-100 p-6 flex flex-col md:flex-row justify-between gap-6">
              
              <div className="flex gap-5">
                <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center font-bold text-white text-2xl shadow-inner">S</div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-2xl font-extrabold text-gray-900">Swiggy Ltd.</h2>
                    <span className="bg-green-100 text-green-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded">Open today</span>
                  </div>
                  <p className="text-sm text-gray-500 font-medium mb-3">Food Tech & Quick Commerce</p>
                  
                  <div className="flex flex-wrap gap-4 text-sm bg-slate-50 p-3 rounded-lg border border-gray-100">
                    <div><span className="text-gray-400 block text-xs">Issue Size</span><strong className="text-gray-800">₹10,414 Cr</strong></div>
                    <div><span className="text-gray-400 block text-xs">Price Band</span><strong className="text-gray-800">₹371 - ₹390</strong></div>
                    <div><span className="text-gray-400 block text-xs">Closes On</span><strong className="text-gray-800">08 Nov, 2024</strong></div>
                    <div><span className="text-gray-400 block text-xs">Min Investment</span><strong className="text-gray-800">₹14,820</strong></div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-start md:items-end justify-between bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 min-w-[200px]">
                <div className="w-full">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest block mb-1">Live GMP</span>
                  <div className="text-3xl font-black text-indigo-700">₹18 <span className="text-base text-gray-500 font-medium line-through">₹25</span></div>
                  <p className="text-xs text-green-600 font-bold mt-1">+4.6% Expected Gain</p>
                </div>
                <button className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg transition-colors shadow-sm text-sm">
                  Apply Now
                </button>
              </div>

            </div>

            {/* AI Verdict */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 px-6 border-t border-indigo-100/50 flex gap-4 items-start">
              <div className="bg-white p-2 rounded-full shadow-sm">
                <Award className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-indigo-900 text-sm">ET AI Verdict</h4>
                  <div className="flex">
                    {[1,2,3,4].map(i => <Star key={i} className="w-3.5 h-3.5 text-yellow-500 fill-current" />)}
                    <Star className="w-3.5 h-3.5 text-gray-300 fill-current" />
                  </div>
                  <span className="text-xs font-bold text-indigo-600 uppercase">Apply for listing gain</span>
                </div>
                <p className="text-sm text-indigo-800/80 leading-relaxed font-medium">
                  Strong brand value and market share in quick commerce, but profitability remains a concern. The grey market premium is shrinking. Good for aggressive investors looking for a quick 5-10% pop, but hold with caution for long term.
                </p>
              </div>
            </div>
          </div>

          {/* ACME Corp (Upcoming) */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow opacity-75">
            <div className="p-6 flex flex-col md:flex-row justify-between gap-6">
              
              <div className="flex gap-5">
                <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center font-bold text-white text-2xl shadow-inner">A</div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-2xl font-extrabold text-gray-900">ACME Solar Holdings</h2>
                    <span className="bg-yellow-100 text-yellow-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded">Upcoming</span>
                  </div>
                  <p className="text-sm text-gray-500 font-medium mb-3">Renewable Energy</p>
                  
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div><span className="text-gray-400 block text-xs">Issue Size</span><strong className="text-gray-800">₹2,900 Cr</strong></div>
                    <div><span className="text-gray-400 block text-xs">Opens On</span><strong className="text-gray-800">12 Nov, 2024</strong></div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-start md:items-end justify-center min-w-[200px]">
                <button className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-2.5 rounded-lg transition-colors shadow-sm text-sm">
                  Set Alert
                </button>
              </div>

            </div>
          </div>
          
        </div>

        {/* Calendar Timeline */}
        <div className="mt-12 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-4">
            <Calendar className="w-6 h-6 text-indigo-600" />
            <h3 className="text-xl font-bold text-gray-900">IPO Calendar (Next 30 Days)</h3>
          </div>
          
          <div className="relative border-l-2 border-indigo-100 pl-6 ml-3 space-y-8">
             <div className="relative">
               <span className="absolute w-4 h-4 rounded-full bg-indigo-500 -left-[33px] top-1 ring-4 ring-white shadow-sm"></span>
               <div className="text-sm font-bold text-indigo-600 mb-1">08 Nov</div>
               <div className="font-bold text-gray-900 text-lg">Swiggy Ltd closing</div>
             </div>
             <div className="relative opacity-60">
               <span className="absolute w-4 h-4 rounded-full bg-gray-300 -left-[33px] top-1 ring-4 ring-white"></span>
               <div className="text-sm font-bold text-gray-500 mb-1">12 Nov</div>
               <div className="font-bold text-gray-900 text-lg">ACME Solar opens</div>
             </div>
             <div className="relative opacity-60">
               <span className="absolute w-4 h-4 rounded-full bg-gray-300 -left-[33px] top-1 ring-4 ring-white"></span>
               <div className="text-sm font-bold text-gray-500 mb-1">18 Nov</div>
               <div className="font-bold text-gray-900 text-lg">NTPC Green Energy</div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
