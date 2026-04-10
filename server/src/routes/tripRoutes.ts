import { Router } from "express";
import {
  createTripEntry,
  deleteTripEntry,
  getTrip,
  getTrips,
  tripSchemas,
  updateTripEntry
} from "../controllers/tripController";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";

export const tripRouter = Router();

tripRouter.use(requireAuth);
tripRouter.get("/", validate({ query: tripSchemas.list }), getTrips);
tripRouter.post("/", validate({ body: tripSchemas.body }), createTripEntry);
tripRouter.get("/:id", validate({ params: tripSchemas.params }), getTrip);
tripRouter.put(
  "/:id",
  validate({ params: tripSchemas.params, body: tripSchemas.body }),
  updateTripEntry
);
tripRouter.delete("/:id", validate({ params: tripSchemas.params }), deleteTripEntry);
