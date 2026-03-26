import React, { useEffect, useState } from 'react';
import { MetricCard } from './MetricCard';
import { Bot, Timer, CheckCircle2, BarChart3 } from 'lucide-react';
import { getToken } from '../../utils/storage';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export function AgentPerformanceDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    fetch(`${API_BASE}/analytics/agents?days=7`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const agents = data?.agents || [];
  const avgSuccessRate = agents.length
    ? (agents.reduce((s, a) => s + (a.success_rate || 0), 0) / agents.length * 100).toFixed(1)
    : '—';
  const avgResponseMs = agents.length
    ? Math.round(agents.reduce((s, a) => s + (a.avg_response_time_ms || 0), 0) / agents.length)
    : '—';

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Agent Performance (Last 7 Days)</h3>
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <MetricCard title="Agents Active" value={agents.length} icon={Bot} color="#6366f1" description="Unique agent types invoked" />
            <MetricCard title="Avg Success Rate" value={avgSuccessRate === '—' ? '—' : `${avgSuccessRate}%`} trend="up" icon={CheckCircle2} color="#10b981" />
            <MetricCard title="Avg Response (ms)" value={avgResponseMs} icon={Timer} color="#f59e0b" description="Mean response latency" />
            <MetricCard title="Total Calls" value={agents.reduce((s, a) => s + a.total_calls, 0)} icon={BarChart3} color="#ec4899" />
          </div>
          {agents.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-gray-50">
                  <tr>
                    {['Agent', 'Calls', 'Avg ms', 'Success'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {agents.map(agent => (
                    <tr key={agent.agent_name} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-2.5 font-semibold text-gray-800 capitalize">{agent.agent_name.replace('_', ' ')}</td>
                      <td className="px-4 py-2.5 text-gray-600">{agent.total_calls}</td>
                      <td className="px-4 py-2.5 text-gray-600">{agent.avg_response_time_ms}</td>
                      <td className="px-4 py-2.5">
                        <span className={`font-bold ${agent.success_rate >= 0.9 ? 'text-green-600' : 'text-amber-500'}`}>
                          {(agent.success_rate * 100).toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
