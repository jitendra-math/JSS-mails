"use client";

import { useEffect, useState } from "react";

export default function InboxList({ onOpenMail, refreshKey }) {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInbox = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/mail/inbox");
      const data = await res.json();

      if (data.success) {
        setEmails(data.emails);
      }
    } catch (err) {
      console.error("Inbox fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInbox();
  }, [refreshKey]);

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading mails...
      </div>
    );
  }

  if (!emails.length) {
    return (
      <div className="p-10 text-center text-gray-400">
        No emails yet 📭
      </div>
    );
  }

  return (
    <div className="divide-y">
      {emails.map((mail) => (
        <div
          key={mail.id}
          onClick={() => onOpenMail(mail)}
          className={`px-4 py-3 active:bg-gray-100 transition cursor-pointer ${
            !mail.read ? "bg-blue-50" : ""
          }`}
        >
          <div className="flex justify-between items-center">
            <span className={`text-sm ${!mail.read ? "font-semibold" : ""}`}>
              {mail.from}
            </span>
            <span className="text-xs text-gray-500">
              {mail.time}
            </span>
          </div>

          <div className={`text-sm mt-1 ${!mail.read ? "font-semibold" : ""}`}>
            {mail.subject}
          </div>

          <div className="text-xs text-gray-500 mt-1 truncate">
            {mail.preview}
          </div>
        </div>
      ))}
    </div>
  );
}