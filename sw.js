self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', event => {
  let data = { title: 'פוסט', body: '', tab: 'gtm' };
  try {
    if (event.data) {
      const parsed = event.data.json();
      if (parsed && typeof parsed === 'object') data = Object.assign(data, parsed);
    }
  } catch (e) {
    try {
      const txt = event.data && event.data.text();
      if (txt) data.title = txt;
    } catch (e2) {}
  }
  const title = data.title || 'פוסט';
  const options = {
    body: data.body && data.body !== title ? data.body : '',
    icon: 'logo.svg',
    badge: 'logo.svg',
    dir: 'rtl',
    lang: 'he',
    tag: 'klober-push-' + (data.tab || 'gtm'),
    renotify: true,
    data: {
      tab: data.tab || 'gtm',
      url: data.url || ('./#' + (data.tab || 'gtm'))
    }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const tab = (event.notification.data && event.notification.data.tab) || 'gtm';
  const baseUrl = self.location.href.replace(/\/sw\.js.*$/, '/');
  const targetUrl = baseUrl + '#' + tab;
  event.waitUntil((async () => {
    const windowClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of windowClients) {
      if ('focus' in client) {
        await client.focus();
        try { client.postMessage({ type: 'KLOBER_OPEN_TAB', tab }); } catch (e) {}
        return;
      }
    }
    if (self.clients.openWindow) {
      return self.clients.openWindow(targetUrl);
    }
  })());
});
