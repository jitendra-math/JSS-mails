"use client";

import { useEffect } from "react";
import { FileText, Image as ImageIcon, FileArchive, File, Download, Paperclip } from "lucide-react";

// Utility: Bytes ko properly KB/MB me convert karne ke liye
const formatBytes = (bytes, decimals = 1) => {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

// Utility: File type ke hisaab se premium icon return karne ke liye
const getFileIcon = (contentType, filename) => {
  const type = (contentType || "").toLowerCase();
  const name = (filename || "").toLowerCase();

  if (type.includes("image") || name.match(/\.(jpeg|jpg|gif|png|webp)$/)) {
    return <ImageIcon className="text-blue-500 w-8 h-8" />;
  }
  if (type.includes("pdf") || name.endsWith(".pdf")) {
    return <FileText className="text-red-500 w-8 h-8" />;
  }
  if (type.includes("zip") || type.includes("tar") || type.includes("rar") || name.match(/\.(zip|rar|tar|gz)$/)) {
    return <FileArchive className="text-yellow-500 w-8 h-8" />;
  }
  return <File className="text-gray-500 w-8 h-8" />;
};

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
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white/90 backdrop-blur-md sticky top-0 z-10">
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

        {/* --- PREMIUM ATTACHMENTS SECTION --- */}
        {mail.attachments && mail.attachments.length > 0 && (
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-2 mb-3">
              <Paperclip className="w-4 h-4 text-gray-400" />
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                {mail.attachments.length} Attachments
              </h3>
            </div>
            
            {/* Horizontal Scrollable Grid for Attachments */}
            <div className="flex overflow-x-auto pb-2 gap-3 snap-x hide-scrollbar">
              {mail.attachments.map((att, idx) => (
                <div 
                  key={idx} 
                  className="snap-start flex-shrink-0 w-60 bg-white border border-gray-200 rounded-2xl p-3 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow relative group"
                >
                  {/* Dynamic File Icon */}
                  <div className="flex-shrink-0 bg-gray-50 p-2 rounded-xl">
                    {getFileIcon(att.contentType, att.filename)}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate" title={att.filename}>
                      {att.filename}
                    </p>
                    <p className="text-xs text-gray-400 font-medium">
                      {formatBytes(att.size)}
                    </p>
                  </div>

                  {/* Download Button (Direct Link to Vercel Blob) */}
                  <a 
                    href={att.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-shrink-0 bg-gray-100 hover:bg-primary/10 hover:text-primary p-2 rounded-full text-gray-400 transition-colors"
                    title="Download / View"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* ----------------------------------- */}

        {/* The Body (Iframe for HTML support with AGGRESSIVE MOBILE CSS) */}
        <div className="flex-1 relative min-h-[400px]">
          <iframe
            srcDoc={`
              <!DOCTYPE html>
              <html>
                <head>
                  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
                  <style>
                    /* Force everything to stay within the screen bounds */
                    html, body { 
                      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
                      padding: 10px !important; 
                      margin: 0 !important; 
                      width: 100vw !important;
                      max-width: 100% !important;
                      overflow-x: hidden !important; /* Blocks horizontal scrolling */
                      box-sizing: border-box !important;
                      color: #222;
                      -webkit-font-smoothing: antialiased;
                    }

                    /* Brahmastra for Tables (Instagram/Bank emails) */
                    table, thead, tbody, tfoot, tr, th, td, div, center {
                      width: 100% !important;
                      max-width: 100% !important;
                      min-width: 0 !important;
                      display: block !important; /* Breaks the rigid table layout */
                      box-sizing: border-box !important;
                      clear: both !important;
                    }

                    /* Fix Images from breaking out */
                    img { 
                      max-width: 100% !important; 
                      height: auto !important; 
                      display: block !important;
                      margin: 10px auto !important; 
                      border-radius: 8px;
                    }

                    /* Fix long links and text */
                    a, p, span, h1, h2, h3, h4, h5, h6 { 
                      word-wrap: break-word !important; 
                      word-break: break-word !important; 
                      white-space: normal !important;
                      max-width: 100% !important;
                    }
                    
                    a { color: #007AFF; text-decoration: none; }
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
