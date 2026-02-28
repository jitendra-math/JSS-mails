import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Email from "@/models/Email";

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("📩 FULL WEBHOOK METADATA:", JSON.stringify(body, null, 2));

    const eventData = body?.data;
    if (body.type !== "email.received" || !eventData || !eventData.email_id) {
      return NextResponse.json({ ok: true });
    }

    let finalHtml = eventData.html || "";
    let finalText = eventData.text || eventData.subject || "No content";

    // SDK ka koi natak nahi. Direct Resend REST API fetch.
    try {
      const apiRes = await fetch(`https://api.resend.com/emails/${eventData.email_id}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json"
        }
      });

      if (apiRes.ok) {
        const fullEmail = await apiRes.json();
        if (fullEmail.html) finalHtml = fullEmail.html;
        if (fullEmail.text) finalText = fullEmail.text;
        console.log("✅ Fetched full body from API");
      } else {
        console.log("⚠️ API fetch failed, using fallback metadata.");
      }
    } catch (fetchErr) {
      console.log("⚠️ Fetch throw error, using fallback metadata:", fetchErr);
    }

    // 🚀 Yeh DB save ab HAR HAAL mein chalega, koi 500 block nahi karega.
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

    console.log("✅ EMAIL SAVED SUCCESS!");
    // Hamesha 200/Success return karo taaki webhook loop mein na fase
    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("❌ WEBHOOK CRITICAL ERROR:", err);
    // Yahan bhi 500 nahi dena, safe exit karna hai
    return NextResponse.json({ ok: true });
  }
}
