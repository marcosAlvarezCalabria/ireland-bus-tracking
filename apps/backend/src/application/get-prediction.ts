import type {
  Prediction,
  PredictionRepository
} from "../domain/prediction.js";

export class GetPrediction {
  public constructor(private repo: PredictionRepository) {}

  public async execute(stopId: string, routeId: string): Promise<Prediction> {
    if (stopId.trim().length === 0 || routeId.trim().length === 0) {
      throw new Error("Invalid parameters");
    }

    return this.repo.findByStopAndRoute(stopId, routeId);
  }
}
