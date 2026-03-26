import React from 'react';

const ScoreBreakdown = ({ breakdown }) => {
  const categories = [
    { key: "diversification_score", label: "Diversification", max: 215 },
    { key: "protection_score", label: "Protection", max: 170 },
    { key: "emergency_fund_score", label: "Emergency Fund", max: 170 },
    { key: "knowledge_score", label: "Knowledge", max: 125 },
    { key: "growth_trajectory_score", label: "Growth Trajectory", max: 170 }
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">Score Breakdown</h3>
      <div className="space-y-5">
        {categories.map((cat) => {
          const val = breakdown[cat.key] || 0;
          const percentage = (val / cat.max) * 100;
          
          return (
            <div key={cat.key}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium text-gray-700">{cat.label}</span>
                <span className="text-gray-500">{val}/{cat.max}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div 
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-1000 ease-out" 
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScoreBreakdown;
