// Jab backend se notification aayegi, toh ye 'push' event trigger hoga
self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.json();
    
    // Notification ka premium look (Notification bar ke liye)
    const options = {
      body: data.body, // Email ka subject
      icon: '/logo.png', // Bada icon jo notification me dikhega
      badge: '/logo.png', // Chota icon jo upar status bar me dikhega
      vibrate: [200, 100, 200, 100, 200], // Premium vibration pattern
      data: {
        url: data.url || '/', // Click karne pe kahan open karna hai
      },
      requireInteraction: true // Taki notification apne aap gayab na ho, user jab tak swipe na kare
    };

    // Ye line system-level notification bar mein banner girati hai (app open ho ya band)
    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

// Jab user notification bar mein aayi hui notification par tap karega
self.addEventListener('notificationclick', function (event) {
  event.notification.close(); // Notification ko notification panel se hata do

  // User ko seedha app mein le aao (Dashboard par)
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Agar pehle se koi tab open hai, toh usko focus kar do
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      // Agar koi tab open nahi hai, toh nayi window/tab khol do
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    })
  );
});
