import { Router } from "express";
import { exportTripsCsv } from "../controllers/exportController";
import { requireAuth } from "../middleware/auth";

export const exportRouter = Router();

exportRouter.get("/csv", requireAuth, exportTripsCsv);
