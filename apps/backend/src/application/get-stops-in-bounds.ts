import type { Stop, StopRepository } from "../domain/stop.js";

export class GetStopsInBounds {
  public constructor(private repo: StopRepository) {}

  public async execute(
    minLat: number,
    maxLat: number,
    minLng: number,
    maxLng: number
  ): Promise<Stop[]> {
    if (
      minLat < -90 ||
      minLat > 90 ||
      maxLat < -90 ||
      maxLat > 90 ||
      minLng < -180 ||
      minLng > 180 ||
      maxLng < -180 ||
      maxLng > 180 ||
      minLat > maxLat ||
      minLng > maxLng
    ) {
      throw new Error("Invalid bounds");
    }

    return this.repo.findInBounds(minLat, maxLat, minLng, maxLng);
  }
}
