// 📅 Format date like iPhone Mail style (Strictly Indian Standard Time - IST)
export function formatDate(date) {
  if (!date) return "";

  const d = new Date(date);
  const now = new Date();

  // Force time comparisons to IST so midnight rollovers are accurate in India
  const optionsDateOnly = { timeZone: 'Asia/Kolkata', year: 'numeric', month: 'numeric', day: 'numeric' };
  const dString = d.toLocaleDateString('en-IN', optionsDateOnly);
  const nowString = now.toLocaleDateString('en-IN', optionsDateOnly);

  // Calculate "Yesterday"
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayString = yesterday.toLocaleDateString('en-IN', optionsDateOnly);

  if (dString === nowString) {
    // Today: Show exact time in IST (e.g., 10:30 AM)
    return d.toLocaleTimeString('en-US', {
      timeZone: 'Asia/Kolkata',
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    }).toUpperCase();
  }

  if (dString === yesterdayString) {
    return "Yesterday"; // Pure Apple Mail vibe
  }

  // Older: Show Date and Month (e.g., 28 Feb)
  return d.toLocaleDateString('en-US', {
    timeZone: 'Asia/Kolkata',
    month: "short",
    day: "numeric",
  });
}

// 📳 Premium Haptic Feedback (Apple style micro-vibrations)
export function triggerHaptic(type = "light") {
  // Check if window exists (for Next.js SSR) and if device supports vibration
  if (typeof window === "undefined" || !navigator.vibrate) return;

  switch (type) {
    case "light":
      navigator.vibrate(40); // Single gentle tap (for clicks)
      break;
    case "medium":
      navigator.vibrate(80); // Standard tap
      break;
    case "heavy":
      navigator.vibrate(120); // Deleting/Error tap
      break;
    case "success":
      navigator.vibrate([40, 80, 40]); // Double tap (Send/Done)
      break;
    default:
      navigator.vibrate(40);
  }
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
