import React, { useState } from 'react';
import { X, ExternalLink, BookOpen, Star, Zap } from 'lucide-react';

const SERVICE_ICONS = {
  'ET Prime': '👑',
  'Masterclass': '🎓',
  'ET Markets': '📈',
  'Wealth Summit': '🏆',
};

const getIcon = (serviceName) => {
  for (const [key, icon] of Object.entries(SERVICE_ICONS)) {
    if (serviceName.includes(key)) return icon;
  }
  return '💡';
};

export default function RecommendedForYou({ recommendations = [], onDismiss }) {
  const [dismissed, setDismissed] = useState([]);

  const visible = recommendations.filter((_, i) => !dismissed.includes(i));

  if (!visible.length) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2 bg-gradient-to-r from-orange-50 to-amber-50">
        <Zap className="w-4 h-4 text-orange-500" />
        <span className="text-sm font-bold text-gray-800">Recommended for You</span>
        <span className="ml-auto text-[10px] text-gray-400 font-medium uppercase tracking-wide">Based on your profile</span>
      </div>

      {/* Cards */}
      <div className="divide-y divide-gray-100">
        {visible.slice(0, 3).map((rec, i) => (
          <div key={i} className="relative px-4 py-3 group hover:bg-orange-50/40 transition-colors">
            {/* Dismiss */}
            <button
              onClick={() => setDismissed(d => [...d, recommendations.indexOf(rec)])}
              className="absolute top-2 right-2 text-gray-300 hover:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div className="flex gap-3 items-start pr-4">
              <div className="text-2xl flex-shrink-0 mt-0.5">
                {getIcon(rec.service)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-gray-900 text-sm leading-tight mb-0.5 truncate">
                  {rec.service}
                </div>
                <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-2">
                  {rec.reason}
                </p>
                {rec.value && (
                  <div className="bg-green-50 border border-green-200 rounded-md px-2 py-1 mb-2 text-xs text-green-700 font-medium">
                    💰 {rec.value}
                  </div>
                )}
                {rec.urgency && (
                  <div className="text-[10px] text-orange-600 font-semibold mb-2">
                    ⚡ {rec.urgency}
                  </div>
                )}
                <button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-xs font-bold py-1.5 px-3 rounded-lg transition-all flex items-center justify-center gap-1 shadow-sm">
                  <ExternalLink className="w-3 h-3" />
                  {rec.cta || 'Learn More'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
