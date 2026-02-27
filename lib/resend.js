import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// 📤 Send Normal Email (Compose / Reply)
export async function sendEmail({ from, to, subject, html, text }) {
  try {
    const response = await resend.emails.send({
      from: from || process.env.EMAIL_FROM,
      to,
      subject,
      html,
      text,
    });

    return { success: true, data: response };
  } catch (error) {
    console.error("❌ Email Send Error:", error);
    return { success: false, error };
  }
}

// 🔐 Send OTP Email
export async function sendOtpEmail(email, otp) {
  try {
    const response = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Your Login OTP",
      html: `
        <div style="font-family: Arial; padding: 20px;">
          <h2>Your OTP Code</h2>
          <p style="font-size: 24px; font-weight: bold;">
            ${otp}
          </p>
          <p>This code will expire in 5 minutes.</p>
        </div>
      `,
    });

    return { success: true, data: response };
  } catch (error) {
    console.error("❌ OTP Send Error:", error);
    return { success: false, error };
  }
}

// 📩 Optional: simple webhook signature check helper (future use)
export function getWebhookSecret() {
  return process.env.RESEND_WEBHOOK_SECRET;
}

export default resend;