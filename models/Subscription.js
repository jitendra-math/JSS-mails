import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema({
  // User ki pehchaan (Agar login system hai toh User ID yahan aayegi)
  userId: { 
    type: String, 
    required: true,
    default: "jss_admin_user" 
  },
  
  // Ye sabse main token/address hai jo browser generate karke dega
  // Isike andar public key aur endpoint url chhupe hote hain
  subscription: { 
    type: Object, 
    required: true 
  },
  
  // Ye bas details ke liye hai ki user ne iPhone se allow kiya ya Laptop se
  userAgent: { 
    type: String,
    default: "Unknown Device"
  }
}, { timestamps: true });

// Agar model pehle se bana hai toh wahi use karo, varna naya bana do
export default mongoose.models.Subscription || mongoose.model("Subscription", SubscriptionSchema);
