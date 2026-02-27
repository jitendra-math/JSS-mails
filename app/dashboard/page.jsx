"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Header from "@/components/Header";
import InboxList from "@/components/InboxList";
import MailView from "@/components/MailView";
import ComposeModal from "@/components/ComposeModal";
import BottomNav from "@/components/BottomNav";

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const [selectedMail, setSelectedMail] = useState(null);
  const [showCompose, setShowCompose] = useState(false);
  const [currentFolder, setCurrentFolder] = useState("inbox");

  // Manual key ki zaroorat nahi, sirf cache ko 'invalid' mark karna hai
  const refreshMails = () => {
    queryClient.invalidateQueries({ queryKey: ["emails"] });
  };

  return (
    <div className="min-h-screen bg-softbg relative pb-safe">

      {/* Header */}
      <Header
        onCompose={() => setShowCompose(true)}
      />

      {/* Mail list - No refreshKey needed anymore */}
      <InboxList
        folder={currentFolder}
        onOpenMail={(mail) => setSelectedMail(mail)}
      />

      {/* Open mail view */}
      <MailView
        mail={selectedMail}
        onClose={() => {
          setSelectedMail(null);
          refreshMails(); // Cache refresh when closing (to update read status)
        }}
        onDelete={async (mail) => {
          const isPermanent = currentFolder === "trash";
          
          try {
            await fetch("/api/mail/delete", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id: mail.id, permanent: isPermanent }),
            });

            setSelectedMail(null);
            refreshMails(); // Instant UI update
          } catch (err) {
            console.error("Delete failed", err);
          }
        }}
      />

      {/* Compose modal */}
      <ComposeModal
        isOpen={showCompose}
        onClose={() => setShowCompose(false)}
        onSent={refreshMails} // Instant update after sending
      />

      {/* Premium Bottom Navigation */}
      <BottomNav 
        activeFolder={currentFolder}
        onChangeFolder={(folder) => {
          setCurrentFolder(folder);
          setSelectedMail(null);
        }}
      />
      
    </div>
  );
}
