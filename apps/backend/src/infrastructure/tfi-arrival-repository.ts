import { transit_realtime } from "gtfs-realtime-bindings";

import type { Arrival, ArrivalRepository } from "../domain/arrival.js";

export class TfiArrivalRepository implements ArrivalRepository {
  public constructor(private apiKey: string) {}

  public async findByStopId(stopId: string): Promise<Arrival[]> {
    const response = await fetch(
      "https://api.nationaltransport.ie/gtfsr/v2/TripUpdates",
      {
        headers: {
          "x-api-key": this.apiKey,
          "Cache-Control": "no-cache"
        }
      }
    );

    if (!response.ok) {
      throw new Error(`TFI API error: ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    const feed = transit_realtime.FeedMessage.decode(new Uint8Array(buffer));
    const now = Date.now();
    const arrivals: Arrival[] = [];

    for (const entity of feed.entity) {
      if (!entity.tripUpdate) {
        continue;
      }

      const { trip, stopTimeUpdate } = entity.tripUpdate;

      for (const stu of stopTimeUpdate ?? []) {
        if (stu.stopId !== stopId) {
          continue;
        }

        const scheduled = (Number(stu.arrival?.time ?? 0)) * 1000;
        if (scheduled < now) {
          continue;
        }

        const delay = Number(stu.arrival?.delay ?? 0);
        const predicted = scheduled + delay * 1000;

        arrivals.push({
          tripId: trip?.tripId ?? "",
          routeId: trip?.routeId ?? "",
          stopId,
          scheduledArrival: new Date(scheduled).toISOString(),
          delaySeconds: delay,
          predictedArrival: new Date(predicted).toISOString(),
          status: this.getStatus(delay)
        });
      }
    }

    return arrivals
      .sort((a, b) => a.scheduledArrival.localeCompare(b.scheduledArrival))
      .slice(0, 10);
  }

  private getStatus(delaySeconds: number): Arrival["status"] {
    if (delaySeconds > 60) {
      return "delayed";
    }

    if (delaySeconds < -60) {
      return "early";
    }

    return "on_time";
  }
}
