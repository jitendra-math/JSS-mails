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

    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Email ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const email = await Email.findByIdAndUpdate(
      id,
      { read: true },
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
      message: "Email marked as read",
    });

  } catch (error) {
    console.error("Mark Read Error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}