import { Router } from "express";

import { GetPrediction } from "../application/get-prediction.js";
import { StubPredictionRepository } from "../infrastructure/stub-prediction-repository.js";

const predictionRouter = Router();

predictionRouter.get("/:stopId/:routeId", async (req, res) => {
  const stopId = req.params.stopId ?? "";
  const routeId = req.params.routeId ?? "";

  try {
    const repo = new StubPredictionRepository();
    const getPrediction = new GetPrediction(repo);
    const prediction = await getPrediction.execute(stopId, routeId);

    res.status(200).json(prediction);
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid parameters") {
      res.status(400).json({ error: "Invalid parameters" });
      return;
    }

    res.status(500).json({ error: "Internal server error" });
  }
});

export default predictionRouter;
