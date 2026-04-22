import cors from "cors";
import express from "express";
import helmet from "helmet";

import { env } from "./config/env.js";
import stopsRouter from "./presentation/stops-router.js";

void env;

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString()
  });
});

app.use("/stops", stopsRouter);

export default app;
