"use client";

import { useState } from "react";
import { EMAIL_PROFILES } from "@/lib/constants";

export default function ComposeModal({ isOpen, onClose, onSent }) {
  const [from, setFrom] = useState(EMAIL_PROFILES[0].value);
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  
  // Naya state: Toggle between "code" and "preview"
  const [viewMode, setViewMode] = useState("code"); 

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!to) return alert("Recipient required");

    try {
      setSending(true);

      const res = await fetch("/api/mail/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from,
          to,
          subject,
          html: message,
          // Fallback text humara backend (route.js) khud stripHtml karke bana lega
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
      setViewMode("code");

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
      
      {/* Modal - h-[95vh] thoda aur bada kiya for better coding space */}
      <div className="w-full bg-white rounded-t-3xl shadow-2xl p-4 h-[95vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={onClose}
            className="text-primary font-medium active:opacity-70 text-base"
          >
            Cancel
          </button>

          <h2 className="font-semibold text-gray-900 text-lg tracking-tight">New Message</h2>

          <button
            onClick={handleSend}
            disabled={sending}
            className="text-primary font-semibold active:opacity-70 disabled:opacity-50 text-base"
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto pt-2 flex flex-col">
          
          {/* From Selector */}
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
              placeholder="recipient@example.com"
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
              placeholder="Email subject..."
            />
          </div>

          {/* Apple Style Segmented Control (Toggle) */}
          <div className="flex p-1 mt-4 bg-gray-100/80 rounded-lg">
            <button
              onClick={() => setViewMode("code")}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                viewMode === "code" ? "bg-white shadow-sm text-black" : "text-gray-500"
              }`}
            >
              Code
            </button>
            <button
              onClick={() => setViewMode("preview")}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                viewMode === "preview" ? "bg-white shadow-sm text-black" : "text-gray-500"
              }`}
            >
              Preview
            </button>
          </div>

          {/* Editor / Preview Area */}
          <div className="flex-1 mt-3 relative min-h-[300px]">
            {viewMode === "code" ? (
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="<h1>Hello World</h1>&#10;<p>Write your HTML here...</p>"
                className="absolute inset-0 w-full h-full bg-gray-50/50 p-4 rounded-xl outline-none text-xs font-mono text-gray-800 resize-none border border-gray-100 focus:border-primary/30 transition-colors"
              />
            ) : (
              <div className="absolute inset-0 w-full h-full bg-white border border-gray-200 rounded-xl overflow-hidden shadow-inner">
                <iframe
                  srcDoc={`
                    <!DOCTYPE html>
                    <html>
                      <head>
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <style>
                          body { 
                            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
                            padding: 16px; 
                            margin: 0; 
                            word-break: break-word;
                            color: #111;
                          }
                        </style>
                      </head>
                      <body>
                        ${message || '<p style="color:#999; font-style:italic; text-align:center; margin-top: 20px;">Your HTML preview will appear here...</p>'}
                      </body>
                    </html>
                  `}
                  className="w-full h-full border-none"
                  sandbox="allow-same-origin"
                />
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
