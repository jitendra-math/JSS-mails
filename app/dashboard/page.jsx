"use client";

import { useState } from "react";
import Header from "@/components/Header";
import InboxList from "@/components/InboxList";
import MailView from "@/components/MailView";
import ComposeModal from "@/components/ComposeModal";

export default function DashboardPage() {
  const [selectedMail, setSelectedMail] = useState(null);
  const [showCompose, setShowCompose] = useState(false);
  const [refreshKey, setRefreshKey] = useState(Date.now());

  // refresh inbox
  const refreshInbox = () => {
    setRefreshKey(Date.now());
  };

  return (
    <div className="min-h-screen bg-softbg">

      {/* Header */}
      <Header
        title="Inbox"
        onCompose={() => setShowCompose(true)}
      />

      {/* Inbox list */}
      <InboxList
        refreshKey={refreshKey}
        onOpenMail={(mail) => setSelectedMail(mail)}
      />

      {/* Open mail view */}
      <MailView
        mail={selectedMail}
        onClose={() => {
          setSelectedMail(null);
          refreshInbox();
        }}
        onDelete={async (mail) => {
          await fetch("/api/mail/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: mail.id }),
          });

          setSelectedMail(null);
          refreshInbox();
        }}
      />

      {/* Compose modal */}
      <ComposeModal
        isOpen={showCompose}
        onClose={() => setShowCompose(false)}
        onSent={refreshInbox}
      />
    </div>
  );
}