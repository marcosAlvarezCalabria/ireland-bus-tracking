import { Router } from "express";

import { gtfsFeedCache } from "../infrastructure/gtfs-feed-cache.js";
import { gtfsStaticCache } from "../infrastructure/gtfs-static-cache.js";
import { gtfsVehicleCache } from "../infrastructure/gtfs-vehicle-cache.js";

const vehiclesRouter = Router();

vehiclesRouter.get("/", (_req, res) => {
  const vehicles = gtfsVehicleCache.getAll().map((vehicle) => ({
    ...vehicle,
    routeName: gtfsStaticCache.getRouteName(vehicle.routeId),
    routeShortName: gtfsStaticCache.getRouteShortName(vehicle.routeId),
    nextStop: gtfsFeedCache.getNextStop(vehicle.tripId)
  }));

  res.status(200).json(vehicles);
});

export default vehiclesRouter;
