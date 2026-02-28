import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Email from "@/models/Email";
import { isAuthenticated } from "@/lib/auth";
import { formatDate } from "@/lib/utils";

export async function GET(req) {
  try {
    // 🔐 auth check
    if (!isAuthenticated()) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // optional query params
    const { searchParams } = new URL(req.url);
    const folder = searchParams.get("folder") || "inbox";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 20;
    const skip = (page - 1) * limit;

    const emails = await Email.find({ folder })
      .sort({ receivedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(); // lean() se pure document milte hain, including html

    const total = await Email.countDocuments({ folder });

    // format response for UI
    const formatted = emails.map((mail) => ({
      id: mail._id,
      from: mail.from,
      to: mail.to,
      subject: mail.subject,
      preview: mail.preview,
      html: mail.html,           // ✅ HTML ab frontend ko milega
      text: mail.text,           // (optional) plain text bhi bhej rahe
      read: mail.read,
      starred: mail.starred,
      folder: mail.folder,
      time: formatDate(mail.receivedAt),
    }));

    return NextResponse.json({
      success: true,
      page,
      total,
      emails: formatted,
    });

  } catch (error) {
    console.error("Inbox Fetch Error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
