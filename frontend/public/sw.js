// ET AI Concierge — Service Worker for Web Push Notifications
// Handles push events, notification click actions, and offline caching

const CACHE_VERSION = 'et-v1';

// ---- Push event: show notification when received ----
self.addEventListener('push', event => {
  if (!event.data) return;
  
  let data = {};
  try { data = event.data.json(); } 
  catch (e) { data = { title: 'ET AI Concierge', body: event.data.text() }; }

  const options = {
    body: data.body || '',
    icon: data.icon || '/vite.svg',
    badge: data.badge || '/vite.svg',
    tag: data.tag || 'et-notification',
    data: data.data || { url: '/' },
    actions: data.actions || [],
    vibrate: [200, 100, 200],
    requireInteraction: false,
    silent: false,
    timestamp: Date.now(),
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'ET AI Concierge', options)
  );
});

// ---- Notification click: open the correct page ----
self.addEventListener('notificationclick', event => {
  event.notification.close();

  const action = event.action;
  const notifData = event.notification.data || {};
  let targetUrl = notifData.url || '/';

  // Action-specific routing
  if (action === 'view_ipo') targetUrl = '/ipo';
  else if (action === 'continue') targetUrl = '/masterclass';
  else if (action === 'open_dashboard') targetUrl = '/dashboard';
  else if (action === 'grab_deal') targetUrl = '/et-prime';
  else if (action === 'read_news') targetUrl = '/news';
  else if (action === 'view_course') targetUrl = '/masterclass';
  else if (action === 'come_back') targetUrl = '/dashboard';
  else if (action === 'dismiss') return;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      // If app already open, navigate there
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          client.navigate(targetUrl);
          return;
        }
      }
      // Open new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// ---- Push subscription change handler ----
self.addEventListener('pushsubscriptionchange', event => {
  event.waitUntil(
    fetch('/api/v1/notifications/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: event.newSubscription?.endpoint,
        p256dh: '',
        auth: '',
      })
    })
  );
});

console.log('[ET SW] Service worker loaded v1');
