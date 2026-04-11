import { Request, Response } from "express";
import { z } from "zod";
import {
  createTrip,
  deleteTrip,
  getTripById,
  listTrips,
  updateTrip
} from "../services/tripService";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";

const timeSchema = z.string().regex(/^\d{2}:\d{2}$/, "صيغة الوقت يجب أن تكون HH:mm");

const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "صيغة التاريخ غير صحيحة (YYYY-MM-DD)")
  .optional();

export const tripSchemas = {
  list: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(50).default(10),
    from: isoDateSchema,
    to: isoDateSchema,
    platform: z.string().optional(),
    tag: z.string().optional(),
    profit: z.enum(["profit", "loss"]).optional(),
    sortBy: z.enum(["date", "profit", "distance", "duration"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
    search: isoDateSchema
  }),
  params: z.object({
    id: z.string().cuid("معرف الرحلة غير صالح")
  }),
  body: z.object({
    date: z.string().min(1, "التاريخ مطلوب"),
    startTime: timeSchema,
    endTime: timeSchema,
    distanceKm: z.coerce.number().min(0, "المسافة غير صحيحة"),
    fareAmount: z.coerce.number().min(0, "الأجرة غير صحيحة"),
    commission: z.coerce.number().min(0).max(100),
    fuelCost: z.coerce.number().min(0),
    tollFees: z.coerce.number().min(0).optional(),
    parkingFees: z.coerce.number().min(0).optional(),
    tipAmount: z.coerce.number().min(0).optional(),
    platform: z.string().min(2, "اسم المنصة مطلوب"),
    tags: z.array(z.string()).optional()
  })
};

export const getTrips = asyncHandler(async (req: Request, res: Response) => {
  const result = await listTrips(req.auth!.userId, req.query as unknown as never);
  sendSuccess(res, result);
});

export const createTripEntry = asyncHandler(async (req: Request, res: Response) => {
  const trip = await createTrip(req.auth!.userId, req.body);
  sendSuccess(res, trip, 201);
});

export const getTrip = asyncHandler(async (req: Request, res: Response) => {
  const trip = await getTripById(req.auth!.userId, req.params.id);
  sendSuccess(res, trip);
});

export const updateTripEntry = asyncHandler(async (req: Request, res: Response) => {
  const trip = await updateTrip(req.auth!.userId, req.params.id, req.body);
  sendSuccess(res, trip);
});

export const deleteTripEntry = asyncHandler(async (req: Request, res: Response) => {
  await deleteTrip(req.auth!.userId, req.params.id);
  sendSuccess(res, { deleted: true });
});
