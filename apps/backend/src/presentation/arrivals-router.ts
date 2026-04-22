import { Router } from "express";

import { GetArrivals } from "../application/get-arrivals.js";
import { pool } from "../infrastructure/db.js";
import { PostgresArrivalRepository } from "../infrastructure/postgres-arrival-repository.js";

const arrivalsRouter = Router();

arrivalsRouter.get("/:stopId", async (req, res) => {
  const stopId = req.params.stopId ?? "";

  try {
    const repo = new PostgresArrivalRepository(pool);
    const getArrivals = new GetArrivals(repo);
    const arrivals = await getArrivals.execute(stopId);

    res.status(200).json(arrivals);
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid stop ID") {
      res.status(400).json({ error: "Invalid stop ID" });
      return;
    }

    res.status(500).json({ error: "Internal server error" });
  }
});

export default arrivalsRouter;
