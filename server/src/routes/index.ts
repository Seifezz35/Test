import { Router } from "express";
import { analyticsRouter } from "./analyticsRoutes";
import { authRouter } from "./authRoutes";
import { dayRouter } from "./dayRoutes";
import { exportRouter } from "./exportRoutes";
import { profileRouter } from "./profileRoutes";
import { tripRouter } from "./tripRoutes";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/trips", tripRouter);
apiRouter.use("/days", dayRouter);
apiRouter.use("/analytics", analyticsRouter);
apiRouter.use("/profile", profileRouter);
apiRouter.use("/export", exportRouter);
