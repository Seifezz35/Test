import { Request, Response } from "express";
import { getHistory, getToday } from "../services/dayService";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";

export const getTodayHandler = asyncHandler(async (req: Request, res: Response) => {
  const data = await getToday(req.auth!.userId);
  sendSuccess(res, data);
});

export const getHistoryHandler = asyncHandler(async (req: Request, res: Response) => {
  const data = await getHistory(req.auth!.userId);
  sendSuccess(res, data);
});
