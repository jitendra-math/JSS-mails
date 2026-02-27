import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Email from "@/models/Email";
import { normalizeEmailPayload } from "@/lib/utils";

export async function POST(req) {
  try {
    const body = await req.json();

    console.log("📩 Webhook raw:", body);

    // 🔥 actual email payload inside body.data
    const payload = body?.data;

    if (!payload) {
      console.log("No payload");
      return NextResponse.json({ ok: true });
    }

    const email = normalizeEmailPayload({
      id: payload.id,
      from: payload.from,
      to: payload.to?.[0],
      subject: payload.subject,
      html: payload.html,
      text: payload.text
    });

    await connectToDatabase();

    // duplicate check
    const exists = await Email.findOne({ messageId: email.messageId });
    if (exists) {
      return NextResponse.json({ success: true });
    }

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

    console.log("✅ Email saved");

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "fail" }, { status: 500 });
  }
}
