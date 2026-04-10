import { env } from "../config/env";

export const sendOtpEmail = async (email: string, code: string) => {
  console.log(`[MAILER] OTP to ${email} from ${env.OTP_FROM_EMAIL}: ${code}`);
};
