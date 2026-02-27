import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Email from "@/models/Email";
import { normalizeEmailPayload } from "@/lib/utils";

// Resend inbound webhook
export async function POST(req) {
  try {
    const body = await req.json();

    console.log("📩 Resend webhook received");

    // email payload normalize
    const email = normalizeEmailPayload(body);

    if (!email.from || !email.to) {
      return NextResponse.json(
        { error: "Invalid email payload" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // duplicate check (important)
    const exists = await Email.findOne({ messageId: email.messageId });
    if (exists) {
      return NextResponse.json({ success: true });
    }

    // save incoming mail
    await Email.create({
      messageId: email.messageId,
      from: email.from,
      to: email.to,
      subject: email.subject,
      html: email.html,
      text: email.text,
      preview: email.preview,
      folder: "inbox",
      read: false,
      receivedAt: new Date(),
    });

    console.log("✅ Email saved to inbox");

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("❌ Webhook Error:", error);

    return NextResponse.json(
      { error: "Webhook failed" },
      { status: 500 }
    );
  }
}