import React, { useEffect, useState } from 'react';
import { ProgressRing } from './ProgressRing';
import { MilestoneCard } from './MilestoneCard';
import { Trophy, ChevronRight, Zap } from 'lucide-react';
import { getToken } from '../../utils/storage';

const STAGES = [
  { key: 'discovery', label: 'Discovery', emoji: '🌱', color: '#10b981' },
  { key: 'exploration', label: 'Exploration', emoji: '🔍', color: '#3b82f6' },
  { key: 'commitment', label: 'Commitment', emoji: '🤝', color: '#8b5cf6' },
  { key: 'advocacy', label: 'Advocacy', emoji: '🏆', color: '#f59e0b' },
];

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

/**
 * JourneyMap - Full journey visualization with stage progress and milestones.
 * Fetches journey data from GET /journey/current
 */
export function JourneyMap() {
  const [journey, setJourney] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchJourney();
  }, []);

  const fetchJourney = async () => {
    try {
      const token = getToken();
      if (!token) { setLoading(false); return; }

      const res = await fetch(`${API_BASE}/journey/current`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load journey');
      const data = await res.json();
      setJourney(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="flex gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-16 w-16 bg-gray-200 rounded-xl flex-1" />)}
        </div>
      </div>
    );
  }

  if (error || !journey) {
    return null; // Silently hide if journey not available
  }

  const currentStageIdx = STAGES.findIndex(s => s.key === journey.current_stage);
  const completedMilestones = (journey.milestones || []).filter(m => m.completed).length;
  const totalMilestones = (journey.milestones || []).length;
  const progressPercent = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            Your Learning Journey
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {journey.total_points || 0} points earned · Day {journey.days_in_stage} of current stage
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
          <Zap className="w-3 h-3" />
          Velocity {journey.velocity_score || '0.0'}/wk
        </div>
      </div>

      {/* Stage progress bar */}
      <div className="flex items-center gap-1">
        {STAGES.map((stage, idx) => {
          const isPast = idx < currentStageIdx;
          const isCurrent = idx === currentStageIdx;
          const isFuture = idx > currentStageIdx;
          return (
            <React.Fragment key={stage.key}>
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-base font-bold transition-all
                    ${isCurrent ? 'shadow-md ring-2 ring-offset-1' : ''}
                    ${isPast ? 'bg-green-100' : isCurrent ? 'bg-white' : 'bg-gray-100'}`}
                  style={isCurrent ? { ringColor: stage.color } : {}}
                >
                  <span>{stage.emoji}</span>
                </div>
                <span
                  className={`mt-1 text-[10px] font-semibold text-center leading-tight
                    ${isCurrent ? 'text-gray-900' : isFuture ? 'text-gray-400' : 'text-gray-600'}`}
                >
                  {stage.label}
                </span>
              </div>
              {idx < STAGES.length - 1 && (
                <div className={`h-0.5 flex-1 rounded-full mb-4 ${idx < currentStageIdx ? 'bg-green-300' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Stage progress ring + milestones */}
      <div className="flex gap-5 items-start">
        <ProgressRing
          percent={progressPercent}
          size={72}
          strokeWidth={6}
          color={STAGES[currentStageIdx]?.color || '#3b82f6'}
          label={`${progressPercent}%`}
          sublabel="done"
        />
        <div className="flex-1 space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Current Milestones</p>
          {(journey.milestones || []).slice(0, 3).map(m => (
            <MilestoneCard key={m.name} milestone={m} />
          ))}
          {totalMilestones === 0 && (
            <p className="text-xs text-gray-400">No milestones yet — send your first message!</p>
          )}
        </div>
      </div>

      {/* Recommended actions */}
      {(journey.recommended_actions || []).length > 0 && (
        <div className="border-t border-gray-100 pt-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Next Steps</p>
          <ul className="space-y-1.5">
            {journey.recommended_actions.slice(0, 2).map((action, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                <ChevronRight className="w-3.5 h-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
                {action}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
