import { Router } from "express";

import { gtfsVehicleCache } from "../infrastructure/gtfs-vehicle-cache.js";

const vehiclesRouter = Router();

vehiclesRouter.get("/", (_req, res) => {
  res.status(200).json(gtfsVehicleCache.getAll());
});

export default vehiclesRouter;
