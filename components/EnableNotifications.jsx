"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { triggerHaptic } from "@/lib/utils";

// Ye function tere VAPID Public Key ko browser ke samajhne laayak format (Uint8Array) mein badalta hai
const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export default function EnableNotifications() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check karna ki pehle se allow toh nahi kar rakha
  useEffect(() => {
    if ("Notification" in window && navigator.serviceWorker) {
      navigator.serviceWorker.ready.then(reg => {
        reg.pushManager.getSubscription().then(sub => {
          if (sub) setIsSubscribed(true);
        });
      });
    }
  }, []);

  const handleSubscribe = async () => {
    triggerHaptic("medium");

    if (!("Notification" in window)) {
      alert("Teri browser mein notification support nahi hai bhai.");
      return;
    }

    // Permission mangna
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      triggerHaptic("heavy");
      alert("Notification allow nahi ki gayi!");
      return;
    }

    setLoading(true);
    try {
      // Service worker activate karna
      const registration = await navigator.serviceWorker.ready;
      
      // Apni public key yahan fetch karna (.env se)
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) throw new Error("Public Key missing in .env");

      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

      // Browser se Token Generate karwana
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });

      // Token ko apne MongoDB API mein bhej dena
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription,
          // Dummy userId (Agar tere paas asli user ID hai auth se, toh wo daalna, varna ye chalega)
          userId: "1234567890abcdef12345678", 
          userAgent: navigator.userAgent
        })
      });

      if (!res.ok) throw new Error("Failed to save to DB");

      triggerHaptic("success");
      setIsSubscribed(true);
      alert("Mubarak ho! Notifications on ho gayi hain 🎉");

    } catch (err) {
      console.error(err);
      triggerHaptic("heavy");
      alert("Kuch gadbad ho gayi: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Agar pehle se allow kar diya hai, toh ye button chhip jayega
  if (isSubscribed) return null;

  return (
    <button
      onClick={handleSubscribe}
      disabled={loading}
      className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-bold shadow-sm transition-all active:scale-95 border border-blue-200"
    >
      <Bell className={`w-4 h-4 ${loading ? "animate-pulse" : ""}`} strokeWidth={2.5} />
      {loading ? "Turning On..." : "Turn On Notifications"}
    </button>
  );
}
