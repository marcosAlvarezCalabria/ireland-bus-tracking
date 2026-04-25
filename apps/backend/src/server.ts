import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

import { env } from "./config/env.js";
import arrivalsRouter from "./presentation/arrivals-router.js";
import predictionRouter from "./presentation/prediction-router.js";
import stopsRouter from "./presentation/stops-router.js";
import vehiclesRouter from "./presentation/vehicles-router.js";

void env;

const app = express();
app.set("trust proxy", 1);
const globalRateLimit = rateLimit({
  windowMs: 60_000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false
});

app.use(helmet());
app.use(cors());
app.use(globalRateLimit);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString()
  });
});

app.use("/stops", stopsRouter);
app.use("/arrivals", arrivalsRouter);
app.use("/prediction", predictionRouter);
app.use("/vehicles", vehiclesRouter);

export default app;
