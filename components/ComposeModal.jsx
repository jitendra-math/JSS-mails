"use client";

import { useState, useRef } from "react";
import { EMAIL_PROFILES } from "@/lib/constants";

export default function ComposeModal({ isOpen, onClose, onSent }) {
  const [from, setFrom] = useState(EMAIL_PROFILES[0].value);
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [viewMode, setViewMode] = useState("code"); 

  // --- Attachments ke naye states ---
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // File Upload Logic
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      // Tumhari banayi hui Vercel Blob API call ho rahi hai
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      // Success hone par file list mein add kar do
      setAttachments((prev) => [...prev, { filename: data.name, url: data.url }]);

    } catch (err) {
      console.error(err);
      alert("Attachment upload failed: " + err.message);
    } finally {
      setUploading(false);
      e.target.value = ""; // Taki same file dobara select ho sake
    }
  };

  const removeAttachment = (indexToRemove) => {
    setAttachments((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

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
          text: message,
          // Resend API url ko 'path' field se accept karta hai
          attachments: attachments.map(att => ({
            filename: att.filename,
            path: att.url 
          }))
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
      setAttachments([]); // Naya: Attachments bhi clear karo

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
            disabled={sending || uploading}
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

          {/* Subject with Attachment Button */}
          <div className="flex items-center border-b border-gray-100 py-3">
            <span className="text-gray-400 text-sm w-16">Subject:</span>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm font-semibold"
              placeholder="Email subject..."
            />
            
            {/* Hidden File Input */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden" 
            />
            
            {/* Paperclip Icon Button */}
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="ml-2 text-gray-400 hover:text-primary active:opacity-60 disabled:opacity-50"
            >
              {uploading ? (
                <span className="animate-spin text-sm">↻</span>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                </svg>
              )}
            </button>
          </div>

          {/* Uploaded Attachments Chips */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 py-3 border-b border-gray-100">
              {attachments.map((att, index) => (
                <div key={index} className="flex items-center bg-gray-100 text-xs px-3 py-1.5 rounded-full">
                  <span className="text-gray-700 truncate max-w-[150px]">{att.filename}</span>
                  <button 
                    onClick={() => removeAttachment(index)}
                    className="ml-2 text-gray-400 hover:text-red-500 font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Toggle Code / Preview */}
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
