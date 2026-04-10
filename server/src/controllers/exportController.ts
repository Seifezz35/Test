import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { buildTripsCsv } from "../services/exportService";

export const exportTripsCsv = asyncHandler(async (req: Request, res: Response) => {
  const csv = await buildTripsCsv(req.auth!.userId);

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", "attachment; filename=\"captainprofit-trips.csv\"");
  res.status(200).send(csv);
});
