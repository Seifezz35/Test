import { Router } from "express";
import { getHistoryHandler, getTodayHandler } from "../controllers/dayController";
import { requireAuth } from "../middleware/auth";

export const dayRouter = Router();

dayRouter.use(requireAuth);
dayRouter.get("/today", getTodayHandler);
dayRouter.get("/history", getHistoryHandler);
