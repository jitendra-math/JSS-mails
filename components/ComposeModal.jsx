"use client";

import { useState } from "react";

export default function ComposeModal({ isOpen, onClose, onSent }) {
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
      <div className="w-full bg-white rounded-t-2xl shadow-xl p-4 max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onClose}
            className="text-blue-500 font-medium"
          >
            Cancel
          </button>

          <h2 className="font-semibold">New Message</h2>

          <button
            onClick={handleSend}
            disabled={sending}
            className="text-blue-500 font-semibold"
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </div>

        {/* To */}
        <input
          type="email"
          placeholder="To"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="w-full border-b py-2 outline-none text-sm"
        />

        {/* Subject */}
        <input
          type="text"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full border-b py-2 outline-none text-sm"
        />

        {/* Message */}
        <textarea
          placeholder="Message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full mt-3 outline-none text-sm min-h-[200px]"
        />
      </div>
    </div>
  );
}