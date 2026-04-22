import type { Arrival, ArrivalRepository } from "../domain/arrival.js";

export class GetArrivals {
  public constructor(private repo: ArrivalRepository) {}

  public async execute(stopId: string): Promise<Arrival[]> {
    if (stopId.trim().length === 0) {
      throw new Error("Invalid stop ID");
    }

    return this.repo.findByStopId(stopId);
  }
}
