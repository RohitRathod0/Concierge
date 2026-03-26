import React, { useState, useEffect } from 'react';
import { ArrowRight, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function StickyMobileCTA({ productType = 'prime' }) {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky CTA after scrolling down 300px
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  const content = productType === 'prime'
    ? {
        text: "Lock in your 7-day free trial",
        subtext: "Cancel anytime",
        btn: "Try Free",
        link: "/et-prime",
        theme: "bg-gray-900 text-white"
      }
    : {
        text: "Start learning from experts",
        subtext: "Masterclass starting at ₹1,999",
        btn: "Enroll Now",
        link: "/masterclass",
        theme: "bg-indigo-900 text-white"
      };

  return (
    <div className={`md:hidden fixed bottom-16 left-0 right-0 z-40 transform transition-transform duration-300 ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}>
      <div className={`${content.theme} shadow-[0_-10px_20px_rgba(0,0,0,0.1)] border-t border-white/10 px-4 py-3 pb-8 flex items-center justify-between`}>
        <div className="flex-1 pr-4">
          <div className="flex items-center gap-1 mb-0.5">
            <h4 className="font-extrabold text-sm leading-tight">{content.text}</h4>
          </div>
          <p className="text-[11px] font-medium text-white/70">{content.subtext}</p>
        </div>
        <button 
          onClick={() => navigate(content.link)}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-orange-500/20 active:scale-95 transition-all text-sm whitespace-nowrap"
        >
          {content.btn}
        </button>
      </div>
    </div>
  );
}
