import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Star, Shield, TrendingUp, CheckCircle, Clock } from 'lucide-react';

export default function LandingPage() {
  const [activityIndex, setActivityIndex] = useState(0);
  
  const activities = [
    "Priya from Mumbai just enrolled in Masterclass 🎓",
    "Rahul from Pune upgraded to ET Prime ⚡",
    "IPO Alert: Swiggy subscription opens tomorrow 🚀"
  ];

  useEffect(() => {
    const p = setInterval(() => {
      setActivityIndex(prev => (prev + 1) % activities.length);
    }, 3000);
    return () => clearInterval(p);
  }, []);

  return (
    <div className="w-full bg-white relative overflow-hidden flex flex-col">
      {/* 1. HERO */}
      <section className="relative w-full pt-20 pb-24 lg:pt-32 lg:pb-40 flex items-center justify-center min-h-[85vh] overflow-hidden bg-gradient-to-br from-slate-900 via-[#0a0f1c] to-black">
        <div className="absolute inset-0 z-0 opacity-20">
          {/* Subtle animated stock ticker grid background */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat opacity-30 animate-pulse"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-orange-600/30 blur-[120px] rounded-full"></div>
          <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[100px] rounded-full"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-8">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-xs font-semibold tracking-wide text-white uppercase">Live AI Engine Active</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6 leading-tight max-w-5xl">
            India's <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-[#f26522]">Smartest Financial AI</span>
            <br className="hidden md:block" /> Built by The Economic Times.
          </h1>
          
          <p className="mt-4 max-w-2xl text-xl text-gray-300 mx-auto mb-10 font-medium">
            Get a beautifully personalized investment plan engineered for your goals in under 3 minutes. <span className="text-white font-bold">100% Free.</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-5 justify-center w-full max-w-md mx-auto sm:max-w-none">
            <Link to="/onboarding" className="group flex items-center justify-center px-8 py-4 text-base font-bold rounded-full text-white bg-gradient-to-r from-[#f26522] to-orange-600 hover:from-orange-500 hover:to-[#d95215] transition-all shadow-lg hover:shadow-orange-500/30 transform hover:-translate-y-1">
              Get My Free Plan
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="flex items-center justify-center px-8 py-4 text-base font-bold rounded-full text-white bg-white/5 border border-white/20 hover:bg-white/10 backdrop-blur-md transition-all">
              <Play className="mr-2 w-5 h-5 text-gray-300" />
              See How It Works
            </button>
          </div>
        </div>
      </section>

      {/* 2. SOCIAL PROOF BAR */}
      <div className="border-y border-gray-200 bg-white py-4 w-full overflow-hidden">
        <div className="flex items-center whitespace-nowrap animate-marquee">
          <div className="flex space-x-12 px-8 text-sm font-bold text-gray-500 uppercase tracking-widest">
            <span className="flex items-center"><Shield className="w-4 h-4 mr-2 text-gray-400"/> 10M+ Readers</span>
            <span>•</span>
            <span className="flex items-center"><TrendingUp className="w-4 h-4 mr-2 text-gray-400"/> ₹500Cr+ Invested</span>
            <span>•</span>
            <span className="flex items-center"><Star className="w-4 h-4 mr-2 text-orange-400"/> 4.6★ on Play Store</span>
            <span>•</span>
            <span className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-gray-400"/> 60+ Years Trusted</span>
            {/* Duplicated for smooth loop */}
            <span>•</span>
            <span className="flex items-center"><Shield className="w-4 h-4 mr-2 text-gray-400"/> 10M+ Readers</span>
            <span>•</span>
            <span className="flex items-center"><TrendingUp className="w-4 h-4 mr-2 text-gray-400"/> ₹500Cr+ Invested</span>
          </div>
        </div>
      </div>

      {/* 3. LIVE ACTIVITY FEED */}
      <div className="bg-orange-50/50 py-3 border-b border-orange-100/50 flex justify-center w-full transition-all duration-500">
        <div className="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full shadow-sm border border-orange-100 animate-fade-in-up" key={activityIndex}>
          <span className="flex h-2 w-2 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span></span>
          <span className="text-xs font-semibold text-gray-700">{activities[activityIndex]}</span>
        </div>
      </div>

      {/* 8. IPO ALERT STRIP */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 py-3 px-4 w-full text-center sticky top-16 z-30 shadow-md">
        <p className="text-white text-sm font-medium flex items-center justify-center gap-4 flex-wrap">
          <span className="bg-red-500 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded">Hot IPO Open</span>
          <span><strong>Swiggy Ltd.</strong> — GMP +45%. Don't miss out!</span>
          <Link to="/ipo" className="bg-white text-blue-900 text-xs font-bold px-3 py-1 rounded hover:bg-gray-100 transition-colors">Alert Me</Link>
        </p>
      </div>

      {/* 4. PRODUCT SHOWCASE */}
      <section className="py-24 bg-slate-50 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Everything you need to build wealth, in one place.</h2>
            <p className="mt-4 text-lg text-gray-500">Outcome-driven tools designed to give you an unfair advantage.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow p-8 border border-gray-100 flex flex-col">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 mb-6 border border-orange-200">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">ET Prime</h3>
              <ul className="space-y-3 mb-8 flex-1">
                 <li className="flex items-start text-sm text-gray-600"><CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" /> Know which stocks to buy before the market does</li>
                 <li className="flex items-start text-sm text-gray-600"><CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" /> Insider stories that actually matter</li>
                 <li className="flex items-start text-sm text-gray-600"><CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" /> Replicate Big Bull portfolios</li>
              </ul>
              <div className="border-t border-gray-100 pt-4 mt-auto">
                 <p className="text-lg font-bold text-gray-900 mb-4">₹7 / day</p>
                 <Link to="/et-prime" className="block text-center bg-gray-900 hover:bg-black text-white py-3 rounded-xl font-bold transition-colors">Get Market Edge</Link>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow p-8 border border-gray-100 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-bl-xl">Popular</div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-6 border border-blue-200">
                <Star className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Masterclass</h3>
              <ul className="space-y-3 mb-8 flex-1">
                 <li className="flex items-start text-sm text-gray-600"><CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" /> Learn directly from SEBI-registered experts</li>
                 <li className="flex items-start text-sm text-gray-600"><CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" /> Avoid rookie mistakes that cost lakhs</li>
                 <li className="flex items-start text-sm text-gray-600"><CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" /> Practical, actionable trading strategies</li>
              </ul>
              <div className="border-t border-gray-100 pt-4 mt-auto">
                 <p className="text-lg font-bold text-gray-900 mb-4">From ₹1,999</p>
                 <Link to="/masterclass" className="block text-center bg-gray-900 hover:bg-black text-white py-3 rounded-xl font-bold transition-colors">Start Learning</Link>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow p-8 border border-gray-100 flex flex-col">
               <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 mb-6 border border-green-200">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Markets & IPO</h3>
              <ul className="space-y-3 mb-8 flex-1">
                 <li className="flex items-start text-sm text-gray-600"><CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" /> AI signals (Golden Cross, RSI triggers)</li>
                 <li className="flex items-start text-sm text-gray-600"><CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" /> Find multi-bagger IPOs before listing</li>
                 <li className="flex items-start text-sm text-gray-600"><CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" /> Real-time portfolio tracking</li>
              </ul>
              <div className="border-t border-gray-100 pt-4 mt-auto">
                 <p className="text-lg font-bold text-gray-900 mb-4">Free Access</p>
                 <Link to="/markets" className="block text-center bg-gray-900 hover:bg-black text-white py-3 rounded-xl font-bold transition-colors">Track Markets</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. AI DEMO SECTION */}
      <section className="py-24 bg-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[50%] h-full bg-slate-50 rounded-l-[100px] z-0 hidden lg:block"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-6">Ask ET Advisor anything.</h2>
              <p className="text-lg text-gray-600 mb-8">Try typing a question below! See the power of India's most capable financial AI for yourself, right now.</p>
              
              <div className="bg-white rounded-2xl shadow-xl shadow-blue-900/5 border border-gray-200 overflow-hidden">
                 <div className="bg-slate-50 p-4 border-b border-gray-200 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-xs">ET</div>
                    <span className="font-bold text-sm text-gray-800">ET Advisor</span>
                 </div>
                 <div className="p-6 h-64 overflow-y-auto flex flex-col gap-4 bg-slate-50/50">
                    <div className="bg-white border border-gray-100 shadow-sm p-3 rounded-2xl rounded-tl-sm text-sm text-gray-700 w-[80%]">
                       Hi! I'm ET Advisor. Want me to analyze a stock for you, or help you plan your taxes? Type something below!
                    </div>
                 </div>
                 <div className="p-4 bg-white border-t border-gray-200">
                    <div className="flex gap-2">
                      <input type="text" placeholder="e.g., Should I buy Tata Motors now?" className="flex-1 bg-gray-100 rounded-full px-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition-shadow" />
                      <button className="bg-orange-500 text-white w-10 h-10 rounded-full flex justify-center items-center shadow-md">
                         <Play className="w-4 h-4 ml-0.5" />
                      </button>
                    </div>
                 </div>
              </div>
            </div>
            
            <div className="hidden lg:flex justify-end relative">
               <div className="absolute inset-0 bg-gradient-to-tr from-orange-400/20 to-blue-400/20 blur-3xl -z-10 rounded-full"></div>
               <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Dashboard Preview" className="rounded-2xl shadow-2xl border border-gray-200 -rotate-2 hover:rotate-0 transition-transform duration-500 ease-out" />
            </div>
          </div>
        </div>
      </section>

      {/* 6. TESTIMONIALS */}
      <section className="py-24 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold sm:text-4xl text-white">Join 10 Million Smart Investors</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { text: "I identified 3 multi-baggers using ET Prime signals. My portfolio is up 34% this year. Unbelievable precision.", author: "Arjun K.", role: "Software Engineer, Bangalore" },
              { text: "The Masterclass on Tax Planning literally saved me ₹1.2 Lakhs this year. Paid for itself 100x over.", author: "Neha S.", role: "Freelancer, Mumbai" },
              { text: "ET Advisor feels like having a hedge fund manager in your pocket answering questions 24/7.", author: "Vikram R.", role: "Business Owner, Delhi" },
            ].map((t, i) => (
              <div key={i} className="bg-gray-800 rounded-2xl p-8 border border-gray-700 relative">
                <div className="text-orange-500 text-4xl leading-none absolute top-4 left-6">"</div>
                <p className="text-gray-300 text-sm italic mt-4 mb-6 relative z-10">{t.text}</p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center font-bold text-gray-400">{t.author[0]}</div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{t.author}</h4>
                    <p className="text-xs text-gray-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. MASTERCLASS TEASER */}
      <section className="py-24 bg-slate-50 overflow-hidden relative">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12">
               <div>
                 <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Live Masterclasses</h2>
                 <p className="text-gray-500">Learn directly from the pros. Limited seats available.</p>
               </div>
               <Link to="/masterclass" className="text-orange-600 font-bold hover:text-orange-700 mt-4 md:mt-0 flex items-center">View All <ArrowRight className="w-4 h-4 ml-1"/></Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-6 hover:shadow-lg transition-shadow">
                  <div className="w-full sm:w-32 h-32 bg-gray-200 rounded-xl overflow-hidden flex-shrink-0">
                     <img src="https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=400&q=80" alt="Expert" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col justify-between flex-1">
                     <div>
                       <div className="flex justify-between items-start mb-2">
                          <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded flex items-center"><Clock className="w-3 h-3 mr-1"/> Ends in 2 Days</span>
                       </div>
                       <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">Option Trading Advanced Strategies</h3>
                       <p className="text-sm text-gray-500 line-clamp-2 mb-3">Master the art of hedging and naked option selling with real capital tracking.</p>
                     </div>
                     <Link to="/masterclass" className="bg-gray-900 text-white text-center py-2 rounded-lg text-sm font-bold hover:bg-black transition-colors">Reserve Your Seat</Link>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* 9. FINAL CTA */}
      <section className="py-24 bg-gradient-to-br from-[#f26522] to-orange-600 relative overflow-hidden text-center">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[150%] bg-white/10 rotate-12 blur-3xl pointer-events-none"></div>
        <div className="max-w-4xl mx-auto px-4 relative z-10 text-white">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">Your Financial Journey Starts in 3 Minutes.</h2>
          <p className="text-xl text-orange-100 mb-10 max-w-2xl mx-auto">Get your personalized dashboard, AI advisor, and premium market insights. No credit card required to start.</p>
          <Link to="/register" className="inline-flex items-center justify-center px-10 py-5 text-lg font-bold rounded-full text-orange-600 bg-white hover:bg-gray-50 transition-all shadow-xl hover:-translate-y-1">
            Start Free — No Credit Card
          </Link>
          <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm font-semibold opacity-80 mix-blend-overlay">
            <span>✓ SEBI Registered Partners</span>
            <span>✓ Times Group Backed</span>
            <span>✓ 60+ Years Trust</span>
            <span>✓ 256-bit Encryption</span>
          </div>
        </div>
      </section>
    </div>
  );
}
