import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    name: {
      type: String,
      default: "Owner",
    },

    role: {
      type: String,
      default: "admin", // future: admin | client
    },

    avatar: {
      type: String,
      default: "",
    },

    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// prevent model overwrite in dev
export default mongoose.models.User ||
  mongoose.model("User", UserSchema);