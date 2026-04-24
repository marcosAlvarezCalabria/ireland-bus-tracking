import type { Arrival, ArrivalRepository } from "../domain/arrival.js";
import { gtfsFeedCache } from "./gtfs-feed-cache.js";

export class TfiArrivalRepository implements ArrivalRepository {
  public async findByStopId(stopId: string): Promise<Arrival[]> {
    return gtfsFeedCache.getArrivals(stopId);
  }
}
