import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db"; // Tera existing DB connection function
import Subscription from "@/models/Subscription";

export async function POST(req) {
  try {
    // 1. Database se connect karo
    await connectToDatabase();

    const { subscription, userId, userAgent } = await req.json();

    // 2. Check karo ki browser ne token (subscription) bheja ya nahi
    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ error: "Invalid subscription token" }, { status: 400 });
    }

    // 3. Purani entry check karo (Taaki duplicate na bane)
    // 'endpoint' har phone/browser ka ek unique address hota hai
    const existingSub = await Subscription.findOne({ 
      "subscription.endpoint": subscription.endpoint 
    });

    if (!existingSub) {
      // 4. Agar naya device hai toh DB mein save kar do
      await Subscription.create({
        userId: userId || "jss_admin_user", // Default admin user
        subscription: subscription,
        userAgent: userAgent || "Unknown Device"
      });
      console.log("✅ Naya device notification ke liye jud gaya!");
    } else {
      console.log("⚡ Ye device pehle se DB mein juda hua hai.");
    }

    return NextResponse.json({ success: true, message: "Subscribed successfully" });
    
  } catch (error) {
    console.error("❌ Subscription API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
