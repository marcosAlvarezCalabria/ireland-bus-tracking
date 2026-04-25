import { transit_realtime } from "gtfs-realtime-bindings";

import { env } from "../config/env.js";
import type { Vehicle } from "../domain/vehicle.js";

const TFI_VEHICLES_URL = "https://api.nationaltransport.ie/gtfsr/v2/vehicles";
const REFRESH_INTERVAL_MS = 30_000;

class GtfsVehicleCache {
  private vehicles: Vehicle[] = [];
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

  public getAll(): Vehicle[] {
    return [...this.vehicles];
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
      const response = await fetch(TFI_VEHICLES_URL, {
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
      const nextVehicles = this.buildVehicles(feed);

      this.vehicles = nextVehicles;

      console.info(`[vehicle-cache] refreshed — ${nextVehicles.length} vehicles`);
    } catch (error) {
      console.error("[vehicle-cache] refresh failed", error);
    }
  }

  private buildVehicles(feed: transit_realtime.FeedMessage): Vehicle[] {
    const vehicles: Vehicle[] = [];

    for (const entity of feed.entity) {
      const vehicle = entity.vehicle;
      const position = vehicle?.position;
      const trip = vehicle?.trip;

      if (!vehicle || !position || !trip) {
        continue;
      }

      vehicles.push({
        id: vehicle.vehicle?.id ?? "",
        lat: position.latitude,
        lng: position.longitude,
        routeId: trip.routeId ?? "",
        tripId: trip.tripId ?? "",
        bearing: Number(position.bearing ?? 0),
        routeName: "",
        nextStop: ""
      });
    }

    return vehicles;
  }
}

export const gtfsVehicleCache = new GtfsVehicleCache(env.TFI_API_KEY_RT);
