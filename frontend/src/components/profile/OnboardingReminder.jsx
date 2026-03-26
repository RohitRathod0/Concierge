import React, { useState } from 'react';
import { ArrowRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProfileStore } from '../../store/profileStore';

export default function OnboardingReminder() {
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();
  const { profile } = useProfileStore();

  const isComplete = profile?.primary_intent && profile?.investment_experience;
  
  if (!isVisible || isComplete) return null;

  return (
    <div className="bg-indigo-600 text-white relative">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex-1 flex items-center justify-center sm:justify-start gap-4">
           {/* Progress Ring */}
           <div className="relative w-8 h-8 shrink-0 hidden sm:block">
              <svg className="w-8 h-8 transform -rotate-90">
                <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-indigo-400" />
                <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="3" fill="transparent" strokeDasharray="88" strokeDashoffset="51" className="text-white" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-[9px] font-black">42%</div>
           </div>
           
           <p className="font-medium text-sm text-center sm:text-left leading-tight">
             <span className="font-bold hidden sm:inline">Profile Incomplete: </span>
             Finish setting up your intent profile to unleash personalized stock and IPO analysis.
           </p>
        </div>
        
        <div className="flex items-center gap-4 shrink-0">
           <button 
             onClick={() => navigate('/onboarding')}
             className="bg-white text-indigo-600 font-bold px-4 py-1.5 rounded-lg shadow-sm text-sm flex items-center hover:bg-indigo-50 transition-colors"
           >
             Complete Now <ArrowRight className="w-4 h-4 ml-1" />
           </button>
           <button onClick={() => setIsVisible(false)} className="text-indigo-200 hover:text-white transition-colors p-1">
             <X className="w-5 h-5" />
           </button>
        </div>
      </div>
    </div>
  );
}
