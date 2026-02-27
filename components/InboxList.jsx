"use client";

import { useQuery } from "@tanstack/react-query";

export default function InboxList({ onOpenMail, folder = "inbox" }) {
  // TanStack Query: Caching aur background refresh handle karta hai
  const { data, isLoading, isError } = useQuery({
    queryKey: ["emails", folder], // Har folder ki apni alag cache hogi
    queryFn: async () => {
      const res = await fetch(`/api/api/mail/inbox?folder=${folder}`);
      const result = await res.json();
      if (!result.success) throw new Error("Fetch failed");
      return result.emails;
    },
  });

  // Helper function to extract prefix for the badge (e.g., jitu from jitu@...)
  const getAlias = (email) => {
    if (!email) return "mail";
    return email.split("@")[0].toLowerCase();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-3">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-gray-400 font-medium">Updating Inbox...</p>
      </div>
    );
  }

  if (isError || !data?.length) {
    let emptyMsg = "No emails yet 📭";
    if (folder === "sent") emptyMsg = "No sent emails 📤";
    if (folder === "trash") emptyMsg = "Trash is empty 🗑️";

    return (
      <div className="p-20 text-center flex flex-col items-center">
        <span className="text-4xl mb-4 opacity-50">📭</span>
        <p className="text-gray-400 font-medium">{emptyMsg}</p>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-28 space-y-3"> {/* Bottom padding for Nav Bar */}
      {data.map((mail) => (
        <div
          key={mail.id}
          onClick={() => onOpenMail(mail)}
          className={`relative bg-white rounded-2xl p-4 shadow-sm border border-gray-100 active:scale-[0.98] transition-all duration-200 cursor-pointer ${
            !mail.read ? "ring-1 ring-primary/10" : "opacity-90"
          }`}
        >
          {/* Top Row: Sender & Time */}
          <div className="flex justify-between items-start mb-1">
            <div className="flex flex-col">
              {/* Recipient Alias Badge (Apple Style) */}
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary/60 mb-1">
                {getAlias(mail.to)}@
              </span>
              <span className={`text-sm tracking-tight ${!mail.read ? "font-bold text-black" : "font-medium text-gray-600"}`}>
                {folder === "sent" ? `To: ${mail.to}` : mail.from}
              </span>
            </div>
            <span className="text-[11px] text-gray-400 font-medium">
              {mail.time}
            </span>
          </div>

          {/* Subject Line */}
          <div className={`text-[15px] leading-tight mb-1 truncate ${!mail.read ? "font-bold text-gray-900" : "font-medium text-gray-700"}`}>
            {mail.subject}
          </div>

          {/* Preview Text */}
          <div className="text-[13px] text-gray-500 line-clamp-2 leading-snug">
            {mail.preview}
          </div>

          {/* Unread Blue Dot Indicator */}
          {!mail.read && (
            <div className="absolute top-4 left-[-10px] w-2 h-2 bg-primary rounded-full shadow-[0_0_8px_rgba(0,122,255,0.5)]"></div>
          )}
        </div>
      ))}
    </div>
  );
}
