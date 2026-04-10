import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/appError";
import { verifyAccessToken } from "../utils/jwt";

export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return next(new AppError("يجب تسجيل الدخول أولًا", 401, "UNAUTHORIZED"));
  }

  try {
    const token = authHeader.replace("Bearer ", "");
    const payload = verifyAccessToken(token);

    if (payload.type !== "access") {
      throw new AppError("رمز الدخول غير صالح", 401, "INVALID_TOKEN");
    }

    req.auth = { userId: payload.userId };
    return next();
  } catch {
    return next(new AppError("انتهت الجلسة أو الرمز غير صالح", 401, "TOKEN_EXPIRED"));
  }
};
