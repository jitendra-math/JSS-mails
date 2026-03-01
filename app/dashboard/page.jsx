"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Header from "@/components/Header";
import InboxList from "@/components/InboxList";
import MailView from "@/components/MailView";
import ComposeModal from "@/components/ComposeModal";
import BottomNav from "@/components/BottomNav";

// Naya Hathiyar import kar liya
import { triggerHaptic } from "@/lib/utils";

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const [selectedMail, setSelectedMail] = useState(null);
  const [showCompose, setShowCompose] = useState(false);
  const [currentFolder, setCurrentFolder] = useState("inbox");

  const refreshMails = () => {
    queryClient.invalidateQueries({ queryKey: ["emails"] });
  };

  return (
    <div className="min-h-screen bg-softbg relative pb-safe">

      {/* Header */}
      <Header
        onCompose={() => {
          triggerHaptic("medium"); // Compose kholte hi solid tick
          setShowCompose(true);
        }}
      />

      {/* Mail list */}
      <InboxList
        folder={currentFolder}
        onOpenMail={(mail) => {
          triggerHaptic("light"); // Mail open karte hi soft tick
          setSelectedMail(mail);
        }}
      />

      {/* Open mail view */}
      <MailView
        mail={selectedMail}
        onClose={() => {
          triggerHaptic("light");
          setSelectedMail(null);
          refreshMails();
        }}
        onDelete={async (mail) => {
          triggerHaptic("heavy"); // Delete karte time heavy vibration
          const isPermanent = currentFolder === "trash";
          
          try {
            await fetch("/api/mail/delete", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id: mail.id, permanent: isPermanent }),
            });

            setSelectedMail(null);
            refreshMails(); 
          } catch (err) {
            console.error("Delete failed", err);
          }
        }}
      />

      {/* Compose modal */}
      <ComposeModal
        isOpen={showCompose}
        onClose={() => setShowCompose(false)}
        onSent={() => {
          triggerHaptic("success"); // Mail send hone par double tap!
          refreshMails();
        }} 
      />

      {/* Premium Bottom Navigation */}
      <BottomNav 
        activeFolder={currentFolder}
        onChangeFolder={(folder) => {
          if (folder !== currentFolder) {
            triggerHaptic("light"); // Tab change karte hi subtle feel
            setCurrentFolder(folder);
            setSelectedMail(null);
          }
        }}
      />
      
    </div>
  );
}
