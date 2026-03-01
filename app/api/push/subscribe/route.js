import { NextResponse } from "next/server";
import Subscription from "@/models/Subscription";
import mongoose from "mongoose";

export async function POST(req) {
  try {
    // Agar DB connect nahi hai toh yahan connection logic daal dena 
    // jaise: await dbConnect(); (agar tera alag se file hai)
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }

    const { subscription, userId, userAgent } = await req.json();

    if (!subscription || !userId) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    // Purani subscription check karo
    const existingSub = await Subscription.findOne({ 
      "subscription.endpoint": subscription.endpoint 
    });

    if (!existingSub) {
      // Nayi subscription save karo
      await Subscription.create({
        userId,
        subscription,
        userAgent: userAgent || "Unknown Device"
      });
    }

    return NextResponse.json({ success: true, message: "Subscribed successfully" });
  } catch (error) {
    console.error("Subscription Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
