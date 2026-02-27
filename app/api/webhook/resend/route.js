import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Email from "@/models/Email";

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("📩 FULL WEBHOOK:", JSON.stringify(body, null, 2));

    // resend sends inside data
    const data = body?.data;
    if (!data) {
      console.log("No email data");
      return NextResponse.json({ ok: true });
    }

    await connectToDatabase();

    await Email.create({
      messageId: data.id || Date.now().toString(),
      from: data.from || "unknown",
      to: data.to?.[0] || "unknown",
      subject: data.subject || "(no subject)",
      html: data.html || "",
      text: data.text || "",
      preview: data.subject || "",
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
