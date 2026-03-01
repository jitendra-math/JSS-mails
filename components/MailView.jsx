"use client";

import { useEffect } from "react";
import { 
  FileText, Image as ImageIcon, FileArchive, 
  File, Download, Paperclip, ChevronLeft, Trash2 
} from "lucide-react";
import { triggerHaptic } from "@/lib/utils";

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

// Utility: Generate colorful avatar based on sender name
const getAvatarConfig = (name) => {
  const char = name ? name.charAt(0).toUpperCase() : "?";
  const colors = [
    "bg-blue-500", "bg-purple-500", "bg-green-500", 
    "bg-orange-500", "bg-pink-500", "bg-teal-500", "bg-indigo-500"
  ];
  const colorIndex = name ? name.charCodeAt(0) % colors.length : 0;
  return { char, colorClass: colors[colorIndex] };
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

  const handleClose = () => {
    triggerHaptic("light");
    onClose();
  };

  const handleDelete = () => {
    triggerHaptic("heavy");
    onDelete(mail);
  };

  const handleDone = () => {
    triggerHaptic("success");
    onClose();
  };

  const avatar = getAvatarConfig(mail.from);

  return (
    <div className="fixed inset-0 z-[60] bg-white flex flex-col safe-top animate-in slide-in-from-right duration-300">

      {/* 🪟 Luxury Frosted Header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-gray-100/50 bg-white/80 backdrop-blur-xl sticky top-0 z-20">
        <button
          onClick={handleClose}
          className="text-primary font-medium flex items-center gap-0.5 active:opacity-60 transition-opacity"
        >
          <ChevronLeft className="w-6 h-6" strokeWidth={2.5} />
          <span className="text-[17px] tracking-tight mb-[1px]">Back</span>
        </button>

        <button
          onClick={handleDelete}
          className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors active:scale-95"
          title="Delete Mail"
        >
          <Trash2 className="w-5 h-5" strokeWidth={2} />
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto bg-white flex flex-col relative z-0">
        
        {/* Email Meta Data with Avatar */}
        <div className="px-5 py-6">
          <h1 className="text-[26px] font-bold text-gray-900 leading-[1.15] tracking-tight mb-5">
            {mail.subject}
          </h1>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Premium Sender Avatar */}
              <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-sm ${avatar.colorClass}`}>
                {avatar.char}
              </div>
              <div className="flex flex-col">
                <span className="text-[15px] font-bold text-gray-900 tracking-tight leading-tight">{mail.from}</span>
                <span className="text-[13px] text-gray-500 font-medium tracking-tight">to {mail.folder === "sent" ? mail.to : "me"}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[12px] font-semibold text-gray-400">{mail.time}</div>
            </div>
          </div>
        </div>

        {/* Subtle Divider */}
        <div className="mx-5 border-b border-gray-100"></div>

        {/* --- PREMIUM ATTACHMENTS SECTION --- */}
        {mail.attachments && mail.attachments.length > 0 && (
          <div className="px-5 py-5 border-b border-gray-100 bg-gray-50/30">
            <div className="flex items-center gap-2 mb-3">
              <Paperclip className="w-4 h-4 text-gray-400" />
              <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                {mail.attachments.length} Attachments
              </h3>
            </div>
            
            {/* Horizontal Scrollable Grid for Attachments */}
            <div className="flex overflow-x-auto pb-2 gap-3 snap-x hide-scrollbar">
              {mail.attachments.map((att, idx) => (
                <div 
                  key={idx} 
                  className="snap-start flex-shrink-0 w-64 bg-white border border-gray-200/80 rounded-2xl p-3 flex items-center gap-3 shadow-sm active:scale-95 transition-all relative group"
                >
                  {/* Dynamic File Icon */}
                  <div className="flex-shrink-0 bg-gray-50 p-2.5 rounded-xl">
                    {getFileIcon(att.contentType, att.filename)}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-gray-800 truncate" title={att.filename}>
                      {att.filename}
                    </p>
                    <p className="text-[12px] text-gray-400 font-medium">
                      {formatBytes(att.size)}
                    </p>
                  </div>

                  {/* Download Button */}
                  <a 
                    href={att.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={() => triggerHaptic("light")}
                    className="flex-shrink-0 bg-blue-50 hover:bg-blue-100 text-blue-600 p-2.5 rounded-full transition-colors"
                    title="Download / View"
                  >
                    <Download className="w-4 h-4" strokeWidth={2.5} />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* ----------------------------------- */}

        {/* The Body (Iframe for HTML support with AGGRESSIVE MOBILE CSS) */}
        <div className="flex-1 relative min-h-[500px] bg-white">
          <iframe
            srcDoc={`
              <!DOCTYPE html>
              <html>
                <head>
                  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
                  <style>
                    /* Force everything to stay within the screen bounds */
                    html, body { 
                      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
                      padding: 12px !important; 
                      margin: 0 !important; 
                      width: 100vw !important;
                      max-width: 100% !important;
                      overflow-x: hidden !important; 
                      box-sizing: border-box !important;
                      color: #1c1c1e;
                      font-size: 15px;
                      line-height: 1.5;
                      -webkit-font-smoothing: antialiased;
                    }

                    /* Brahmastra for Tables (Instagram/Bank emails) */
                    table, thead, tbody, tfoot, tr, th, td, div, center {
                      max-width: 100% !important;
                      box-sizing: border-box !important;
                    }

                    /* Fix Images from breaking out */
                    img { 
                      max-width: 100% !important; 
                      height: auto !important; 
                      display: block !important;
                      margin: 12px 0 !important; 
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
                    (mail.text && mail.text !== "undefined") ? `<pre style="white-space: pre-wrap; font-family: inherit; font-size: 15px;">${mail.text}</pre>` : 
                    '<p style="color:#999; font-style:italic; text-align:center; margin-top:40px;">No content available for this email.</p>'
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

      {/* 🪟 Luxury Frosted Bottom Action Bar */}
      <div className="border-t border-white/40 px-6 py-4 flex justify-between items-center bg-white/80 backdrop-blur-2xl safe-bottom sticky bottom-0 z-20 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
        <button
          onClick={handleDelete}
          className="text-red-500 text-[15px] font-semibold tracking-wide active:scale-95 transition-transform"
        >
          Delete
        </button>

        <button
          onClick={handleDone}
          className="bg-primary text-white px-8 py-2.5 rounded-full text-[15px] font-bold shadow-[0_4px_14px_0_rgba(0,112,243,0.39)] hover:shadow-[0_6px_20px_rgba(0,118,255,0.23)] hover:bg-[rgba(0,118,255,0.9)] active:scale-95 transition-all"
        >
          Done
        </button>
      </div>
    </div>
  );
}
