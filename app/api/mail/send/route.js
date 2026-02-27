import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Email from "@/models/Email";
import { sendEmail } from "@/lib/resend";
import { isAuthenticated } from "@/lib/auth";
import { generateId, stripHtml, generatePreview } from "@/lib/utils";

export async function POST(req) {
  try {
    // 🔐 auth check
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

    // 📤 send via Resend
    const result = await sendEmail({
      from,
      to,
      subject: subject || "(No Subject)",
      html,
      text,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }

    // 💾 save to DB (Sent folder)
    await connectToDatabase();

    const plainText = text || stripHtml(html || "");

    await Email.create({
      messageId: generateId(),
      from: from || process.env.EMAIL_FROM,
      to,
      subject: subject || "(No Subject)",
      html: html || "",
      text: plainText,
      preview: generatePreview(plainText),
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