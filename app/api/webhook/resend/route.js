import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Email from "@/models/Email";

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("📩 Webhook received");

    const eventData = body?.data;
    if (body.type !== "email.received" || !eventData?.email_id) {
      return NextResponse.json({ ok: true });
    }

    const emailId = eventData.email_id;

    // ✅ Fetch full content from Resend (receiving endpoint)
    let html = "";
    let text = "";

    try {
      const apiRes = await fetch(`https://api.resend.com/emails/receiving/${emailId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
      });

      if (apiRes.ok) {
        const fullEmail = await apiRes.json();
        html = fullEmail.html || "";
        text = fullEmail.text || "";
        console.log(`✅ HTML fetched, length: ${html.length}`);
      } else {
        console.error(`❌ Resend API error: ${apiRes.status}`);
        // fallback – metadata me html nahi hota, toh text hi bhejo
        text = eventData.subject || "No content";
      }
    } catch (fetchErr) {
      console.error("❌ Fetch failed:", fetchErr);
      text = eventData.subject || "No content";
    }

    // ✅ MongoDB me save
    await connectToDatabase();

    const emailDoc = {
      messageId: eventData.message_id || emailId,
      from: eventData.from || "unknown",
      to: Array.isArray(eventData.to) ? eventData.to[0] : (eventData.to || "unknown"),
      subject: eventData.subject || "(no subject)",
      html: html,
      text: text,
      preview: (text || html).substring(0, 100),
      folder: "inbox",
      read: false,
      receivedAt: new Date(eventData.created_at || Date.now()),
    };

    await Email.create(emailDoc);
    console.log("✅ Email saved with HTML");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Unhandled error:", err);
    return NextResponse.json({ ok: true });
  }
}
