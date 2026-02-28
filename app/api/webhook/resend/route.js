import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Email from "@/models/Email";
import { Resend } from "resend"; // 👈 Resend import kiya

// Resend initialize kiya
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

    // 🚀 THE MAGIC FIX: Webhook ke paas body nahi hoti, isliye hum email_id 
    // ka use karke Resend se poora email fetch kar rahe hain.
    const { data: fullEmail, error } = await resend.emails.get(data.email_id);

    if (error || !fullEmail) {
      console.error("❌ Failed to fetch full email body from Resend:", error);
      return NextResponse.json({ error: "fail" }, { status: 500 });
    }

    await connectToDatabase();

    await Email.create({
      messageId: fullEmail.id || data.id || Date.now().toString(),
      from: fullEmail.from || data.from || "unknown",
      // Array ho sakta hai, isliye pehla element le rahe hain
      to: (fullEmail.to && fullEmail.to[0]) ? fullEmail.to[0] : (data.to?.[0] || "unknown"),
      subject: fullEmail.subject || data.subject || "(no subject)",
      // Ab yahan ekdum original HTML aur Text aayega
      html: fullEmail.html || "",  
      text: fullEmail.text || "",  
      preview: fullEmail.text ? fullEmail.text.substring(0, 100) : (fullEmail.subject || ""),
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
