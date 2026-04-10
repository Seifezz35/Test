export const sendOtpSms = async (_phone: string, _code: string): Promise<void> => {
  throw new Error("SMS delivery is not configured. Use email-based OTP.");
};
