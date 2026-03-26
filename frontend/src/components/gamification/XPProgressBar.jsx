import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const XPProgressBar = ({ userId }) => {
  const { token } = useAuthStore();
  const [data, setData] = useState({ currentXP: 0, levelXP: 0, nextLevelXP: 500, levelName: 'Level 1: Financial Novice' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    axios.get(`${API_BASE}/api/v1/gamification/xp/${userId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    }).then(res => {
        setData({
          currentXP: res.data.current_xp || 0,
          levelXP: res.data.level_xp_min || 0,
          nextLevelXP: res.data.level_xp_max || 500,
          levelName: res.data.level_name || 'Level 1: Novice'
        });
        setLoading(false);
    }).catch(err => {
        console.error("XP Fetch Error", err);
        setLoading(false);
    });
  }, [userId, token]);

  const { currentXP, levelXP, nextLevelXP, levelName } = data;
  const progress = loading ? 0 : Math.min(100, Math.max(0, ((currentXP - levelXP) / (nextLevelXP - levelXP)) * 100));

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 w-full animate-fadeIn transition-all">
      <div className="flex justify-between items-end mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-amber-600 shadow-md flex items-center justify-center text-white font-bold text-xs">
            {levelName.split(':')[0].replace('Level ', 'L')}
          </div>
          <div>
            <span className="text-xs text-indigo-600 font-bold uppercase tracking-wider">{levelName}</span>
            <div className="text-xl font-bold text-gray-800">{currentXP} <span className="text-sm font-normal text-gray-500">XP</span></div>
          </div>
        </div>
        <div className="text-sm font-medium text-gray-500">
          {nextLevelXP - currentXP} XP to next
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
        <div 
          className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-3 rounded-full transition-all duration-1000 ease-out relative" 
          style={{ width: `${progress}%` }}
        >
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default XPProgressBar;
