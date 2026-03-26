import React, { useEffect, useState } from 'react';
import { MetricCard } from './MetricCard';
import { Map, Flag, Percent, TrendingUp } from 'lucide-react';
import { getToken } from '../../utils/storage';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const STAGE_COLORS = {
  discovery: 'bg-emerald-100 text-emerald-700',
  exploration: 'bg-blue-100 text-blue-700',
  commitment: 'bg-purple-100 text-purple-700',
  advocacy: 'bg-amber-100 text-amber-700',
};

export function JourneyProgressDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    fetch(`${API_BASE}/analytics/journey`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="h-40 bg-gray-100 rounded-2xl animate-pulse" />;
  }

  const stageEntries = Object.entries(data?.users_by_stage || {}).sort((a, b) => b[1] - a[1]);
  const totalUsers = data?.total_users || 1;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Journey Progress</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricCard title="Total Users" value={totalUsers} icon={Map} color="#6366f1" />
        <MetricCard
          title="Milestone Rate"
          value={`${((data?.milestone_completion_rate || 0) * 100).toFixed(0)}%`}
          icon={Flag}
          color="#10b981"
          description={`${data?.completed_milestones || 0} / ${data?.total_milestones || 0}`}
        />
        <MetricCard
          title="Completed Milestones"
          value={data?.completed_milestones ?? '—'}
          icon={Percent}
          color="#f59e0b"
        />
        <MetricCard
          title="Total Milestones"
          value={data?.total_milestones ?? '—'}
          icon={TrendingUp}
          color="#ec4899"
        />
      </div>

      {/* Stage distribution bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Users by Stage</p>
        {stageEntries.length === 0 && (
          <p className="text-xs text-gray-400">No journey data yet</p>
        )}
        {stageEntries.map(([stage, count]) => {
          const pct = Math.round((count / totalUsers) * 100);
          const colorClass = STAGE_COLORS[stage] || 'bg-gray-100 text-gray-700';
          return (
            <div key={stage} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className={`capitalize font-semibold px-2 py-0.5 rounded-full ${colorClass}`}>{stage}</span>
                <span className="text-gray-500 font-medium">{count} users ({pct}%)</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: { discovery: '#10b981', exploration: '#3b82f6', commitment: '#8b5cf6', advocacy: '#f59e0b' }[stage] || '#6b7280',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
