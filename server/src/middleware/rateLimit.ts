import rateLimit from "express-rate-limit";

// General auth routes: 5 req / 60s
export const authRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "RATE_LIMITED",
      message: "محاولات كثيرة جدًا، حاول مرة أخرى بعد دقيقة"
    }
  }
});

// OTP consumption routes: 3 req / 15min (verify-otp, reset-password)
export const otpRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "OTP_RATE_LIMITED",
      message: "تجاوزت الحد المسموح به لمحاولات التحقق، حاول مرة أخرى بعد 15 دقيقة"
    }
  }
});
