import { AppError } from "./appError";

export const sendOtpSms = async (_phone: string, _code: string): Promise<void> => {
  throw new AppError("إرسال OTP عبر SMS غير مدعوم حاليًا", 501, "SMS_NOT_SUPPORTED");
};
