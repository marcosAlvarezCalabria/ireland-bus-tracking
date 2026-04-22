import type {
  Prediction,
  PredictionRepository
} from "../domain/prediction.js";

export class StubPredictionRepository implements PredictionRepository {
  public async findByStopAndRoute(
    stopId: string,
    routeId: string
  ): Promise<Prediction> {
    return {
      stopId,
      routeId,
      predictedDelaySeconds: null,
      confidence: null,
      status: "unavailable",
      message: "ML model not trained yet. Collecting data."
    };
  }
}
