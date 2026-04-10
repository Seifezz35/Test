import { Router } from "express";
import { getProfile, profileSchemas, updateProfile } from "../controllers/profileController";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";

export const profileRouter = Router();

profileRouter.use(requireAuth);
profileRouter.get("/", getProfile);
profileRouter.put("/", validate({ body: profileSchemas.update }), updateProfile);
