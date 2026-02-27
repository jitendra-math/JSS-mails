import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Email from "@/models/Email";
import { isAuthenticated } from "@/lib/auth";

export async function POST(req) {
  try {
    // 🔐 auth check
    if (!isAuthenticated()) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id, permanent } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Email ID required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // 🗑️ permanent delete (trash se delete)
    if (permanent) {
      await Email.findByIdAndDelete(id);

      return NextResponse.json({
        success: true,
        message: "Email permanently deleted",
      });
    }

    // 📦 move to trash
    const email = await Email.findByIdAndUpdate(
      id,
      { folder: "trash" },
      { new: true }
    );

    if (!email) {
      return NextResponse.json(
        { error: "Email not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Moved to trash",
    });

  } catch (error) {
    console.error("Delete Mail Error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}