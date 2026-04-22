import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Arrival } from "../src/domain/arrival.js";
import app from "../src/server.js";

const mockArrivals: Arrival[] = [
  {
    tripId: "trip-123",
    routeId: "route-409",
    stopId: "stop-123",
    scheduledArrival: "2026-04-22T16:30:00.000Z",
    delaySeconds: 120,
    predictedArrival: "2026-04-22T16:32:00.000Z",
    status: "delayed"
  }
];

const findByStopIdMock = vi.fn();

vi.mock("../src/infrastructure/postgres-arrival-repository.js", () => ({
  PostgresArrivalRepository: vi.fn().mockImplementation(() => ({
    findByStopId: findByStopIdMock
  }))
}));

describe("GET /arrivals/:stopId", () => {
  beforeEach(() => {
    findByStopIdMock.mockReset();
    findByStopIdMock.mockResolvedValue(mockArrivals);
  });

  it("returns arrivals for a stop", async () => {
    const response = await request(app).get("/arrivals/stop-123");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockArrivals);
  });

  it("returns arrival fields for each item", async () => {
    const response = await request(app).get("/arrivals/stop-123");

    expect(response.status).toBe(200);
    expect(response.body[0]).toEqual(
      expect.objectContaining({
        tripId: expect.any(String),
        routeId: expect.any(String),
        stopId: expect.any(String),
        scheduledArrival: expect.any(String),
        delaySeconds: expect.any(Number),
        predictedArrival: expect.any(String),
        status: expect.any(String)
      })
    );
  });

  it("returns 404 when stop ID is missing", async () => {
    const response = await request(app).get("/arrivals/");

    expect(response.status).toBe(404);
  });

  it("returns 500 when the repository throws an unexpected error", async () => {
    findByStopIdMock.mockRejectedValue(new Error("Database failed"));

    const response = await request(app).get("/arrivals/stop-123");

    expect(response.status).toBe(500);
    expect(response.body.error).toBe("Internal server error");
  });
});
