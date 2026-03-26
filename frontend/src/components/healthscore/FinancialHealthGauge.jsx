import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const FinancialHealthGauge = ({ userId }) => {
  const { token } = useAuthStore();
  const [scoreData, setScoreData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    axios.get(`${API_BASE}/api/v1/health-score/${userId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    }).then(res => {
        setScoreData(res.data);
        setLoading(false);
    }).catch(err => {
        console.error("Health fetch error", err);
        setLoading(false);
    });
  }, [userId, token]);

  if (loading) {
      return <div className="animate-pulse h-48 bg-gray-100 rounded-2xl w-full max-w-sm mx-auto mt-6"></div>;
  }

  if (!scoreData || !scoreData.total_score || scoreData.total_score === 0) {
      return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center max-w-sm mx-auto mt-6">
           <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500 text-2xl mb-3 mb-2">📊</div>
           <h3 className="text-lg font-semibold text-gray-800 mb-1">Financial Health Check</h3>
           <p className="text-gray-500 text-sm mb-5">Complete your profile to calculate your Financial Health Score</p>
           <button className="bg-indigo-600 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-indigo-600/30 transition-transform hover:scale-105 active:scale-95 text-sm w-full">
               Complete Profile
           </button>
        </div>
      );
  }

  const score = scoreData.total_score;
  const normalizedScore = Math.min(Math.max(score, 0), 850);
  const percentage = (normalizedScore / 850) * 100;
  
  let colorClass = "text-red-500";
  let bgClass = "bg-red-500";
  let status = "Needs Attention";
  
  if (normalizedScore >= 650) {
    colorClass = "text-green-500";
    bgClass = "bg-green-500";
    status = "Excellent";
  } else if (normalizedScore >= 400) {
    colorClass = "text-amber-500";
    bgClass = "bg-amber-500";
    status = "Fair";
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center max-w-sm mx-auto mt-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 tracking-tight">Financial Health</h3>
      
      <div className="relative w-48 h-48 flex items-center justify-center">
        {/* Simple SVG Donut Chart */}
        <svg className="w-full h-full transform -rotate-90 transition-transform" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f3f4f6" strokeWidth="8" />
          <circle 
            cx="50" cy="50" r="40" 
            fill="transparent" 
            className={`${colorClass.replace('text-', 'stroke-')} transition-all duration-1000 ease-out`} 
            strokeWidth="8" 
            strokeDasharray={`${percentage * 2.51} 251`}
            strokeDashoffset="0"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-4xl font-extrabold ${colorClass}`}>{normalizedScore}</span>
          <span className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">/ 850</span>
        </div>
      </div>
      
      <div className={`mt-4 px-6 py-1.5 rounded-full text-sm font-bold text-white shadow-sm ${bgClass}`}>
        {status}
      </div>
    </div>
  );
};

export default FinancialHealthGauge;
