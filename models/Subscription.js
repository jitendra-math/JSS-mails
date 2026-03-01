import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema({
  // Taki humein pata rahe ki ye kis user ka phone/browser hai
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  // Browser ka banaya hua token object
  subscription: { 
    type: Object, 
    required: true 
  },
  // Konsa device hai (Chrome, Safari, iOS, etc.)
  userAgent: { 
    type: String,
    default: "Unknown Device"
  }
}, { timestamps: true });

export default mongoose.models.Subscription || mongoose.model("Subscription", SubscriptionSchema);
