"use client";

import { useEffect, useState } from "react";

export default function InboxList({ onOpenMail, refreshKey, folder = "inbox" }) {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInbox = async () => {
    try {
      setLoading(true);

      // Folder query parameter API me pass kar rahe hain
      const res = await fetch(`/api/mail/inbox?folder=${folder}`);
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

  // Jab bhi refreshKey YA folder change hoga, API wapas call hogi
  useEffect(() => {
    fetchInbox();
  }, [refreshKey, folder]);

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500 text-sm mt-10">
        Loading...
      </div>
    );
  }

  if (!emails.length) {
    // Dynamic empty state message
    let emptyMsg = "No emails yet 📭";
    if (folder === "sent") emptyMsg = "No sent emails 📤";
    if (folder === "trash") emptyMsg = "Trash is empty 🗑️";

    return (
      <div className="p-10 text-center text-gray-400 mt-10">
        {emptyMsg}
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100 pb-20"> {/* pb-20 for bottom nav padding */}
      {emails.map((mail) => (
        <div
          key={mail.id}
          onClick={() => onOpenMail(mail)}
          className={`px-4 py-3 active:bg-gray-100 transition cursor-pointer ${
            !mail.read ? "bg-blue-50/50" : ""
          }`}
        >
          <div className="flex justify-between items-center">
            <span className={`text-sm ${!mail.read ? "font-semibold text-gray-900" : "text-gray-700"}`}>
              {/* Agar sent folder hai toh 'To', warna 'From' dikhaye */}
              {folder === "sent" ? `To: ${mail.to}` : mail.from}
            </span>
            <span className="text-xs text-gray-400">
              {mail.time}
            </span>
          </div>

          <div className={`text-sm mt-0.5 ${!mail.read ? "font-semibold text-gray-900" : "text-gray-800"}`}>
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
