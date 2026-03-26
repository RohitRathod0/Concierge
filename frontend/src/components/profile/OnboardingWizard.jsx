import React, { useState } from 'react';
import { useProfileStore } from '../../store/profileStore';
import { useNavigate } from 'react-router-dom';
import { Target, TrendingUp, Briefcase, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';

const STEPS = [
  {
    title: "What brings you to ET today?",
    description: "Select your primary goal so we can personalize your AI Concierge.",
    field: "primary_intent",
    options: [
      { id: "masterclass", title: "Master Options Trading", desc: "Learn strategies from experts", icon: <Target className="w-6 h-6 text-purple-500" /> },
      { id: "prime", title: "Find Undervalued Stocks", desc: "Get AI-powered stock screener access", icon: <TrendingUp className="w-6 h-6 text-green-500" /> },
      { id: "ipo", title: "Maximize IPO Gains", desc: "Track grey market premiums daily", icon: <Zap className="w-6 h-6 text-orange-500" /> },
      { id: "wealth", title: "Long-term Wealth", desc: "Mutual funds & portfolio building", icon: <Briefcase className="w-6 h-6 text-blue-500" /> }
    ]
  },
  {
    title: "How experienced are you?",
    description: "This helps our AI adjust the complexity of its market insights.",
    field: "investment_experience",
    options: [
      { id: "beginner", title: "Beginner", desc: "Just starting out", icon: null },
      { id: "intermediate", title: "Intermediate", desc: "I know the basics", icon: null },
      { id: "advanced", title: "Advanced", desc: "I invest/trade regularly", icon: null }
    ]
  }
];

export function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const { updateProfile, isLoading } = useProfileStore();
  const navigate = useNavigate();

  const step = STEPS[currentStep];

  const handleSelect = (id) => {
    setFormData({ ...formData, [step.field]: id });
  };

  const handleNext = async () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Mapping intent to existing backend schema fields if necessary
      const payload = {
        investment_experience: formData.investment_experience,
        financial_goals: [formData.primary_intent]
      };
      await updateProfile(payload);
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gray-900 skew-y-3 -translate-y-24 z-0"></div>
      
      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-xl bg-white/80 backdrop-blur-xl py-10 px-6 shadow-2xl sm:rounded-3xl sm:px-12 border border-white">
        
        <div className="mb-10 text-center">
          <div className="w-16 h-16 bg-orange-500 rounded-2xl mx-auto flex items-center justify-center font-black text-white text-2xl shadow-lg shadow-orange-500/30 mb-6">ET</div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">{step.title}</h2>
          <p className="text-gray-500 font-medium text-base">{step.description}</p>
        </div>

        <div className="space-y-4 mb-10">
          {step.options.map(opt => {
            const isSelected = formData[step.field] === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                className={`w-full text-left p-5 border-2 rounded-2xl transition-all duration-300 flex items-center gap-5 group ${
                  isSelected 
                    ? 'border-orange-500 bg-orange-50/50 shadow-md transform scale-[1.02]' 
                    : 'border-gray-100 bg-white hover:border-orange-200 hover:shadow-sm'
                }`}
              >
                {opt.icon && (
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${isSelected ? 'bg-white shadow-sm' : 'bg-slate-50 group-hover:bg-white'}`}>
                    {opt.icon}
                  </div>
                )}
                <div className="flex-1">
                  <h3 className={`font-extrabold text-lg mb-0.5 ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>{opt.title}</h3>
                  <p className={`text-sm font-medium ${isSelected ? 'text-orange-700' : 'text-gray-500'}`}>{opt.desc}</p>
                </div>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors ${isSelected ? 'border-orange-500 bg-orange-500' : 'border-gray-200'}`}>
                   {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                </div>
              </button>
            );
          })}
        </div>
        
        <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-4 pt-6 border-t border-gray-100">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-400 hover:text-gray-600 font-bold text-sm transition-colors w-full sm:w-auto"
          >
            Skip for now
          </button>
          <button
            onClick={handleNext}
            disabled={isLoading || !formData[step.field]}
            className="w-full sm:w-auto flex items-center justify-center py-3.5 px-8 rounded-xl shadow-lg text-sm font-black text-white bg-gray-900 hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
          >
            {isLoading ? 'Saving...' : currentStep === STEPS.length - 1 ? 'Build My Profile' : 'Continue'} 
            {!isLoading && <ArrowRight className="w-5 h-5 ml-2" />}
          </button>
        </div>
      </div>
    </div>
  );
}
