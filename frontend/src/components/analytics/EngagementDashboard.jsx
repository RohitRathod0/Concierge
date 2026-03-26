import React, { useEffect, useState } from 'react';
import { MetricCard } from './MetricCard';
import { Users, MessageSquare, Clock, Activity } from 'lucide-react';
import { getToken } from '../../utils/storage';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export function EngagementDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    fetch(`${API_BASE}/analytics/engagement?days=7`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => setData(d.metrics))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">User Engagement (Last 7 Days)</h3>
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <MetricCard
            title="Daily Active Users"
            value={data?.daily_active_users ?? '—'}
            trend="up"
            icon={Users}
            color="#3b82f6"
            description="Unique users who messaged"
          />
          <MetricCard
            title="Total Sessions"
            value={data?.total_sessions ?? '—'}
            icon={MessageSquare}
            color="#10b981"
            description="Conversations started"
          />
          <MetricCard
            title="Avg Messages / Session"
            value={data?.avg_messages_per_session ?? '—'}
            icon={Activity}
            color="#8b5cf6"
            description="Conversation depth"
          />
          <MetricCard
            title="Period (Days)"
            value="7"
            icon={Clock}
            color="#f59e0b"
            description={data ? `${data.start_date?.slice(0, 10)} → ${data.end_date?.slice(0, 10)}` : ''}
          />
        </div>
      )}
    </div>
  );
}
