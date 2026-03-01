"use client";

import { useState, useRef } from "react";
import { EMAIL_PROFILES } from "@/lib/constants";
import { triggerHaptic } from "@/lib/utils";
import { Paperclip, X, ChevronDown, Send, Code, Eye, Loader2 } from "lucide-react";

export default function ComposeModal({ isOpen, onClose, onSent }) {
  const [from, setFrom] = useState(EMAIL_PROFILES[0].value);
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [viewMode, setViewMode] = useState("code"); 

  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      triggerHaptic("light");
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Upload failed");

      triggerHaptic("success");
      setAttachments((prev) => [...prev, { filename: data.name, url: data.url }]);

    } catch (err) {
      console.error(err);
      triggerHaptic("heavy");
      alert("Attachment upload failed: " + err.message);
    } finally {
      setUploading(false);
      e.target.value = ""; 
    }
  };

  const removeAttachment = (indexToRemove) => {
    triggerHaptic("light");
    setAttachments((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSend = async () => {
    if (!to) {
      triggerHaptic("heavy");
      return alert("Recipient required");
    }

    try {
      triggerHaptic("medium");
      setSending(true);

      const res = await fetch("/api/mail/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from, to, subject, html: message, text: message,
          attachments: attachments.map(att => ({ filename: att.filename, path: att.url }))
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        triggerHaptic("heavy");
        alert(data.error || "Failed to send");
        return;
      }

      setFrom(EMAIL_PROFILES[0].value);
      setTo(""); setSubject(""); setMessage("");
      setViewMode("code"); setAttachments([]);

      onSent && onSent();
      onClose();

    } catch (err) {
      console.error(err);
      triggerHaptic("heavy");
      alert("Send failed");
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    triggerHaptic("light");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black/30 backdrop-blur-[2px] flex items-end sm:items-center sm:justify-center animate-in fade-in duration-300">
      
      {/* 🪟 Premium Modal */}
      <div className="w-full sm:w-[500px] bg-white rounded-t-[32px] sm:rounded-[32px] shadow-[0_-20px_60px_rgba(0,0,0,0.1)] p-5 h-[92vh] sm:h-[85vh] flex flex-col animate-in slide-in-from-bottom-full duration-400 ease-out">

        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors active:scale-95"
          >
            <ChevronDown className="w-5 h-5" strokeWidth={2.5} />
          </button>

          <h2 className="font-bold text-gray-900 text-lg tracking-tight">New Message</h2>

          <button
            onClick={handleSend}
            disabled={sending || uploading}
            className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
              sending || uploading 
                ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                : "bg-primary text-white hover:bg-blue-600 shadow-[0_4px_12px_rgba(0,112,243,0.3)] hover:shadow-[0_6px_16px_rgba(0,112,243,0.4)] active:scale-95"
            }`}
          >
            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" strokeWidth={2.5} />}
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto flex flex-col hide-scrollbar">
          
          {/* From Selector */}
          <div className="flex items-center py-3 border-b border-gray-50 focus-within:border-primary/30 transition-colors">
            <span className="text-gray-400 text-[13px] font-medium w-14">From:</span>
            <select 
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="flex-1 bg-transparent outline-none text-[15px] text-gray-800 appearance-none font-semibold truncate pr-4"
            >
              {EMAIL_PROFILES.map((profile) => (
                <option key={profile.id} value={profile.value}>
                  {profile.label}
                </option>
              ))}
            </select>
          </div>

          {/* To */}
          <div className="flex items-center py-3 border-b border-gray-50 focus-within:border-primary/30 transition-colors group">
            <span className="text-gray-400 text-[13px] font-medium w-14">To:</span>
            <input
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="flex-1 bg-transparent outline-none text-[15px] font-medium placeholder:text-gray-300"
              placeholder="recipient@example.com"
            />
          </div>

          {/* Subject with Attachment Button */}
          <div className="flex items-center py-3 border-b border-gray-50 focus-within:border-primary/30 transition-colors">
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="flex-1 bg-transparent outline-none text-[16px] font-bold text-gray-900 placeholder:text-gray-300 placeholder:font-semibold"
              placeholder="Subject"
            />
            
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
            
            <button 
              onClick={() => {
                triggerHaptic("light");
                fileInputRef.current?.click();
              }}
              disabled={uploading}
              className="ml-2 text-gray-400 hover:text-primary p-2 rounded-full hover:bg-primary/5 transition-all active:scale-90"
            >
              {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Paperclip className="w-5 h-5" strokeWidth={2} />}
            </button>
          </div>

          {/* Uploaded Attachments Chips */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 py-3 border-b border-gray-50">
              {attachments.map((att, index) => (
                <div key={index} className="flex items-center bg-gray-100/80 border border-gray-200/50 text-xs px-3 py-1.5 rounded-full animate-in zoom-in-95 duration-200">
                  <span className="text-gray-700 truncate max-w-[140px] font-medium">{att.filename}</span>
                  <button 
                    onClick={() => removeAttachment(index)}
                    className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Toggle Code / Preview (Apple Segmented Control Style) */}
          <div className="flex p-1 mt-5 bg-gray-100/70 rounded-xl">
            <button
              onClick={() => { triggerHaptic("light"); setViewMode("code"); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[13px] font-bold rounded-lg transition-all duration-300 ${
                viewMode === "code" ? "bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] text-primary" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Code className="w-4 h-4" /> Code
            </button>
            <button
              onClick={() => { triggerHaptic("light"); setViewMode("preview"); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[13px] font-bold rounded-lg transition-all duration-300 ${
                viewMode === "preview" ? "bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] text-primary" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Eye className="w-4 h-4" /> Preview
            </button>
          </div>

          {/* Editor / Preview Area */}
          <div className="flex-1 mt-3 relative min-h-[250px] mb-2">
            {viewMode === "code" ? (
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your email here..."
                className="absolute inset-0 w-full h-full bg-gray-50/50 hover:bg-gray-50 p-4 rounded-2xl outline-none text-[14px] font-mono text-gray-700 resize-none border border-gray-100 focus:border-primary/30 transition-colors leading-relaxed"
              />
            ) : (
              <div className="absolute inset-0 w-full h-full bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-sm">
                <iframe
                  srcDoc={`
                    <!DOCTYPE html>
                    <html>
                      <head>
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <style>
                          body { 
                            font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", Roboto, Helvetica, Arial, sans-serif; 
                            padding: 16px; 
                            margin: 0; 
                            word-break: break-word;
                            color: #1c1c1e;
                            font-size: 15px;
                            line-height: 1.5;
                          }
                        </style>
                      </head>
                      <body>
                        ${message || '<p style="color:#a1a1aa; font-weight:500; text-align:center; margin-top: 40px;">Your preview will appear here</p>'}
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
