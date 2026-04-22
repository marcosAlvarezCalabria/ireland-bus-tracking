import type { Stop, StopRepository } from "../domain/stop.js";

export class GetNearbyStops {
  public constructor(private repo: StopRepository) {}

  public async execute(
    lat: number,
    lng: number,
    radiusMeters: number
  ): Promise<Stop[]> {
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      throw new Error("Invalid coordinates");
    }

    return this.repo.findNearby(lat, lng, radiusMeters);
  }
}
