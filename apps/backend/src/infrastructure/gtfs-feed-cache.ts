import { transit_realtime } from "gtfs-realtime-bindings";

import { env } from "../config/env.js";
import type { Arrival } from "../domain/arrival.js";

const TFI_TRIP_UPDATES_URL =
  "https://api.nationaltransport.ie/gtfsr/v2/TripUpdates";
const REFRESH_INTERVAL_MS = 30_000;

class GtfsFeedCache {
  private arrivalsByStopId = new Map<string, Arrival[]>();
  private nextStopByTripId = new Map<string, string>();
  private refreshTimer: NodeJS.Timeout | null = null;
  private refreshInFlight: Promise<void> | null = null;

  public constructor(private apiKey: string) {}

  public async start(): Promise<void> {
    await this.refresh();

    if (this.refreshTimer !== null) {
      return;
    }

    this.refreshTimer = setInterval(() => {
      void this.refresh();
    }, REFRESH_INTERVAL_MS);
  }

  public getArrivals(stopId: string): Arrival[] {
    return [...(this.arrivalsByStopId.get(stopId) ?? [])];
  }

  public getNextStop(tripId: string): string {
    return this.nextStopByTripId.get(tripId) ?? "";
  }

  private async refresh(): Promise<void> {
    if (this.refreshInFlight !== null) {
      return this.refreshInFlight;
    }

    this.refreshInFlight = this.refreshInternal();

    try {
      await this.refreshInFlight;
    } finally {
      this.refreshInFlight = null;
    }
  }

  private async refreshInternal(): Promise<void> {
    try {
      const response = await fetch(TFI_TRIP_UPDATES_URL, {
        headers: {
          "x-api-key": this.apiKey,
          "Cache-Control": "no-cache"
        }
      });

      if (!response.ok) {
        throw new Error(`TFI API error: ${response.status}`);
      }

      const buffer = await response.arrayBuffer();
      const feed = transit_realtime.FeedMessage.decode(new Uint8Array(buffer));
      const nextCache = this.buildArrivalsByStopId(feed);
      const nextStops = this.buildNextStopByTripId(feed);

      this.arrivalsByStopId = nextCache;
      this.nextStopByTripId = nextStops;

      console.info(
        `GTFS cache refreshed: ${nextCache.size} stops, ${feed.entity.length} entities`
      );
    } catch (error) {
      console.error("GTFS cache refresh failed", error);
    }
  }

  private buildArrivalsByStopId(
    feed: transit_realtime.FeedMessage
  ): Map<string, Arrival[]> {
    const arrivalsByStopId = new Map<string, Arrival[]>();
    const now = Date.now();

    for (const entity of feed.entity) {
      if (!entity.tripUpdate) {
        continue;
      }

      const { trip, stopTimeUpdate } = entity.tripUpdate;

      for (const stu of stopTimeUpdate ?? []) {
        const stopId = stu.stopId ?? "";
        if (stopId.length === 0) {
          continue;
        }

        const scheduled = Number(stu.arrival?.time ?? 0) * 1000;
        if (scheduled < now) {
          continue;
        }

        const delay = Number(stu.arrival?.delay ?? 0);
        const predicted = scheduled + delay * 1000;
        const arrivals = arrivalsByStopId.get(stopId) ?? [];

        arrivals.push({
          tripId: trip?.tripId ?? "",
          routeId: trip?.routeId ?? "",
          stopId,
          scheduledArrival: new Date(scheduled).toISOString(),
          delaySeconds: delay,
          predictedArrival: new Date(predicted).toISOString(),
          status: this.getStatus(delay)
        });

        arrivalsByStopId.set(stopId, arrivals);
      }
    }

    for (const [stopId, arrivals] of arrivalsByStopId.entries()) {
      arrivalsByStopId.set(
        stopId,
        arrivals
          .sort((a, b) =>
            a.scheduledArrival.localeCompare(b.scheduledArrival)
          )
          .slice(0, 10)
      );
    }

    return arrivalsByStopId;
  }

  private buildNextStopByTripId(
    feed: transit_realtime.FeedMessage
  ): Map<string, string> {
    const nextStopByTripId = new Map<string, string>();
    const nowSeconds = Date.now() / 1000;

    for (const entity of feed.entity) {
      if (!entity.tripUpdate) {
        continue;
      }

      const tripId = entity.tripUpdate.trip?.tripId ?? "";
      if (tripId.length === 0) {
        continue;
      }

      const nextStop = (entity.tripUpdate.stopTimeUpdate ?? []).find((stu) => {
        const stopId = stu.stopId ?? "";
        const arrivalTime = Number(stu.arrival?.time ?? 0);

        return stopId.length > 0 && arrivalTime > nowSeconds;
      });

      if (!nextStop?.stopId) {
        continue;
      }

      nextStopByTripId.set(tripId, nextStop.stopId);
    }

    return nextStopByTripId;
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

export const gtfsFeedCache = new GtfsFeedCache(env.TFI_API_KEY_RT);
