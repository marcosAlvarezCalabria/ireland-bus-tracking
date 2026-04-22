import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Stop } from "../src/domain/stop.js";
import app from "../src/server.js";

const mockStops: Stop[] = [
  {
    id: "galway-stop-1",
    name: "Eyre Square",
    lat: 53.2743,
    lng: -9.0491,
    distance: 120
  }
];

const findNearbyMock = vi.fn();

vi.mock("../src/infrastructure/postgres-stop-repository.js", () => ({
  PostgresStopRepository: vi.fn().mockImplementation(() => ({
    findNearby: findNearbyMock
  }))
}));

describe("GET /stops", () => {
  beforeEach(() => {
    findNearbyMock.mockReset();
    findNearbyMock.mockResolvedValue(mockStops);
  });

  it("returns nearby stops for valid coordinates", async () => {
    const response = await request(app).get("/stops?lat=53.27&lng=-9.05");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockStops);
  });

  it("returns nearby stops for valid coordinates and radius", async () => {
    const response = await request(app).get(
      "/stops?lat=53.27&lng=-9.05&radius=1000"
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockStops);
    expect(findNearbyMock).toHaveBeenCalledWith(53.27, -9.05, 1000);
  });

  it("returns 400 when coordinates are missing", async () => {
    const response = await request(app).get("/stops");

    expect(response.status).toBe(400);
  });

  it("returns 400 when coordinates are outside valid bounds", async () => {
    const response = await request(app).get("/stops?lat=999&lng=-9.05");

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Invalid coordinates");
  });
});
