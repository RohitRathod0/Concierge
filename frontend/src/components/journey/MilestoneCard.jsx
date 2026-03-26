import React from 'react';
import { CheckCircle, Lock, Clock, Star } from 'lucide-react';

const STATE_CONFIG = {
  completed: {
    icon: CheckCircle,
    bg: 'bg-green-50',
    border: 'border-green-200',
    iconColor: 'text-green-500',
    badgeColor: 'bg-green-100 text-green-700',
    label: 'Completed',
  },
  in_progress: {
    icon: Clock,
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    iconColor: 'text-blue-500',
    badgeColor: 'bg-blue-100 text-blue-700',
    label: 'In Progress',
  },
  locked: {
    icon: Lock,
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    iconColor: 'text-gray-400',
    badgeColor: 'bg-gray-100 text-gray-500',
    label: 'Locked',
  },
};

/**
 * MilestoneCard - Displays a single milestone with state (completed/in_progress/locked)
 */
export function MilestoneCard({ milestone }) {
  const { name, completed, reward_points, completed_at, stage } = milestone;

  const state = completed ? 'completed' : 'in_progress';
  const config = STATE_CONFIG[state];
  const Icon = config.icon;

  const friendlyName = name
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-xl border ${config.bg} ${config.border} transition-all duration-200`}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 ${config.iconColor}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">{friendlyName}</p>
        {completed_at && (
          <p className="text-xs text-gray-500">
            {new Date(completed_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </p>
        )}
      </div>
      {reward_points > 0 && (
        <div className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full flex-shrink-0">
          <Star className="w-3 h-3" />
          {reward_points}
        </div>
      )}
    </div>
  );
}
