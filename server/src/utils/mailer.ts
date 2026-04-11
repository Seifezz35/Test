import { Resend } from "resend";
import { env } from "../config/env";
import { AppError } from "./appError";

const resend = new Resend(env.RESEND_API_KEY);
const isDev = process.env.NODE_ENV !== "production";

export const sendOtpEmail = async (email: string, code: string): Promise<void> => {
  if (isDev) console.log("[mailer] sending OTP email — payload:", { from: env.OTP_FROM_EMAIL, to: email });

  let result;

  try {
    result = await resend.emails.send({
      from: env.OTP_FROM_EMAIL,
      to: email,
      subject: "رمز التحقق - CaptainProfit",
      html: `<h2>رمز التحقق الخاص بك: ${code}</h2>`
    });
  } catch (err) {
    if (isDev) console.error("[mailer] resend.emails.send() threw:", err);
    throw new AppError("فشل إرسال البريد الإلكتروني", 500, "EMAIL_SEND_FAILED");
  }

  if (isDev) console.log("[mailer] resend raw result:", JSON.stringify(result, null, 2));

  if (result.error) {
    if (isDev) console.error("[mailer] resend API error:", JSON.stringify(result.error, null, 2));
    throw new AppError("فشل إرسال البريد الإلكتروني", 500, "EMAIL_SEND_FAILED");
  }
};
