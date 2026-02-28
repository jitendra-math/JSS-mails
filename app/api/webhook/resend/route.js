import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Email from "@/models/Email";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("📩 FULL WEBHOOK:", JSON.stringify(body, null, 2));

    const data = body?.data;
    if (!data || !data.email_id) {
      console.log("No email data or email_id found");
      return NextResponse.json({ ok: true });
    }

    // 🚀 THE REAL FIX: 
    // Webhook sirf metadata laya hai. 
    // Sahi 'receiving' API call karke asli HTML body nikal rahe hain.
    let fullHtml = "";
    let fullText = data.subject || "No content";

    const { data: fullEmail, error } = await resend.emails.receiving.get(data.email_id);

    if (error || !fullEmail) {
      console.error("❌ Failed to fetch inbound email body from Resend:", error);
    } else {
      fullHtml = fullEmail.html || "";
      fullText = fullEmail.text || data.subject;
    }

    await connectToDatabase();

    await Email.create({
      messageId: data.message_id || data.id || Date.now().toString(),
      from: data.from || "unknown",
      to: Array.isArray(data.to) ? data.to[0] : (data.to || "unknown"),
      subject: data.subject || "(no subject)",
      html: fullHtml,
      text: fullText,
      preview: fullText.substring(0, 100),
      folder: "inbox",
      read: false,
      receivedAt: new Date(),
    });

    console.log("✅ EMAIL SAVED SUCCESS WITH FULL HTML BODY");

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("❌ WEBHOOK ERROR:", err);
    return NextResponse.json({ error: "fail" }, { status: 500 });
  }
}
