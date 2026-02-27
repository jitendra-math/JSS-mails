import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  try {
    const loggedIn = isAuthenticated();

    if (!loggedIn) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        name: "Jitu",
        role: "admin",
      },
    });

  } catch (error) {
    console.error("Auth check error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}