import { Router } from "express";
import {
  adviceAnalytics,
  analyticsSchemas,
  cumulativeAnalytics,
  dailyAnalytics,
  monthlyAnalytics
} from "../controllers/analyticsController";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";

export const analyticsRouter = Router();

analyticsRouter.use(requireAuth);
analyticsRouter.get("/daily", validate({ query: analyticsSchemas.daily }), dailyAnalytics);
analyticsRouter.get("/monthly", validate({ query: analyticsSchemas.monthly }), monthlyAnalytics);
analyticsRouter.get("/cumulative", cumulativeAnalytics);
analyticsRouter.get("/advice", validate({ query: analyticsSchemas.advice }), adviceAnalytics);
