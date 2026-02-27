"use client";

import { useState } from "react";
import Header from "@/components/Header";
import InboxList from "@/components/InboxList";
import MailView from "@/components/MailView";
import ComposeModal from "@/components/ComposeModal";
import BottomNav from "@/components/BottomNav";

export default function DashboardPage() {
  const [selectedMail, setSelectedMail] = useState(null);
  const [showCompose, setShowCompose] = useState(false);
  const [refreshKey, setRefreshKey] = useState(Date.now());
  const [currentFolder, setCurrentFolder] = useState("inbox");

  // refresh mails
  const refreshMails = () => {
    setRefreshKey(Date.now());
  };

  return (
    <div className="min-h-screen bg-softbg relative pb-safe">

      {/* Header */}
      <Header
        onCompose={() => setShowCompose(true)}
      />

      {/* Mail list based on active folder */}
      <InboxList
        folder={currentFolder}
        refreshKey={refreshKey}
        onOpenMail={(mail) => setSelectedMail(mail)}
      />

      {/* Open mail view */}
      <MailView
        mail={selectedMail}
        onClose={() => {
          setSelectedMail(null);
          refreshMails();
        }}
        onDelete={async (mail) => {
          // Agar pehle se trash me hai, toh permanent delete karo
          const isPermanent = currentFolder === "trash";
          
          await fetch("/api/mail/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: mail.id, permanent: isPermanent }),
          });

          setSelectedMail(null);
          refreshMails();
        }}
      />

      {/* Compose modal */}
      <ComposeModal
        isOpen={showCompose}
        onClose={() => setShowCompose(false)}
        onSent={refreshMails}
      />

      {/* Premium Bottom Navigation */}
      <BottomNav 
        activeFolder={currentFolder}
        onChangeFolder={(folder) => {
          setCurrentFolder(folder);
          setSelectedMail(null); // Tab change karne par open mail band ho jaye
        }}
      />
      
    </div>
  );
}
