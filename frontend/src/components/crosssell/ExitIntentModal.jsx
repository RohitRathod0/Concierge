import React, { useState, useEffect } from 'react';
import { X, Gift, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ExitIntentModal({ productType = 'prime' }) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Mouse leave trigger
    const handleMouseLeave = (e) => {
      if (e.clientY <= 0 && !hasTriggered) {
        setIsVisible(true);
        setHasTriggered(true);
      }
    };

    // Idle trigger (60s)
    let idleTimer;
    const resetTimer = () => {
      clearTimeout(idleTimer);
      if (!hasTriggered) {
        idleTimer = setTimeout(() => {
          setIsVisible(true);
          setHasTriggered(true);
        }, 60000);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keypress', resetTimer);
    resetTimer();

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keypress', resetTimer);
      clearTimeout(idleTimer);
    };
  }, [hasTriggered]);

  if (!isVisible) return null;

  const content = productType === 'prime' 
    ? {
        title: "Wait! Before you go...",
        subtitle: "Don't leave your portfolio guessing.",
        offer: "Claim your 7-Day FREE ET Prime Trial + Bonus IPO Analysis Report.",
        cta: "Start Free Trial Now",
        link: "/et-prime"
      }
    : {
        title: "Not ready yet?",
        subtitle: "Start your learning journey for free.",
        offer: "Get Module 1 of any Masterclass absolutely free. No credit card required.",
        cta: "Unlock Module 1 Free",
        link: "/masterclass"
      };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative transform transition-all scale-100">
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="bg-gradient-to-br from-orange-500 to-red-600 p-8 text-center text-white relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
          <Gift className="w-16 h-16 mx-auto mb-4 text-orange-200" />
          <h2 className="text-3xl font-black mb-2 tracking-tight">{content.title}</h2>
          <p className="text-orange-100 font-medium text-lg">{content.subtitle}</p>
        </div>

        <div className="p-8 text-center bg-white">
          <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-full text-sm font-bold mb-6 border border-red-100">
            <Clock className="w-4 h-4" /> Limited Time Offer
          </div>
          
          <h3 className="text-xl font-extrabold text-gray-900 mb-8 leading-tight">
            {content.offer}
          </h3>
          
          <button 
            onClick={() => {
              setIsVisible(false);
              navigate(content.link);
            }}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-4 rounded-xl shadow-lg shadow-orange-500/30 transition-all hover:scale-[1.02] flex items-center justify-center text-lg"
          >
            {content.cta} <ArrowRight className="w-5 h-5 ml-2" />
          </button>
          
          <button 
            onClick={() => setIsVisible(false)}
            className="mt-6 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
          >
            No thanks, I'll pay full price later
          </button>
        </div>
      </div>
    </div>
  );
}
