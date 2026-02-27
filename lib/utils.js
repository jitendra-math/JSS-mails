// lib/utils.js

// 📅 Format date like iPhone Mail style
export function formatDate(date) {
  if (!date) return "";

  const d = new Date(date);
  const now = new Date();

  const isToday =
    d.toDateString() === now.toDateString();

  if (isToday) {
    return d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return d.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
}

// 🧹 Strip HTML to plain text preview
export function stripHtml(html) {
  if (!html) return "";
  return html.replace(/<[^>]*>?/gm, "");
}

// ✂️ Generate preview text (first 120 chars)
export function generatePreview(text, length = 120) {
  if (!text) return "";
  return text.length > length
    ? text.substring(0, length) + "..."
    : text;
}

// 📛 Extract sender name from email
export function extractNameFromEmail(email) {
  if (!email) return "";
  const namePart = email.split("@")[0];
  return namePart
    .replace(/[._-]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// 🔐 Simple random ID generator (fallback)
export function generateId() {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).substring(2)
  );
}

// 📩 Normalize incoming email object (Resend webhook safe format)
export function normalizeEmailPayload(payload) {
  return {
    messageId: payload?.id || generateId(),
    from: payload?.from || "",
    to: payload?.to || "",
    subject: payload?.subject || "(No Subject)",
    html: payload?.html || "",
    text: payload?.text || stripHtml(payload?.html || ""),
    preview: generatePreview(
      payload?.text || stripHtml(payload?.html || "")
    ),
    receivedAt: new Date(),
  };
}