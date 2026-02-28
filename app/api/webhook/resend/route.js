import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Email from "@/models/Email";
import { Resend } from "resend";
import { simpleParser } from "mailparser"; // For the raw fallback

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("📩 FULL WEBHOOK METADATA:", JSON.stringify(body, null, 2));

    const eventData = body?.data;
    if (body.type !== "email.received" || !eventData || !eventData.email_id) {
      return NextResponse.json({ ok: true });
    }

    // 1. Fetch full email from Resend using the CORRECT receiving method
    const { data: email, error } = await resend.emails.receiving.get(eventData.email_id);

    if (error || !email) {
      console.error("❌ Failed to fetch email from Resend Receiving API:", error);
      return NextResponse.json({ error: "fail" }, { status: 500 });
    }

    let finalHtml = email.html || "";
    let finalText = email.text || eventData.subject || "No content";

    // 2. The Ultimate Fallback (DeepSeek's raw MIME trick)
    if (!finalHtml && email.raw?.download_url) {
      try {
        console.log("⚠️ HTML is empty, downloading raw MIME from Resend...");
        const rawResponse = await fetch(email.raw.download_url);
        const rawContent = await rawResponse.text();
        const parsed = await simpleParser(rawContent);
        
        finalHtml = parsed.html || "";
        finalText = parsed.text || finalText;
        console.log("✅ Successfully parsed raw MIME data");
      } catch (rawErr) {
        console.error("❌ Failed to parse raw email:", rawErr);
      }
    }

    // 3. Save to MongoDB
    await connectToDatabase();

    await Email.create({
      messageId: eventData.message_id || eventData.id || Date.now().toString(),
      from: eventData.from || "unknown",
      to: Array.isArray(eventData.to) ? eventData.to[0] : (eventData.to || "unknown"),
      subject: eventData.subject || "(no subject)",
      html: finalHtml,
      text: finalText,
      preview: finalText.substring(0, 100),
      folder: "inbox",
      read: false,
      receivedAt: new Date(eventData.created_at || Date.now()),
    });

    console.log("✅ EMAIL SAVED SUCCESS WITH FULL BODY");
    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("❌ WEBHOOK ERROR:", err);
    return NextResponse.json({ error: "fail" }, { status: 500 });
  }
}
