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
    routes: "401,404,405",
    distance: 120
  }
];

const findAllMock = vi.fn();
const findNearbyMock = vi.fn();
const findInBoundsMock = vi.fn();

vi.mock("../src/infrastructure/postgres-stop-repository.js", () => ({
  PostgresStopRepository: vi.fn().mockImplementation(() => ({
    findAll: findAllMock,
    findNearby: findNearbyMock,
    findInBounds: findInBoundsMock
  }))
}));

describe("GET /stops", () => {
  beforeEach(() => {
    findAllMock.mockReset();
    findNearbyMock.mockReset();
    findInBoundsMock.mockReset();
    findAllMock.mockResolvedValue(mockStops);
    findNearbyMock.mockResolvedValue(mockStops);
    findInBoundsMock.mockResolvedValue(mockStops);
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

  it("returns all stops when coordinates are missing", async () => {
    const response = await request(app).get("/stops");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockStops);
    expect(findAllMock).toHaveBeenCalled();
  });

  it("returns 400 when coordinates are outside valid bounds", async () => {
    const response = await request(app).get("/stops?lat=999&lng=-9.05");

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Invalid coordinates");
  });

  it("returns stops for valid bounds", async () => {
    const response = await request(app).get(
      "/stops?minLat=53.26&maxLat=53.28&minLng=-9.06&maxLng=-9.04"
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockStops);
    expect(findInBoundsMock).toHaveBeenCalledWith(53.26, 53.28, -9.06, -9.04);
  });

  it("returns 400 when bounds are invalid", async () => {
    const response = await request(app).get(
      "/stops?minLat=53.28&maxLat=53.26&minLng=-9.06&maxLng=-9.04"
    );

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Invalid bounds");
  });
});
