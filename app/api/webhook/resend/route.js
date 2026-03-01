import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Email from "@/models/Email";
import Subscription from "@/models/Subscription"; // Naya import Notifications ke liye
import { put } from "@vercel/blob";
import webpush from "web-push"; // Naya import Notifications engine ke liye

// 🔐 Web-Push Engine Setup (Apne aap .env se keys uthayega)
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("📩 Webhook received");

    const eventData = body?.data;
    if (body.type !== "email.received" || !eventData?.email_id) {
      return NextResponse.json({ ok: true });
    }

    const emailId = eventData.email_id;

    // Fetch full content from Resend (receiving endpoint)
    let html = "";
    let text = "";
    let uploadedAttachments = []; // Blob URLs save karne ke liye array

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

        // --- PREMIUM ATTACHMENT UPLOAD LOGIC ---
        if (fullEmail.attachments && Array.isArray(fullEmail.attachments) && fullEmail.attachments.length > 0) {
          console.log(`📎 Found ${fullEmail.attachments.length} attachments. Uploading to Vercel Blob...`);
          
          for (const att of fullEmail.attachments) {
            try {
              // Resend attachments ko Base64 text mein bhejta hai, hum isko wapas binary/buffer banayenge
              const fileBuffer = Buffer.from(att.content, "base64");
              
              // Unique naam banayenge taaki overwrite na ho
              const uniqueFilename = `attachments/${Date.now()}-${att.filename}`;

              // Vercel Blob par upload
              const blob = await put(uniqueFilename, fileBuffer, {
                access: "public",
                contentType: att.content_type || "application/octet-stream",
              });

              // Array mein save kar lo DB ke liye
              uploadedAttachments.push({
                filename: att.filename,
                url: blob.url,
                size: fileBuffer.length, // Exact file size in bytes
                contentType: att.content_type || "application/octet-stream",
              });

              console.log(`✅ Uploaded: ${att.filename} -> ${blob.url}`);
            } catch (uploadErr) {
              console.error(`❌ Failed to upload attachment ${att.filename}:`, uploadErr);
              // Agar ek attachment fail ho jaye toh email fail na ho, isliye continue
            }
          }
        }
        // ---------------------------------------

      } else {
        console.error(`❌ Resend API error: ${apiRes.status}`);
        text = eventData.subject || "No content";
      }
    } catch (fetchErr) {
      console.error("❌ Fetch failed:", fetchErr);
      text = eventData.subject || "No content";
    }

    // MongoDB me save
    await connectToDatabase();

    const emailDoc = {
      messageId: eventData.message_id || emailId,
      from: eventData.from || "unknown",
      to: Array.isArray(eventData.to) ? eventData.to[0] : (eventData.to || "unknown"),
      subject: eventData.subject || "(no subject)",
      html: html,
      text: text,
      preview: (text || html).substring(0, 100),
      attachments: uploadedAttachments, // Naya updated attachments array yahan save hoga
      folder: "inbox",
      read: false,
      receivedAt: new Date(eventData.created_at || Date.now()),
    };

    await Email.create(emailDoc);
    console.log("✅ Email saved with HTML and Attachments");

    // ==========================================
    // 🔥 THE MAGIC: SENDING PUSH NOTIFICATION
    // ==========================================
    try {
      console.log("🔔 Triggering push notifications...");
      // MongoDB se saare allow kiye hue devices (tokens) uthao
      const subscriptions = await Subscription.find({});

      // Notification ka Premium Look tayyar karo
      const notificationPayload = JSON.stringify({
        title: emailDoc.from,
        body: emailDoc.subject || "You have a new email",
        url: "/dashboard" // Click karne par yahan layega
      });

      // Har device par notification bhej do
      const pushPromises = subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(sub.subscription, notificationPayload);
        } catch (pushErr) {
          // Agar kisi ne browser se notification block kar di baad mein, toh usko DB se hata do
          if (pushErr.statusCode === 410 || pushErr.statusCode === 404) {
            await Subscription.findByIdAndDelete(sub._id);
            console.log("🗑️ Removed invalid subscription");
          } else {
            console.error("Error sending to a device:", pushErr);
          }
        }
      });

      // Wait for all notifications to be sent
      await Promise.all(pushPromises);
      console.log("✅ Push notifications sent successfully!");

    } catch (notifyErr) {
      console.error("❌ Notification Engine Error:", notifyErr);
      // Agar notification fail bhi ho jaye, toh email webhook crash na ho
    }
    // ==========================================

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Unhandled error:", err);
    return NextResponse.json({ ok: true });
  }
}
