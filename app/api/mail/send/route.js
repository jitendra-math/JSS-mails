import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Email from "@/models/Email";
import { sendEmail } from "@/lib/resend";
import { isAuthenticated } from "@/lib/auth";
import { generateId, stripHtml, generatePreview } from "@/lib/utils";

export async function POST(req) {
  try {
    // 🔐 Auth check
    if (!isAuthenticated()) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { to, subject, html, text, from } = await req.json();

    if (!to) {
      return NextResponse.json(
        { error: "Recipient email is required" },
        { status: 400 }
      );
    }

    // 🛡️ Security Check: Sender domain validation
    if (from && !from.includes("@jssoriginals.online")) {
      return NextResponse.json(
        { error: "Invalid sender domain. Only @jssoriginals.online is allowed." },
        { status: 403 }
      );
    }

    // 📤 Send via Resend
    const result = await sendEmail({
      from: from || process.env.EMAIL_FROM,
      to,
      subject: subject || "(No Subject)",
      html,
      text: stripHtml(html || text || ""), // Recipient ke liye clean text version
    });

    if (!result.success) {
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }

    // 💾 Save to DB (Sent folder)
    await connectToDatabase();

    // Fix: Prioritize stripping HTML to get real plain text for the preview
    const cleanContent = html ? stripHtml(html) : (text || "");
    const finalPreview = generatePreview(cleanContent);

    await Email.create({
      messageId: generateId(),
      from: from || process.env.EMAIL_FROM,
      to,
      subject: subject || "(No Subject)",
      html: html || "", // Full HTML for MailView
      text: cleanContent, // Clean text for fallbacks
      preview: finalPreview, // Clean preview for the list
      folder: "sent",
      read: true,
      receivedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
    });

  } catch (error) {
    console.error("Send Mail Error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
