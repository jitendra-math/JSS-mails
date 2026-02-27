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

    attachments: [
      {
        filename: String,
        url: String,
        size: Number,
        type: String,
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
export default mongoose.models.Email ||
  mongoose.model("Email", EmailSchema);