import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check, Star, Lock, Zap, FileText, UserCheck, PlayCircle, TrendingUp } from 'lucide-react';
import ExitIntentModal from '../components/crosssell/ExitIntentModal';
import StickyMobileCTA from '../components/crosssell/StickyMobileCTA';

export default function ETPrimePage() {
  const [subscribers, setSubscribers] = useState(47);

  useEffect(() => {
    // Fake live counter for social proof
    const p = setInterval(() => {
      setSubscribers(prev => (Math.random() > 0.7 ? prev + 1 : prev));
    }, 4000);
    return () => clearInterval(p);
  }, []);

  return (
    <div className="w-full bg-slate-50 flex flex-col relative pb-20 sm:pb-0">
      
      {/* Top Banner */}
      <div className="w-full bg-gray-900 text-white py-2 text-center text-sm font-medium sticky top-16 z-30">
        <span className="text-yellow-400 font-bold mr-2">FLASH SALE:</span> 
        Get ET Prime for just ₹2,499/year (Usually ₹3,999). Ends at midnight.
      </div>

      <section className="bg-white py-16 md:py-24 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block bg-orange-100 text-orange-700 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full mb-6">
              ET Prime Exclusive
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
              Get The Market Edge. <br className="hidden md:block"/> Before Anyone Else.
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-lg">
              Unlock the stories that move markets, read Big Bull portfolios, and get expert stock recommendations every morning.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <button className="w-full sm:w-auto px-8 py-4 bg-[#f26522] hover:bg-[#d95215] text-white font-bold rounded-xl shadow-lg transition-transform hover:-translate-y-1 text-lg">
                Start 7-Day Free Trial
              </button>
              <div className="text-sm text-gray-500 font-medium">Cancel anytime.</div>
            </div>
            
            <div className="mt-8 flex items-center gap-3">
              <div className="flex -space-x-2">
                 {[1,2,3,4].map(i => (
                   <div key={i} className={`w-8 h-8 rounded-full border-2 border-white bg-gray-${i}00 flex items-center justify-center text-xs font-bold text-gray-600 bg-gray-200`}>U</div>
                 ))}
              </div>
              <p className="text-sm font-semibold text-gray-700">
                <span className="text-green-600">{subscribers} people</span> subscribed today
              </p>
            </div>
          </div>
          
          <div className="relative">
             <div className="absolute inset-0 bg-blue-100/50 rounded-3xl transform rotate-3 scale-105 z-0"></div>
             <div className="bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 relative z-10 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                   <h3 className="font-bold text-gray-900 text-xl">ET Prime Membership</h3>
                   <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded">40% OFF</span>
                </div>
                <div className="flex items-end gap-2 mb-2">
                   <span className="text-5xl font-black text-gray-900">₹7</span>
                   <span className="text-gray-500 font-medium mb-1">/ day</span>
                </div>
                <div className="text-sm text-gray-400 line-through mb-6">₹3,999 / year</div>
                
                <div className="space-y-4 mb-8">
                   <div className="flex items-center text-sm font-medium text-gray-700"><Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" /> Exclusive deep-dive stories</div>
                   <div className="flex items-center text-sm font-medium text-gray-700"><Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" /> Ad-free reading experience</div>
                   <div className="flex items-center text-sm font-medium text-gray-700"><Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" /> Daily expert stock picks</div>
                   <div className="flex items-center text-sm font-medium text-gray-700"><Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" /> Unrestricted access to ET ePaper</div>
                </div>
                
                <button className="w-full py-4 bg-gray-900 hover:bg-black text-white font-bold rounded-xl transition-colors">
                  Claim Offer Now
                </button>
             </div>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-24 bg-slate-50">
         <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-16">Why smart investors upgrade to Prime</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
               {[
                 { title: "Exclusive Stories", icon: <FileText/>, desc: "Read stories that the rest of the market will read tomorrow." },
                 { title: "Expert Stock Picks", icon: <Star/>, desc: "Direct recommendations from SEBI-registered analysts." },
                 { title: "Big Bull Portfolio", icon: <TrendingUp/>, desc: "Track where Rakesh Jhunjhunwala and Radhakishan Damani are investing." },
                 { title: "Ad-Free Reading", icon: <Zap/>, desc: "Zero distractions. Just pure, unadulterated financial journalism." },
                 { title: "Complete ePaper", icon: <FileText/>, desc: "Read the digitized version of the ET daily newspaper anywhere." },
                 { title: "AI Recommendations", icon: <UserCheck/>, desc: "Personalized stock signals powered by the ET Advisor AI engine." },
               ].map((b, i) => (
                 <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-4">{b.icon}</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{b.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{b.desc}</p>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* Comparison Table */}
      <section className="py-24 bg-white border-t border-gray-100">
         <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-12">Free vs ET Prime</h2>
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
               <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-200">
                  <div className="p-4 font-bold text-gray-500">Feature</div>
                  <div className="p-4 font-bold text-center text-gray-500">Free</div>
                  <div className="p-4 font-extrabold text-center text-orange-600 bg-orange-50">ET Prime</div>
               </div>
               {[
                 ["Breaking News", true, true],
                 ["Live Market Data", true, true],
                 ["Prime Exclusive Stories", false, true],
                 ["Expert Stock Recommendations", false, true],
                 ["Ad-Free Experience", false, true],
                 ["Big Bull Portfolios", false, true],
                 ["ET ePaper Access", false, true],
                 ["AI Financial Planning", "Basic", "Advanced"]
               ].map((row, i) => (
                 <div key={i} className={`grid grid-cols-3 border-b border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                    <div className="p-4 text-sm font-medium text-gray-700">{row[0]}</div>
                    <div className="p-4 text-center flex justify-center items-center">
                       {row[1] === true ? <Check className="w-5 h-5 text-gray-400"/> : row[1] === false ? "-" : <span className="text-sm text-gray-500 font-medium">{row[1]}</span>}
                    </div>
                    <div className="p-4 text-center flex justify-center items-center bg-orange-50/30">
                       {row[2] === true ? <Check className="w-5 h-5 text-orange-500"/> : <span className="text-sm text-orange-600 font-bold">{row[2]}</span>}
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-slate-50">
         <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-12">Frequently Asked Questions</h2>
            <div className="space-y-4">
               {[
                 {q: "Can I cancel anytime?", a: "Yes. You can cancel your subscription with one click from your profile settings. No hidden fees or calls required."},
                 {q: "Is there a refund policy?", a: "We offer a 7-day no-questions-asked refund policy for all annual plans."},
                 {q: "Do I get ePaper access on mobile?", a: "Yes, ET Prime includes full access to the daily ePaper via web and mobile app."},
                 {q: "How are expert recommendations given?", a: "Recommendations form part of Prime articles written by SEBI-registered analysts, complete with rationale, target price, and stop loss."}
               ].map((faq, i) => (
                 <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h4 className="font-bold text-gray-900 mb-2">{faq.q}</h4>
                    <p className="text-gray-600 text-sm">{faq.a}</p>
                 </div>
               ))}
            </div>
         </div>
      </section>

    </div>
  );
}
