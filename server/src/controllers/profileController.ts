import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../utils/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";
import { AppError } from "../utils/appError";

export const profileSchemas = {
  update: z.object({
    name: z.string().min(2, "الاسم مطلوب"),
    carModel: z.string().optional().nullable(),
    carYear: z.coerce.number().min(1990).max(2100).optional().nullable(),
    licensePlate: z.string().optional().nullable(),
    defaultCommission: z.coerce.number().min(0).max(100),
    defaultCommissionUber: z.coerce.number().min(0).max(100),
    defaultCommissionCareem: z.coerce.number().min(0).max(100),
    defaultCommissionInDrive: z.coerce.number().min(0).max(100),
    defaultCommissionOther: z.coerce.number().min(0).max(100),
    defaultFuelCostKm: z.coerce.number().min(0),
    currency: z.string().min(1),
    notificationsEnabled: z.boolean(),
    monthlyGoal: z.coerce.number().min(0),
    theme: z.enum(["dark", "light"])
  })
};

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const [user, profile] = await Promise.all([
    prisma.user.findUnique({
      where: { id: req.auth!.userId },
      select: { id: true, name: true, email: true, phone: true }
    }),
    prisma.profile.findUnique({
      where: { userId: req.auth!.userId }
    })
  ]);

  if (!user || !profile) {
    throw new AppError("الملف الشخصي غير موجود", 404, "PROFILE_NOT_FOUND");
  }

  sendSuccess(res, {
    ...user,
    profile
  });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const { name, ...profileData } = req.body;

  const [user, profile] = await Promise.all([
    prisma.user.update({
      where: { id: req.auth!.userId },
      data: { name },
      select: { id: true, name: true, email: true, phone: true }
    }),
    prisma.profile.update({
      where: { userId: req.auth!.userId },
      data: profileData
    })
  ]);

  sendSuccess(res, {
    ...user,
    profile
  });
});
