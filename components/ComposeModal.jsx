"use client";

import { useState } from "react";
import { EMAIL_PROFILES } from "@/lib/constants";

export default function ComposeModal({ isOpen, onClose, onSent }) {
  // Setup default profile from constants
  const [from, setFrom] = useState(EMAIL_PROFILES[0].value);
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!to) return alert("Recipient required");

    try {
      setSending(true);

      const res = await fetch("/api/mail/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from, // Naya 'from' data API ko bhej rahe hain
          to,
          subject,
          html: message,
          text: message,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to send");
        return;
      }

      // Fields reset kar do
      setFrom(EMAIL_PROFILES[0].value);
      setTo("");
      setSubject("");
      setMessage("");

      onSent && onSent();
      onClose();

    } catch (err) {
      console.error(err);
      alert("Send failed");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end">
      
      {/* Modal */}
      <div className="w-full bg-white rounded-t-2xl shadow-xl p-4 h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={onClose}
            className="text-primary font-medium active:opacity-70"
          >
            Cancel
          </button>

          <h2 className="font-semibold">New Message</h2>

          <button
            onClick={handleSend}
            disabled={sending}
            className="text-primary font-semibold active:opacity-70 disabled:opacity-50"
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto pt-2">
          
          {/* From Selector (iOS Style) */}
          <div className="flex items-center border-b border-gray-100 py-3">
            <span className="text-gray-400 text-sm w-16">From:</span>
            <select 
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm text-gray-800 appearance-none font-medium"
            >
              {EMAIL_PROFILES.map((profile) => (
                <option key={profile.id} value={profile.value}>
                  {profile.label}
                </option>
              ))}
            </select>
          </div>

          {/* To */}
          <div className="flex items-center border-b border-gray-100 py-3">
            <span className="text-gray-400 text-sm w-16">To:</span>
            <input
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm"
            />
          </div>

          {/* Subject */}
          <div className="flex items-center border-b border-gray-100 py-3">
            <span className="text-gray-400 text-sm w-16">Subject:</span>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm font-semibold"
            />
          </div>

          {/* Message Area */}
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full mt-4 bg-transparent outline-none text-sm min-h-[300px] resize-none"
          />
        </div>

      </div>
    </div>
  );
}
