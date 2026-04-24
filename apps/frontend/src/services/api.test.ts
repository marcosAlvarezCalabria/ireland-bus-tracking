import { afterEach, describe, expect, it, vi } from "vitest";

import { getArrivals, getNearbyStops, getStopsInBounds } from "./api";

describe("api service", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches nearby stops", async () => {
    const stops = [
      { id: "stop-1", name: "Eyre Square", lat: 53.2743, lng: -9.0491, distance: 80 }
    ];
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(stops)
      })
    );

    const result = await getNearbyStops(53.27, -9.05);

    expect(result).toEqual(stops);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/stops?lat=53.27&lng=-9.05&radius=500")
    );
  });

  it("fetches arrivals for a stop", async () => {
    const arrivals = [
      {
        tripId: "trip-1",
        routeId: "409",
        stopId: "stop-1",
        scheduledArrival: "2026-04-23T10:30:00.000Z",
        delaySeconds: 0,
        predictedArrival: "2026-04-23T10:30:00.000Z",
        status: "on_time"
      }
    ];
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(arrivals)
      })
    );

    const result = await getArrivals("stop-1");

    expect(result).toEqual(arrivals);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining("/arrivals/stop-1"));
  });

  it("fetches stops in bounds", async () => {
    const stops = [
      { id: "stop-1", name: "Eyre Square", lat: 53.2743, lng: -9.0491, distance: 0 }
    ];
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(stops)
      })
    );

    const result = await getStopsInBounds(53.26, 53.28, -9.06, -9.04);

    expect(result).toEqual(stops);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining(
        "/stops?minLat=53.26&maxLat=53.28&minLng=-9.06&maxLng=-9.04"
      )
    );
  });
});
