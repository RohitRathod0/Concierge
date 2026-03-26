import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getToken } from '../../utils/storage';
import { Target, TrendingUp, Briefcase, Zap, ArrowRight, CheckCircle2, Shield, Rocket, Building, Activity, BookOpen, DollarSign, Clock, HeartPulse } from 'lucide-react';

const STEPS = [
  {
    title: "Which best describes your income?",
    description: "Income Stability",
    field: "income_stability",
    options: [
      { id: "fixed", title: "Fixed salary" },
      { id: "variable", title: "Variable income" },
      { id: "business", title: "Business income" },
      { id: "none", title: "No income" }
    ]
  },
  {
    title: "If your income stops today, how long can you manage?",
    description: "Financial Cushion",
    field: "financial_cushion",
    options: [
      { id: "under_1m", title: "<1 month" },
      { id: "1_to_3m", title: "1–3 months" },
      { id: "3_to_6m", title: "3–6 months" },
      { id: "over_6m", title: "6+ months" }
    ]
  },
  {
    title: "How tight is your monthly budget?",
    description: "Expense Pressure",
    field: "expense_pressure",
    options: [
      { id: "easily_save", title: "Easily save money" },
      { id: "just_manage", title: "Just manage" },
      { id: "struggling", title: "Struggling month-to-month" }
    ]
  },
  {
    title: "How do your EMIs/loans feel?",
    description: "Debt Stress",
    field: "debt_stress",
    options: [
      { id: "no_loans", title: "No loans" },
      { id: "comfortable", title: "Comfortable" },
      { id: "manageable", title: "Manageable" },
      { id: "stressful", title: "Stressful" }
    ]
  },
  {
    title: "What kind of loans do you have?",
    description: "Type of Debt",
    field: "type_of_debt",
    options: [
      { id: "none", title: "None" },
      { id: "home_edu", title: "Home/education" },
      { id: "mix", title: "Mix" },
      { id: "credit_heavy", title: "Credit card/personal heavy" }
    ]
  },
  {
    title: "Are you financially protected?",
    description: "Protection Status",
    field: "protection_status",
    options: [
      { id: "both", title: "Both health & life insurance" },
      { id: "one", title: "Only one" },
      { id: "none", title: "None" }
    ]
  },
  {
    title: "Which describes you best?",
    description: "Wealth Stage",
    field: "wealth_stage",
    options: [
      { id: "no_invest", title: "I don't invest" },
      { id: "save_fd", title: "I save (FD/RD)" },
      { id: "invest_mf", title: "I invest (mutual funds)" },
      { id: "active_stocks", title: "I actively invest (stocks, etc.)" }
    ]
  },
  {
    title: "How do you usually handle money?",
    description: "Money Behavior",
    field: "money_behavior",
    options: [
      { id: "spend_first", title: "Spend first, save later" },
      { id: "save_fixed", title: "Save fixed amount" },
      { id: "invest_auto", title: "Invest regularly (SIP/auto)" }
    ]
  },
  {
    title: "Do you have a clear financial plan?",
    description: "Financial Direction",
    field: "financial_direction",
    options: [
      { id: "no_plan", title: "No plan" },
      { id: "some_short", title: "Some short-term plans" },
      { id: "clear_long", title: "Clear long-term plan" }
    ]
  },
  {
    title: "How many people depend on your income?",
    description: "Responsibility Load",
    field: "responsibility_load",
    options: [
      { id: "none", title: "None" },
      { id: "1_to_2", title: "1–2" },
      { id: "3_plus", title: "3+" }
    ]
  }
];

export function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [assignedPersona, setAssignedPersona] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const initOnboarding = async () => {
      try {
        const token = getToken();
        if (!token) {
           return;
        }
        await axios.post('http://127.0.0.1:8000/api/v1/profile/onboarding/start', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) {
        if (err?.response?.status !== 401) {
          console.error("Failed to start/sync onboarding:", err);
        }
      }
    };
    initOnboarding();
  }, []);

  const stepDef = STEPS[currentStep];

  const handleSelect = (id) => {
    if (stepDef.multiSelect) {
      if (id === 'none') {
         setFormData({ ...formData, [stepDef.field]: ['none'] });
         return;
      }
      
      let current = formData[stepDef.field] || [];
      if (current.includes('none')) {
         current = [];
      }
      if (current.includes(id)) {
        setFormData({ ...formData, [stepDef.field]: current.filter(i => i !== id) });
      } else {
        setFormData({ ...formData, [stepDef.field]: [...current, id] });
      }
    } else {
      setFormData({ ...formData, [stepDef.field]: id });
    }
  };

  const handleNext = async () => {
    setIsLoading(true);
    try {
      const token = getToken();
      const answer = formData[stepDef.field];
      
      // Submit step securely if token exists
      if (token) {
        await axios.post('http://127.0.0.1:8000/api/v1/profile/onboarding/step', {
          step: currentStep + 1,
          field: stepDef.field,
          answer: answer
        }, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(err => {
          if (err?.response?.status !== 401) {
            console.warn("Network error backing up step, moving forward locally.");
          }
        });
      }

      if (currentStep < STEPS.length - 1) {
        setCurrentStep(prev => prev + 1);
        setIsLoading(false);
      } else {
        // Complete
        if (token) {
           const res = await axios.post('http://127.0.0.1:8000/api/v1/profile/onboarding/complete', {}, {
             headers: { Authorization: `Bearer ${token}` }
           }).catch(err => ({ data: { persona: 'DYNAMIC_INVESTOR' } }));
           setAssignedPersona(res?.data?.persona || "Dynamic Investor");
        } else {
           setAssignedPersona("Prepared Mind");
        }
        
        setShowCompletion(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 4000);
      }
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  const isNextDisabled = () => {
    const val = formData[stepDef.field];
    if (stepDef.multiSelect) return !val || val.length === 0;
    return !val;
  };

  if (showCompletion) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center animate-bounce mb-8 shadow-[0_0_40px_rgba(249,115,22,0.5)]">
          <CheckCircle2 className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Deep Profile Anchored</h1>
        <p className="text-xl text-slate-300 mb-8 max-w-lg">Based on your 10 vectors, the ET AI Concierge has classified you as:</p>
        <div className="bg-gradient-to-r from-orange-500 to-red-600 p-1 rounded-2xl shadow-2xl">
          <div className="bg-slate-900 px-8 py-6 rounded-xl">
            <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">
              {assignedPersona.replace(/_/g, ' ')}
            </h2>
          </div>
        </div>
        <p className="mt-12 text-slate-400 animate-pulse font-medium">Redirecting to your personalized command center...</p>
      </div>
    );
  }

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-96 bg-gray-900 skew-y-3 -translate-y-24 z-0"></div>
      
      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-xl bg-white/80 backdrop-blur-xl py-10 px-6 shadow-2xl sm:rounded-3xl sm:px-12 border border-white">
        
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-2 bg-slate-100 rounded-t-3xl overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mb-10 text-center pt-4">
          <div className="w-16 h-16 bg-orange-500 rounded-2xl mx-auto flex items-center justify-center font-black text-white text-2xl shadow-lg shadow-orange-500/30 mb-6 group hover:rotate-12 transition-transform">ET</div>
          <p className="text-orange-500 font-bold text-sm tracking-widest uppercase mb-3">Step {currentStep + 1} of {STEPS.length}</p>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2 leading-tight">{stepDef.title}</h2>
          <p className="text-gray-500 font-medium text-base">{stepDef.description}</p>
        </div>

        <div className={`mb-10 ${stepDef.multiSelect && stepDef.options.length > 3 ? 'grid grid-cols-2 gap-3' : 'space-y-4'}`}>
          {stepDef.options.map(opt => {
            const currentVal = formData[stepDef.field];
            const isSelected = stepDef.multiSelect 
              ? (currentVal || []).includes(opt.id)
              : currentVal === opt.id;

            return (
              <button
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                className={`w-full text-left p-5 border-2 rounded-2xl transition-all duration-300 flex items-center gap-4 group ${
                  isSelected 
                    ? 'border-orange-500 bg-orange-50/50 shadow-md transform scale-[1.02]' 
                    : 'border-gray-100 bg-white hover:border-orange-200 hover:shadow-sm'
                }`}
              >
                <div className="flex-1">
                  <h3 className={`font-extrabold text-lg mb-0.5 leading-tight ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>{opt.title}</h3>
                </div>
                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors ${isSelected ? 'border-orange-500 bg-orange-500' : 'border-gray-200'}`}>
                   {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                </div>
              </button>
            );
          })}
        </div>
        
        <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-4 pt-6 border-t border-gray-100">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-400 hover:text-gray-600 font-bold text-sm transition-colors w-full sm:w-auto hover:underline"
          >
            Ask me later
          </button>
          <button
            onClick={handleNext}
            disabled={isLoading || isNextDisabled()}
            className="w-full sm:w-auto flex items-center justify-center py-3.5 px-8 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] text-sm font-black text-white bg-slate-900 hover:bg-black disabled:opacity-50 disabled:shadow-none transition-all hover:-translate-y-1 active:translate-y-0"
          >
            {isLoading ? 'Processing...' : currentStep === STEPS.length - 1 ? 'Analyze My Profile' : 'Continue'} 
            {!isLoading && <ArrowRight className="w-5 h-5 ml-2" />}
          </button>
        </div>
      </div>
    </div>
  );
}
