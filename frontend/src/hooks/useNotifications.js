import { useState, useEffect, useCallback, useRef } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function useNotifications() {
  const [permission, setPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const swRegRef = useRef(null);

  // Register service worker on mount
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => {
          swRegRef.current = reg;
          checkSubscription(reg);
        })
        .catch(err => console.warn('[ET Notifications] SW registration failed:', err));
    }
    fetchHistory();
  }, []);

  const checkSubscription = async (reg) => {
    try {
      const sub = await reg.pushManager.getSubscription();
      setIsSubscribed(!!sub);
    } catch (e) {}
  };

  const fetchHistory = async () => {
    try {
      const resp = await fetch(`${API_URL}/api/v1/notifications/history?limit=20`);
      if (resp.ok) {
        const data = await resp.json();
        let notifs = data.notifications || [];

        // Inject dynamic mock notifications if history is empty
        if (notifs.length === 0) {
          const now = Date.now();
          notifs = [
            {
              id: 'mock-1',
              title: '🚨 Zomato Q3 Results are OUT',
              body: 'Zomato posts ₹138 crore PAT in Q3. Revenue from operations up 69% YoY. View analysis.',
              sent_at: new Date(now - 1 * 60 * 60 * 1000).toISOString(),
              is_read: false,
            },
            {
              id: 'mock-2',
              title: '⭐ Mutual Fund Portfolio Review',
              body: 'Your SIP in Parag Parikh Flexi Cap is up 18% this year. Here is your mid-year review.',
              sent_at: new Date(now - 6 * 60 * 60 * 1000).toISOString(),
              is_read: false,
            },
            {
              id: 'mock-3',
              title: '🎓 Pick up where you left off',
              body: 'You paused "Derivatives Trading for Beginners" midway. You are 2 modules away from completing it.',
              sent_at: new Date(now - 12 * 60 * 60 * 1000).toISOString(),
              is_read: true,
            }
          ];
        }

        setNotifications(notifs);
        setUnreadCount(notifs.filter(n => !n.is_read).length);
      }
    } catch (e) {}
  };

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return 'denied';
    setLoading(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === 'granted') {
        await subscribe();
      }
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  const subscribe = useCallback(async () => {
    try {
      // Get VAPID public key from backend
      const keyResp = await fetch(`${API_URL}/api/v1/notifications/vapid-key`);
      if (!keyResp.ok) return;
      const { public_key } = await keyResp.json();
      
      const reg = swRegRef.current || await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(public_key),
      });
      const subJson = subscription.toJSON();
      
      // Send to backend
      const resp = await fetch(`${API_URL}/api/v1/notifications/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: subJson.endpoint,
          p256dh: subJson.keys?.p256dh || '',
          auth: subJson.keys?.auth || '',
          user_agent: navigator.userAgent,
        }),
      });
      if (resp.ok) {
        setIsSubscribed(true);
        console.log('[ET Notifications] Subscribed to push!');
      }
    } catch (e) {
      console.warn('[ET Notifications] Subscribe failed:', e);
    }
  }, []);

  const simulateTrigger = useCallback(async (triggerName) => {
    try {
      const resp = await fetch(`${API_URL}/api/v1/notifications/simulate/${triggerName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await resp.json();
      await fetchHistory();
      return data;
    } catch (e) {
      return null;
    }
  }, []);

  const markRead = useCallback(async (id) => {
    await fetch(`${API_URL}/api/v1/notifications/mark-read/${id}`, { method: 'POST' });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllRead = useCallback(() => {
    notifications.forEach(n => { if (!n.is_read) markRead(n.id); });
  }, [notifications, markRead]);

  return {
    permission,
    isSubscribed,
    notifications,
    unreadCount,
    loading,
    requestPermission,
    simulateTrigger,
    markRead,
    markAllRead,
    fetchHistory,
  };
}
