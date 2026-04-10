import { Request, Response } from "express";
import { z } from "zod";
import {
  getCumulativeAnalytics,
  getDailyAnalytics,
  getMonthlyAnalytics
} from "../services/analyticsService";
import { buildAdvice } from "../services/adviceService";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";

export const analyticsSchemas = {
  daily: z.object({
    date: z.string().optional()
  }),
  monthly: z.object({
    year: z.coerce.number().min(2000),
    month: z.coerce.number().min(1).max(12)
  }),
  advice: z.object({
    date: z.string().optional()
  })
};

export const dailyAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const result = await getDailyAnalytics(req.auth!.userId, req.query.date as string | undefined);
  sendSuccess(res, result);
});

export const monthlyAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const result = await getMonthlyAnalytics(
    req.auth!.userId,
    Number(req.query.year),
    Number(req.query.month)
  );
  sendSuccess(res, result);
});

export const cumulativeAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const result = await getCumulativeAnalytics(req.auth!.userId);
  sendSuccess(res, result);
});

export const adviceAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const result = await buildAdvice(req.auth!.userId, req.query.date as string | undefined);
  sendSuccess(res, result);
});
