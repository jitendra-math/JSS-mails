// Ye event tab trigger hota hai jab Vercel/Resend backend se notification bhejta hai
self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.json();
    
    // Notification ka premium look set kar rahe hain
    const options = {
      body: data.body,
      icon: '/logo.png', // Tera JSS Mail ka logo aayega
      badge: '/logo.png', // Chota icon status bar ke liye
      vibrate: [200, 100, 200, 100, 200], // Premium iOS/Android feel vibration
      data: {
        url: data.url || '/', // Click karne pe kahan bhejna hai
      },
    };

    // Phone ki screen par pop-up dikhao
    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

// Ye event tab trigger hota hai jab user notification par tap (click) karta hai
self.addEventListener('notificationclick', function (event) {
  event.notification.close(); // Notification ko hata do

  // User ko seedha app ke andar (Inbox me) le aao
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
