import { env } from "../config/env";

export const sendOtpSms = async (phone: string, code: string) => {
  console.log(`[SMS] OTP to ${phone} from ${env.OTP_FROM_SMS}: ${code}`);
};
