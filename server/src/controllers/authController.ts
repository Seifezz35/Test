import { Request, Response } from "express";
import { z } from "zod";
import {
  deleteUserAccount,
  forgotPassword,
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshUserSession,
  registerUser,
  resetPassword,
  verifyRegistrationOtp
} from "../services/authService";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";

const passwordSchema = z
  .string()
  .min(8, "كلمة المرور يجب ألا تقل عن 8 أحرف")
  .regex(/[0-9]/, "كلمة المرور يجب أن تحتوي على رقم")
  .regex(/[^A-Za-z0-9]/, "كلمة المرور يجب أن تحتوي على رمز خاص");

export const authSchemas = {
  register: z.object({
    email: z.string().email("البريد الإلكتروني غير صحيح"),
    phone: z.string().min(8, "رقم الهاتف غير صحيح").optional(),
    name: z.string().min(2, "الاسم مطلوب"),
    password: passwordSchema
  }),
  verifyOtp: z.object({
    identifier: z.string().min(4, "أدخل البريد أو الهاتف"),
    code: z.string().length(6, "رمز التحقق يجب أن يكون 6 أرقام")
  }),
  login: z.object({
    identifier: z.string().min(4, "أدخل البريد أو الهاتف"),
    password: z.string().min(1, "كلمة المرور مطلوبة"),
    rememberMe: z.boolean().optional()
  }),
  refresh: z.object({
    refreshToken: z.string().optional()
  }),
  forgotPassword: z.object({
    identifier: z.string().min(4, "أدخل البريد أو الهاتف")
  }),
  resetPassword: z.object({
    identifier: z.string().min(4, "أدخل البريد أو الهاتف"),
    code: z.string().length(6, "رمز التحقق يجب أن يكون 6 أرقام"),
    password: passwordSchema
  }),
  deleteAccount: z.object({
    confirm: z.literal("DELETE")
  })
};

const setRefreshCookie = (res: Response, refreshToken: string, refreshExpiresAt: string) => {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(refreshExpiresAt)
  });
};

const clearRefreshCookie = (res: Response) => {
  res.clearCookie("refreshToken");
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await registerUser(req.body);
  sendSuccess(res, result, 201);
});

export const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
  const { identifier, code } = req.body;
  const result = await verifyRegistrationOtp(identifier, code);
  setRefreshCookie(res, result.refreshToken, result.refreshExpiresAt);
  sendSuccess(res, result);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await loginUser(req.body);
  setRefreshCookie(res, result.refreshToken, result.refreshExpiresAt);
  sendSuccess(res, result);
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.body?.refreshToken || req.cookies.refreshToken;
  const result = await refreshUserSession(refreshToken);
  setRefreshCookie(res, result.refreshToken, result.refreshExpiresAt);
  sendSuccess(res, result);
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.body?.refreshToken || req.cookies.refreshToken;
  await logoutUser(refreshToken);
  clearRefreshCookie(res);
  sendSuccess(res, { loggedOut: true });
});

export const forgot = asyncHandler(async (req: Request, res: Response) => {
  await forgotPassword(req.body.identifier);
  sendSuccess(res, { sent: true });
});

export const reset = asyncHandler(async (req: Request, res: Response) => {
  await resetPassword(req.body.identifier, req.body.code, req.body.password);
  sendSuccess(res, { reset: true });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await getCurrentUser(req.auth!.userId);
  sendSuccess(res, user);
});

export const removeAccount = asyncHandler(async (req: Request, res: Response) => {
  await deleteUserAccount(req.auth!.userId);
  clearRefreshCookie(res);
  sendSuccess(res, { deleted: true });
});
