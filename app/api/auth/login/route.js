import { NextResponse } from "next/server";
import { verifyMasterCode, setAuthCookie } from "@/lib/auth";

export async function POST(req) {
  try {
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json(
        { error: "Code is required" },
        { status: 400 }
      );
    }

    const isValid = verifyMasterCode(code);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid secret code" },
        { status: 401 }
      );
    }

    // set login cookie
    setAuthCookie();

    return NextResponse.json({
      success: true,
      message: "Login successful",
    });

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}