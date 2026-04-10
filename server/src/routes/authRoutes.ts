import { Router } from "express";
import {
  authSchemas,
  forgot,
  login,
  logout,
  me,
  refresh,
  register,
  removeAccount,
  reset,
  verifyOtp
} from "../controllers/authController";
import { requireAuth } from "../middleware/auth";
import { authRateLimit } from "../middleware/rateLimit";
import { validate } from "../middleware/validate";

export const authRouter = Router();

authRouter.post("/register", authRateLimit, validate({ body: authSchemas.register }), register);
authRouter.post("/verify-otp", authRateLimit, validate({ body: authSchemas.verifyOtp }), verifyOtp);
authRouter.post("/login", authRateLimit, validate({ body: authSchemas.login }), login);
authRouter.post("/refresh", validate({ body: authSchemas.refresh }), refresh);
authRouter.post("/logout", logout);
authRouter.post(
  "/forgot-password",
  authRateLimit,
  validate({ body: authSchemas.forgotPassword }),
  forgot
);
authRouter.post(
  "/reset-password",
  authRateLimit,
  validate({ body: authSchemas.resetPassword }),
  reset
);
authRouter.get("/me", requireAuth, me);
authRouter.delete(
  "/account",
  requireAuth,
  validate({ body: authSchemas.deleteAccount }),
  removeAccount
);
