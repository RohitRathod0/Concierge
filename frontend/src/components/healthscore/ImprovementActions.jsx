import React from 'react';

const ImprovementActions = ({ actions, onActionClick }) => {
  if (!actions || actions.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mt-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">How to Improve</h3>
      <div className="space-y-4">
        {actions.map((action, idx) => (
          <div key={idx} className="flex items-start p-4 rounded-xl border border-indigo-50 bg-indigo-50/30">
            <div className="bg-indigo-100 text-indigo-600 rounded-full w-8 h-8 flex items-center justify-center font-bold shrink-0 mr-4">
              +
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800 mb-1">{action.title}</h4>
              <p className="text-sm text-gray-600 mb-3">{action.description}</p>
              <button 
                onClick={() => onActionClick(action)}
                className="text-indigo-600 font-medium text-sm hover:text-indigo-700 underline underline-offset-2"
              >
                {action.ctaText}
              </button>
            </div>
            {action.pointsBoost && (
              <div className="text-right ml-2 shrink-0">
                <span className="text-green-600 font-bold block">+{action.pointsBoost}</span>
                <span className="text-xs text-gray-500">pts</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImprovementActions;
