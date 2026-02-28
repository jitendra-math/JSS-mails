import mongoose from "mongoose";

const EmailSchema = new mongoose.Schema(
  {
    messageId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    from: {
      type: String,
      required: true,
      index: true,
    },

    to: {
      type: String,
      required: true,
      index: true,
    },

    subject: {
      type: String,
      default: "(No Subject)",
    },

    text: {
      type: String,
      default: "",
    },

    html: {
      type: String,
      default: "",
    },

    preview: {
      type: String,
      default: "",
    },

    // 👇 Yeh raha tumhara naya, strict Premium Attachments Schema
    // Is strict definition se "Cast to [string] failed" wala error hamesha ke liye khatam ho jayega
    attachments: [
      {
        filename: { type: String, required: true },
        url: { type: String, required: true },
        size: { type: Number, default: 0 },
        contentType: { type: String, default: "application/octet-stream" },
      },
    ],

    read: {
      type: Boolean,
      default: false,
      index: true,
    },

    starred: {
      type: Boolean,
      default: false,
    },

    folder: {
      type: String,
      default: "inbox", // inbox | sent | trash
      index: true,
    },

    receivedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// prevent model overwrite (nextjs dev issue)
export default mongoose.models.Email || mongoose.model("Email", EmailSchema);
