"use client";

import { useEffect } from "react";

export default function MailView({ mail, onClose, onDelete }) {
  if (!mail) return null;

  // mark as read when opened
  useEffect(() => {
    if (!mail.read) {
      fetch("/api/mail/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: mail.id }),
      }).catch(() => {});
    }
  }, [mail]);

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-white/80 backdrop-blur">
        <button
          onClick={onClose}
          className="text-blue-500 font-medium"
        >
          Back
        </button>

        <div className="flex items-center gap-4">
          <button
            onClick={() => onDelete(mail)}
            className="text-red-500 text-sm"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">

        {/* Subject */}
        <h1 className="text-lg font-semibold leading-snug">
          {mail.subject}
        </h1>

        {/* From + time */}
        <div className="mt-2 text-sm text-gray-500">
          From: {mail.from}
        </div>

        <div className="text-xs text-gray-400 mb-4">
          {mail.time}
        </div>

        {/* Body */}
        <div
          className="text-sm leading-relaxed"
          dangerouslySetInnerHTML={{
            __html: mail.html || mail.text,
          }}
        />
      </div>

      {/* Bottom actions */}
      <div className="border-t px-4 py-3 flex justify-between bg-white">
        <button
          onClick={() => onDelete(mail)}
          className="text-red-500 text-sm"
        >
          Move to Trash
        </button>

        <button
          onClick={onClose}
          className="text-blue-500 text-sm"
        >
          Done
        </button>
      </div>
    </div>
  );
}