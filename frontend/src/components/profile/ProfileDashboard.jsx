import React, { useEffect } from 'react';
import { useProfileStore } from '../../store/profileStore';
import { useAuthStore } from '../../store/authStore';
import { Link } from 'react-router-dom';
import { Target, Shield, Briefcase, TrendingUp, Zap, BookOpen, AlertCircle } from 'lucide-react';

export function ProfileDashboard() {
  const { user } = useAuthStore();
  const { profile, fullData, fetchProfile, isLoading } = useProfileStore();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (isLoading || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium">Loading your profile analysis...</p>
      </div>
    );
  }

  const formatText = (text) => {
    if (!text) return 'Not set';
    return text.toString().replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getPersonaColor = (persona) => {
    if (!persona) return 'from-gray-400 to-gray-500';
    if (persona.includes('TRADER')) return 'from-red-500 to-orange-500';
    if (persona.includes('INVESTOR')) return 'from-blue-500 to-indigo-500';
    if (persona.includes('MANAGER') || persona.includes('SME')) return 'from-emerald-500 to-teal-500';
    return 'from-purple-500 to-pink-500';
  };

  const readinessScores = fullData?.product_readiness || [];

  return (
    <div className="bg-white shadow-xl rounded-2xl p-6 lg:p-8 max-w-4xl mx-auto mt-8 border border-gray-100">
      
      {/* Header & Persona Card */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Your Investor Profile</h2>
          <p className="text-gray-500 font-medium mt-1">Deep analysis powered by ET AI Concierge</p>
        </div>
        
        <div className={`bg-gradient-to-r ${getPersonaColor(profile.financial_persona)} p-1 rounded-2xl shadow-lg shrink-0`}>
          <div className="bg-white/95 backdrop-blur px-6 py-3 rounded-xl h-full flex flex-col justify-center">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Assigned Persona</span>
            <span className="text-xl font-black text-gray-900">
              {formatText(profile.financial_persona) || 'Curious Beginner'}
            </span>
          </div>
        </div>
      </div>

      {/* Completeness Banner */}
      <div className="mb-10 bg-gradient-to-r from-slate-50 to-slate-100 p-6 rounded-2xl border border-slate-200">
        <div className="flex justify-between items-end mb-2">
          <div>
            <h3 className="font-bold text-gray-900">Profile Completeness</h3>
            <p className="text-sm text-gray-500 mt-1">More data means better recommendations.</p>
          </div>
          <span className="text-2xl font-black text-orange-500">{profile.profile_completeness}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 mt-4 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-400 to-orange-500 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${profile.profile_completeness}%` }}></div>
        </div>
        {profile.profile_completeness < 100 && (
          <div className="mt-4 flex items-center gap-2 text-sm font-medium text-orange-700 bg-orange-100 p-3 rounded-xl border border-orange-200">
            <AlertCircle className="w-4 h-4" />
            <span>Missing key vectors. <Link to="/onboarding" className="font-bold hover:underline">Complete wizard now &rarr;</Link></span>
          </div>
        )}
      </div>

      {/* Deep Profiling Grid */}
      <div className="mb-10">
        <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-orange-500" />
          <span>Behavioral Vectors</span>
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <BookOpen className="w-5 h-5 text-blue-500 mb-2" />
            <p className="text-xs font-bold text-gray-400 uppercase">Knowledge Level</p>
            <p className="font-bold text-gray-900 mt-1">{formatText(profile.knowledge_level)}</p>
          </div>
          <div className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <Target className="w-5 h-5 text-purple-500 mb-2" />
            <p className="text-xs font-bold text-gray-400 uppercase">Primary Goal</p>
            <p className="font-bold text-gray-900 mt-1">{formatText(profile.primary_goal)}</p>
          </div>
          <div className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <Shield className="w-5 h-5 text-green-500 mb-2" />
            <p className="text-xs font-bold text-gray-400 uppercase">Risk Appetite</p>
            <p className="font-bold text-gray-900 mt-1">{formatText(profile.risk_appetite)}</p>
          </div>
          <div className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <TrendingUp className="w-5 h-5 text-orange-500 mb-2" />
            <p className="text-xs font-bold text-gray-400 uppercase">Experience</p>
            <p className="font-bold text-gray-900 mt-1">{formatText(profile.investment_experience)}</p>
          </div>
          <div className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <Briefcase className="w-5 h-5 text-teal-500 mb-2" />
            <p className="text-xs font-bold text-gray-400 uppercase">Capacity</p>
            <p className="font-bold text-gray-900 mt-1">{formatText(profile.monthly_investment_capacity)}</p>
          </div>
        </div>
      </div>

      {/* Product Readiness AI Scores */}
      {readinessScores && readinessScores.length > 0 && (
        <div>
          <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-500" />
            <span>AI Product Readiness</span>
          </h3>
          <div className="space-y-4">
            {readinessScores.sort((a,b) => b.readiness_score - a.readiness_score).map((score) => (
              <div key={score.product_id} className="bg-slate-50 border rounded-xl p-4 flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 mb-1">{formatText(score.product_id)}</h4>
                  <div className="w-full max-w-sm bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-full rounded-full ${score.readiness_score >= 70 ? 'bg-green-500' : score.readiness_score >= 40 ? 'bg-orange-400' : 'bg-gray-400'}`}
                      style={{ width: `${score.readiness_score}%` }}>
                    </div>
                  </div>
                </div>
                <div className="ml-4 flex items-baseline gap-1">
                  <span className="text-2xl font-black text-gray-900">{score.readiness_score}</span>
                  <span className="text-sm font-medium text-gray-500">/100</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
