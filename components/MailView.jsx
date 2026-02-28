"use client";

import { useEffect } from "react";

export default function MailView({ mail, onClose, onDelete }) {
  if (!mail) return null;

  // Mark as read logic preserved
  useEffect(() => {
    if (!mail.read) {
      fetch("/api/mail/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: mail.id }),
      }).catch((err) => console.error("Mark read failed", err));
    }
  }, [mail]);

  return (
    <div className="fixed inset-0 z-[60] bg-white flex flex-col safe-top animate-in slide-in-from-right duration-300">

      {/* Luxury Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white/90 backdrop-blur-md sticky top-0">
        <button
          onClick={onClose}
          className="text-primary font-medium flex items-center gap-1 active:opacity-60"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          Back
        </button>

        <button
          onClick={() => onDelete(mail)}
          className="text-red-500 text-sm font-semibold active:opacity-60"
        >
          Delete
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto bg-white flex flex-col">
        
        {/* Email Meta Data */}
        <div className="px-5 py-6 border-b border-gray-50">
          <h1 className="text-2xl font-bold text-gray-900 leading-tight tracking-tight mb-3">
            {mail.subject}
          </h1>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm text-gray-400">From:</span>
              <span className="text-sm font-semibold text-gray-800">{mail.from}</span>
            </div>
            <div className="text-right">
              <div className="text-[11px] font-bold text-gray-300 uppercase tracking-widest">Received</div>
              <div className="text-xs font-medium text-gray-500">{mail.time}</div>
            </div>
          </div>
        </div>

        {/* The Body (Iframe for HTML support with strict undefined checks) */}
        <div className="flex-1 relative min-h-[400px]">
          <iframe
            srcDoc={`
              <!DOCTYPE html>
              <html>
                <head>
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <style>
                    body { 
                      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
                      padding: 20px; 
                      margin: 0; 
                      line-height: 1.6;
                      color: #222;
                      word-break: break-word;
                      -webkit-font-smoothing: antialiased;
                    }
                    img { max-width: 100%; height: auto; border-radius: 8px; margin: 10px 0; }
                    a { color: #007AFF; text-decoration: none; }
                    p { margin-bottom: 1em; }
                  </style>
                </head>
                <body>
                  ${
                    (mail.html && mail.html !== "undefined") ? mail.html : 
                    (mail.text && mail.text !== "undefined") ? `<pre style="white-space: pre-wrap; font-family: inherit;">${mail.text}</pre>` : 
                    '<p style="color:gray; font-style:italic;">No content available for this email.</p>'
                  }
                </body>
              </html>
            `}
            className="w-full h-full border-none"
            title="Email Content"
            sandbox="allow-same-origin"
          />
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="border-t border-gray-100 px-6 py-4 flex justify-between items-center bg-gray-50/50 safe-bottom">
        <button
          onClick={() => onDelete(mail)}
          className="text-red-500 text-sm font-bold tracking-wide uppercase active:scale-95 transition"
        >
          Move to Trash
        </button>

        <button
          onClick={onClose}
          className="bg-gray-900 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg active:scale-95 transition"
        >
          Done
        </button>
      </div>
    </div>
  );
}
