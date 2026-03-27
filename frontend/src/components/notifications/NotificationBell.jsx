import React, { useState } from 'react';
import { Bell, Zap, X } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';

const TRIGGERS = [
  { key: 'ipo_fomo', label: '🚨 IPO FOMO', color: 'bg-red-500' },
  { key: 'course_nudge', label: '😴 Course Nudge', color: 'bg-purple-500' },
  { key: 're_engagement_3d', label: '🏦 3-Day Absent', color: 'bg-blue-500' },
  { key: 're_engagement_7d', label: '💔 7-Day Absent', color: 'bg-indigo-500' },
  { key: 'flash_sale', label: '⚡ Flash Sale', color: 'bg-orange-500' },
  { key: 'news_digest', label: '📰 News Digest', color: 'bg-green-500' },
  { key: 'masterclass_reminder', label: '🎓 Masterclass', color: 'bg-teal-500' },
  { key: 'portfolio_alert', label: '📉 Portfolio Alert', color: 'bg-red-600' },
];

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.round(diff / 3600)}h ago`;
  return `${Math.round(diff / 86400)}d ago`;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [firing, setFiring] = useState(null);
  const [toast, setToast] = useState(null);
  const {
    permission, isSubscribed, notifications, unreadCount,
    loading, requestPermission, simulateTrigger, markRead, markAllRead, fetchHistory
  } = useNotifications();

  const handleSimulate = async (triggerKey) => {
    setFiring(triggerKey);
    const result = await simulateTrigger(triggerKey);
    setFiring(null);
    if (result) {
      const label = TRIGGERS.find(t => t.key === triggerKey)?.label || triggerKey;
      setToast(`${label} notification sent!`);
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => { setOpen(!open); if (!open) fetchHistory(); }}
        className="relative text-gray-500 hover:text-gray-900 transition-colors"
        id="notification-bell"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[9px] font-extrabold flex items-center justify-center ring-2 ring-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-[9999] bg-gray-900 text-white text-xs px-4 py-2 rounded-xl shadow-xl font-medium animate-fade-in">
          ✅ {toast}
        </div>
      )}

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-8 w-96 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div>
              <h3 className="font-extrabold text-gray-900 text-sm">Notifications</h3>
              <p className="text-[10px] text-gray-500">{unreadCount} unread · {notifications.length} total</p>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-[10px] text-blue-600 font-semibold hover:underline">
                  Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Permission prompt */}
          {permission !== 'granted' && (
            <div className="px-4 py-3 bg-orange-50 border-b border-orange-100">
              <p className="text-xs text-orange-800 font-medium mb-2">
                {permission === 'denied'
                  ? '⛔ Notifications blocked in browser settings. Enable in browser → Site Settings.'
                  : '🔔 Enable push notifications to get IPO alerts, flash sales & more!'}
              </p>
              {permission !== 'denied' && (
                <button
                  onClick={requestPermission}
                  disabled={loading}
                  className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg disabled:opacity-50"
                >
                  {loading ? 'Enabling...' : '🔔 Enable Push Notifications'}
                </button>
              )}
            </div>
          )}
          {permission === 'granted' && isSubscribed && (
            <div className="px-4 py-2 bg-green-50 border-b border-green-100 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
              <span className="text-[10px] text-green-700 font-semibold">Push notifications active ✓</span>
            </div>
          )}

          {/* Notification History */}
          <div className="max-h-48 overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <div className="px-4 py-6 text-center text-xs text-gray-400">
                No notifications yet. Simulate one below! ↓
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${!n.is_read ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex items-start gap-2">
                    {!n.is_read && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />}
                    <div className={!n.is_read ? '' : 'pl-3.5'}>
                      <p className="text-xs font-bold text-gray-900 leading-tight">{n.title}</p>
                      <p className="text-[10px] text-gray-500 leading-relaxed mt-0.5 line-clamp-2">{n.body}</p>
                      <p className="text-[9px] text-gray-400 mt-1">{timeAgo(n.sent_at)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 🧪 Test Panel */}
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
            <div className="flex items-center gap-1 mb-2">
              <Zap className="w-3 h-3 text-orange-500" />
              <span className="text-[10px] font-extrabold text-gray-700 uppercase tracking-wide">Test Triggers</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {TRIGGERS.map(t => (
                <button
                  key={t.key}
                  onClick={() => handleSimulate(t.key)}
                  disabled={!!firing}
                  className={`text-[10px] font-bold text-white py-1.5 px-2 rounded-lg transition-all ${t.color} hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-1`}
                >
                  {firing === t.key ? '⏳' : t.label}
                </button>
              ))}
            </div>
            <p className="text-[9px] text-gray-400 mt-2 text-center">
              Push needs browser permission. In-app log always works.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
