"use client";

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

// --- 1. Premium Skeleton Loader (Apple Style) ---
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 flex flex-col gap-2">
    <div className="flex justify-between items-center">
      <div className="h-3 w-1/4 bg-gray-200 rounded-full animate-pulse"></div>
      <div className="h-2 w-12 bg-gray-100 rounded-full animate-pulse"></div>
    </div>
    <div className="h-4 w-3/4 bg-gray-200 rounded-full animate-pulse"></div>
    <div className="h-3 w-full bg-gray-100 rounded-full animate-pulse mt-1"></div>
    <div className="h-3 w-5/6 bg-gray-100 rounded-full animate-pulse"></div>
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

  // --- 2. Swipe Actions Logic ---
  const handleMarkRead = async (mail) => {
    triggerHaptic("medium");
    try {
      // Optimistic update kar sakte hain, abhi direct API call
      await fetch("/api/mail/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: mail.id }), // Assume toggle hota hai
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

  // Swipe Right (Unread/Read)
  const leadingActions = (mail) => (
    <LeadingActions>
      <SwipeAction onClick={() => handleMarkRead(mail)}>
        <div className="bg-blue-500 w-full flex items-center px-6 justify-start rounded-2xl my-1 text-white shadow-inner">
          {mail.read ? <Mail className="w-6 h-6" /> : <MailOpen className="w-6 h-6" />}
        </div>
      </SwipeAction>
    </LeadingActions>
  );

  // Swipe Left (Trash)
  const trailingActions = (mail) => (
    <TrailingActions>
      <SwipeAction onClick={() => handleTrash(mail)} destructive={true}>
        <div className="bg-red-500 w-full flex items-center px-6 justify-end rounded-2xl my-1 text-white shadow-inner">
          <Trash2 className="w-6 h-6" />
        </div>
      </SwipeAction>
    </TrailingActions>
  );

  // --- 3. Empty State (Inbox Zero Vibe) ---
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
      
      {/* --- 4. Pull to Refresh Indicator (Native iOS feel) --- */}
      {isRefetching && !isLoading && (
        <div className="flex justify-center py-3 animate-in fade-in slide-in-from-top-2">
          <div className="bg-white shadow-md rounded-full px-4 py-1.5 flex items-center gap-2 border border-gray-100">
            <RefreshCw className="w-4 h-4 text-primary animate-spin" />
            <span className="text-xs font-bold text-gray-600 tracking-wide">Updating...</span>
          </div>
        </div>
      )}

      {/* --- 5. Skeletons or Mail List --- */}
      {isLoading ? (
        <div className="space-y-3 mt-4">
          {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <SwipeableList threshold={0.25} type="ios">
          <div className="space-y-3 mt-2">
            {data.map((mail) => (
              <SwipeableListItem
                key={mail.id}
                leadingActions={leadingActions(mail)}
                trailingActions={trailingActions(mail)}
              >
                <div
                  onClick={() => onOpenMail(mail)}
                  className={`w-full relative bg-white rounded-2xl p-4 shadow-sm border border-gray-100 active:scale-[0.98] transition-all duration-200 cursor-pointer my-1 ${
                    !mail.read ? "ring-1 ring-primary/20 bg-blue-50/10" : "opacity-95"
                  }`}
                >
                  {/* Top Row: Sender & Time */}
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary/60 mb-1">
                        {getAlias(mail.to)}@
                      </span>
                      <span className={`text-[15px] tracking-tight ${!mail.read ? "font-bold text-black" : "font-semibold text-gray-700"}`}>
                        {folder === "sent" ? `To: ${mail.to}` : mail.from}
                      </span>
                    </div>
                    <span className={`text-[11px] font-semibold ${!mail.read ? "text-primary" : "text-gray-400"}`}>
                      {mail.time}
                    </span>
                  </div>

                  {/* Subject Line */}
                  <div className={`text-[14px] leading-tight mb-1 truncate ${!mail.read ? "font-bold text-gray-900" : "font-medium text-gray-800"}`}>
                    {mail.subject}
                  </div>

                  {/* Preview Text */}
                  <div className="text-[13px] text-gray-500 line-clamp-2 leading-snug font-medium pr-4">
                    {mail.preview}
                  </div>

                  {/* Unread Blue Dot Indicator (Perfectly positioned) */}
                  {!mail.read && (
                    <div className="absolute top-1/2 -translate-y-1/2 left-2 w-2.5 h-2.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
                  )}
                </div>
              </SwipeableListItem>
            ))}
          </div>
        </SwipeableList>
      )}
    </div>
  );
}
