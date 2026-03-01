"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  SwipeableList, 
  SwipeableListItem, 
  SwipeAction, 
  TrailingActions, 
  LeadingActions 
} from 'react-swipeable-list';
import 'react-swipeable-list/dist/styles.css';
import { Mail, MailOpen, Trash2, Inbox, Send, RefreshCw } from "lucide-react";
import { triggerHaptic } from "@/lib/utils";

// --- 1. Premium Sender Avatar Component (Clearbit API + Fallback) ---
const SenderAvatar = ({ fromString }) => {
  const [imgError, setImgError] = useState(false);

  // Extract Email & Name from string (e.g., "Jitendra <jitendra@jss.com>" -> "jitendra@jss.com")
  const emailMatch = (fromString || "").match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
  const email = emailMatch ? emailMatch[1] : fromString;
  const nameMatch = (fromString || "").match(/^([^<]+)/);
  const name = nameMatch ? nameMatch[1].trim() : email;

  // Extract Domain for Logo Fetching
  let domain = null;
  if (email && email.includes('@')) {
    const extractedDomain = email.split('@')[1].toLowerCase();
    // In free providers ke liye generic logo aane se acha hai humara colorful initial aaye
    const freeDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'aol.com'];
    if (!freeDomains.includes(extractedDomain)) {
      domain = extractedDomain;
    }
  }

  // Fallback Avatar Generator
  const char = (name || "?").charAt(0).toUpperCase();
  const colors = ["bg-blue-500", "bg-purple-500", "bg-green-500", "bg-orange-500", "bg-pink-500", "bg-teal-500", "bg-indigo-500"];
  const colorIndex = name ? name.charCodeAt(0) % colors.length : 0;
  const bgColor = colors[colorIndex];

  // If domain exists and image hasn't failed, show Clearbit Logo
  if (domain && !imgError) {
    return (
      <div className="w-11 h-11 flex-shrink-0 rounded-full overflow-hidden bg-white border border-gray-100 flex items-center justify-center shadow-sm">
        <img
          src={`https://logo.clearbit.com/${domain}`}
          alt={name}
          className="w-[75%] h-[75%] object-contain"
          onError={() => setImgError(true)} // Fail hote hi text avatar pe switch
          loading="lazy"
        />
      </div>
    );
  }

  // Fallback: Show Premium Colorful Initial
  return (
    <div className={`w-11 h-11 flex-shrink-0 rounded-full flex items-center justify-center text-white text-[17px] font-bold shadow-sm ${bgColor}`}>
      {char}
    </div>
  );
};

// --- 2. Premium Skeleton Loader ---
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 flex gap-3.5">
    <div className="w-11 h-11 rounded-full bg-gray-100 animate-pulse flex-shrink-0"></div>
    <div className="flex-1 flex flex-col gap-2 pt-1">
      <div className="flex justify-between items-center">
        <div className="h-3 w-1/3 bg-gray-200 rounded-full animate-pulse"></div>
        <div className="h-2 w-10 bg-gray-100 rounded-full animate-pulse"></div>
      </div>
      <div className="h-3 w-3/4 bg-gray-200 rounded-full animate-pulse mt-1"></div>
      <div className="h-2.5 w-full bg-gray-100 rounded-full animate-pulse"></div>
    </div>
  </div>
);

export default function InboxList({ onOpenMail, folder = "inbox" }) {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, isRefetching, refetch } = useQuery({
    queryKey: ["emails", folder],
    queryFn: async () => {
      const res = await fetch(`/api/mail/inbox?folder=${folder}`);
      const result = await res.json();
      if (!result.success) throw new Error("Fetch failed");
      return result.emails;
    },
  });

  const getAlias = (email) => {
    if (!email) return "mail";
    return email.split("@")[0].toLowerCase();
  };

  // --- Swipe Actions Logic ---
  const handleMarkRead = async (mail) => {
    triggerHaptic("medium");
    try {
      await fetch("/api/mail/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: mail.id }),
      });
      queryClient.invalidateQueries({ queryKey: ["emails"] });
    } catch (e) { console.error(e); }
  };

  const handleTrash = async (mail) => {
    triggerHaptic("heavy");
    const isPermanent = folder === "trash";
    try {
      await fetch("/api/mail/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: mail.id, permanent: isPermanent }),
      });
      queryClient.invalidateQueries({ queryKey: ["emails"] });
    } catch (e) { console.error(e); }
  };

  const leadingActions = (mail) => (
    <LeadingActions>
      <SwipeAction onClick={() => handleMarkRead(mail)}>
        <div className="bg-blue-500 w-full flex items-center px-6 justify-start rounded-2xl my-1 text-white shadow-inner">
          {mail.read ? <Mail className="w-6 h-6" /> : <MailOpen className="w-6 h-6" />}
        </div>
      </SwipeAction>
    </LeadingActions>
  );

  const trailingActions = (mail) => (
    <TrailingActions>
      <SwipeAction onClick={() => handleTrash(mail)} destructive={true}>
        <div className="bg-red-500 w-full flex items-center px-6 justify-end rounded-2xl my-1 text-white shadow-inner">
          <Trash2 className="w-6 h-6" />
        </div>
      </SwipeAction>
    </TrailingActions>
  );

  // --- Empty State ---
  if (isError || (!isLoading && !data?.length)) {
    const emptyState = {
      inbox: { icon: <Inbox className="w-16 h-16 text-gray-300 mb-4" />, msg: "All caught up!", sub: "Your inbox is clear." },
      sent: { icon: <Send className="w-16 h-16 text-gray-300 mb-4" />, msg: "No sent mails", sub: "Start a conversation." },
      trash: { icon: <Trash2 className="w-16 h-16 text-gray-300 mb-4" />, msg: "Trash is empty", sub: "Nothing to see here." }
    };
    const current = emptyState[folder] || emptyState.inbox;

    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-6">
        <div className="animate-in fade-in zoom-in duration-500 flex flex-col items-center">
          {current.icon}
          <h3 className="text-xl font-bold text-gray-800 tracking-tight">{current.msg}</h3>
          <p className="text-gray-400 font-medium mt-1">{current.sub}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-2 pb-32">
      
      {/* Pull to Refresh Indicator */}
      {isRefetching && !isLoading && (
        <div className="flex justify-center py-3 animate-in fade-in slide-in-from-top-2">
          <div className="bg-white shadow-md rounded-full px-4 py-1.5 flex items-center gap-2 border border-gray-100">
            <RefreshCw className="w-4 h-4 text-primary animate-spin" />
            <span className="text-[13px] font-bold text-gray-600 tracking-wide">Updating...</span>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3 mt-4">
          {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <SwipeableList threshold={0.25} type="ios">
          <div className="space-y-2.5 mt-2">
            {data.map((mail) => (
              <SwipeableListItem
                key={mail.id}
                leadingActions={leadingActions(mail)}
                trailingActions={trailingActions(mail)}
              >
                <div
                  onClick={() => onOpenMail(mail)}
                  className={`w-full relative overflow-hidden bg-white rounded-2xl p-4 shadow-sm border active:scale-[0.98] transition-all duration-200 cursor-pointer my-0.5 ${
                    !mail.read ? "border-blue-100/60 bg-blue-50/40" : "border-gray-100 opacity-95"
                  }`}
                >
                  {/* --- Absolute Left Unread Bar (Zero Layout Shift) --- */}
                  {!mail.read && (
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500 shadow-[2px_0_8px_rgba(59,130,246,0.3)]"></div>
                  )}

                  <div className="flex items-start gap-3.5">
                    
                    {/* Left: Premium Avatar / Logo */}
                    <SenderAvatar fromString={folder === "sent" ? mail.to : mail.from} />

                    {/* Right: Mail Content (min-w-0 prevents text overflow) */}
                    <div className="flex-1 min-w-0 flex flex-col pt-0.5">
                      
                      <div className="flex justify-between items-center mb-0.5 gap-2">
                        {/* Sender Name & Blue Dot */}
                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                          <span className={`text-[15px] truncate tracking-tight ${!mail.read ? "font-bold text-gray-900" : "font-semibold text-gray-700"}`}>
                            {folder === "sent" ? `To: ${mail.to}` : mail.from}
                          </span>
                          {!mail.read && (
                            <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 shadow-[0_0_6px_rgba(59,130,246,0.6)]"></div>
                          )}
                        </div>
                        {/* Time */}
                        <span className={`text-[12px] flex-shrink-0 ${!mail.read ? "font-bold text-primary" : "font-medium text-gray-400"}`}>
                          {mail.time}
                        </span>
                      </div>

                      {/* Alias / System info */}
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary/50 mb-1">
                        {getAlias(mail.to)}@
                      </span>

                      {/* Subject Line */}
                      <div className={`text-[14px] leading-snug mb-0.5 truncate ${!mail.read ? "font-bold text-gray-900" : "font-medium text-gray-800"}`}>
                        {mail.subject}
                      </div>

                      {/* Preview Text */}
                      <div className="text-[13px] text-gray-500 line-clamp-2 leading-relaxed font-medium">
                        {mail.preview}
                      </div>
                      
                    </div>
                  </div>
                </div>
              </SwipeableListItem>
            ))}
          </div>
        </SwipeableList>
      )}
    </div>
  );
}
