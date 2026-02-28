import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Email from "@/models/Email";

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("📩 FULL WEBHOOK:", JSON.stringify(body, null, 2));

    const data = body?.data;
    if (!data) {
      console.log("No email data found");
      return NextResponse.json({ ok: true });
    }

    await connectToDatabase();

    // 🚀 THE REAL FIX:
    // 1. Resend API fetch logic hata diya (jo crash kar raha tha).
    // 2. Fallback logic: Instagram jaise mails jinki body nahi hoti, 
    //    unme hum 'subject' ko hi body (text) maan lenge.
    const emailHtml = data.html || "";
    const emailText = data.text || data.subject || "No content provided in this email.";

    await Email.create({
      messageId: data.message_id || data.id || Date.now().toString(),
      from: data.from || "unknown",
      // array check
      to: Array.isArray(data.to) ? data.to[0] : (data.to || "unknown"),
      subject: data.subject || "(no subject)",
      html: emailHtml,
      text: emailText,
      preview: emailText.substring(0, 100),
      folder: "inbox",
      read: false,
      receivedAt: new Date(),
    });

    console.log("✅ EMAIL SAVED SUCCESS");

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("❌ WEBHOOK ERROR:", err);
    return NextResponse.json({ error: "fail" }, { status: 500 });
  }
}
