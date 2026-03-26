import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * MetricCard - Reusable KPI metric display card
 * Props: title, value, change (number %, positive = good), trend ('up'|'down'|'flat'), icon, color
 */
export function MetricCard({ title, value, change, trend = 'flat', icon: Icon, color = '#3b82f6', description }) {
  const trendIcon =
    trend === 'up' ? TrendingUp :
    trend === 'down' ? TrendingDown :
    Minus;
  const TrendIcon = trendIcon;

  const trendColor =
    trend === 'up' ? 'text-green-600' :
    trend === 'down' ? 'text-red-500' :
    'text-gray-400';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</p>
        {Icon && (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: color + '18' }}>
            <Icon className="w-4 h-4" style={{ color }} />
          </div>
        )}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-gray-900">{value ?? '—'}</span>
        {change !== undefined && (
          <div className={`flex items-center gap-0.5 mb-0.5 text-xs font-semibold ${trendColor}`}>
            <TrendIcon className="w-3.5 h-3.5" />
            {Math.abs(change)}%
          </div>
        )}
      </div>
      {description && <p className="text-xs text-gray-400">{description}</p>}
    </div>
  );
}
