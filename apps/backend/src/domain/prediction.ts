export interface Prediction {
  stopId: string;
  routeId: string;
  predictedDelaySeconds: number | null;
  confidence: number | null;
  status: "available" | "unavailable";
  message: string;
}

export interface PredictionRepository {
  findByStopAndRoute(stopId: string, routeId: string): Promise<Prediction>;
}
