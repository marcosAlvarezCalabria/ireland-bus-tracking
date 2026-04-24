import { Router } from "express";

import { GetNearbyStops } from "../application/get-nearby-stops.js";
import { GetStopsInBounds } from "../application/get-stops-in-bounds.js";
import { pool } from "../infrastructure/db.js";
import { PostgresStopRepository } from "../infrastructure/postgres-stop-repository.js";

const stopsRouter = Router();

stopsRouter.get("/", async (req, res) => {
  try {
    const repo = new PostgresStopRepository(pool);
    const minLat = Number.parseFloat(String(req.query.minLat ?? ""));
    const maxLat = Number.parseFloat(String(req.query.maxLat ?? ""));
    const minLng = Number.parseFloat(String(req.query.minLng ?? ""));
    const maxLng = Number.parseFloat(String(req.query.maxLng ?? ""));

    if (
      !Number.isNaN(minLat) &&
      !Number.isNaN(maxLat) &&
      !Number.isNaN(minLng) &&
      !Number.isNaN(maxLng)
    ) {
      const getStopsInBounds = new GetStopsInBounds(repo);
      const stops = await getStopsInBounds.execute(
        minLat,
        maxLat,
        minLng,
        maxLng
      );

      res.status(200).json(stops);
      return;
    }

    const lat = Number.parseFloat(String(req.query.lat ?? ""));
    const lng = Number.parseFloat(String(req.query.lng ?? ""));

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      res.status(400).json({ error: "Invalid coordinates" });
      return;
    }

    const radiusQuery = req.query.radius;
    const parsedRadius =
      radiusQuery === undefined
        ? 500
        : Number.parseInt(String(radiusQuery), 10);
    const radiusMeters = Number.isNaN(parsedRadius)
      ? 500
      : Math.min(parsedRadius, 2000);
    const getNearbyStops = new GetNearbyStops(repo);
    const stops = await getNearbyStops.execute(lat, lng, radiusMeters);

    res.status(200).json(stops);
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid coordinates") {
      res.status(400).json({ error: "Invalid coordinates" });
      return;
    }

    if (error instanceof Error && error.message === "Invalid bounds") {
      res.status(400).json({ error: "Invalid bounds" });
      return;
    }

    res.status(500).json({ error: "Internal server error" });
  }
});

export default stopsRouter;
