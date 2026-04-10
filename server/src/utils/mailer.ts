import { Resend } from "resend";
import { env } from "../config/env";

const resend = new Resend(env.RESEND_API_KEY);

export const sendOtpEmail = async (email: string, code: string): Promise<void> => {
  const { data, error } = await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "رمز التحقق - CaptainProfit",
    html: `
      <div dir="rtl" style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #f97316; margin-bottom: 8px;">CaptainProfit</h2>
        <p style="font-size: 16px;">رمز التحقق الخاص بك:</p>
        <div style="font-size: 40px; font-weight: bold; letter-spacing: 10px; text-align: center;
                    padding: 20px; background: #f3f4f6; border-radius: 8px; margin: 20px 0;">
          ${code}
        </div>
        <p style="color: #6b7280; font-size: 14px;">
          الرمز صالح لمدة ${env.OTP_TTL_MINUTES} دقائق.<br/>
          لا تشارك هذا الرمز مع أي شخص آخر.
        </p>
      </div>
    `
  });

  if (error) {
    console.error("[MAILER] Failed to send OTP email:", error);
    throw new Error(`Email delivery failed: ${error.message}`);
  }

  console.log(`[MAILER] OTP email sent to ${email} — id: ${data?.id}`);
};
