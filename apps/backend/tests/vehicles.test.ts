import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Vehicle } from "../src/domain/vehicle.js";
import app from "../src/server.js";

const mockVehicles: Vehicle[] = [
  {
    id: "veh-123",
    lat: 53.3498,
    lng: -6.2603,
    routeId: "46A",
    tripId: "trip-123",
    bearing: 180,
    routeName: "",
    nextStop: ""
  }
];

const { getAllMock, getRouteNameMock, getNextStopMock } = vi.hoisted(() => ({
  getAllMock: vi.fn(),
  getRouteNameMock: vi.fn(),
  getNextStopMock: vi.fn()
}));

vi.mock("../src/infrastructure/gtfs-vehicle-cache.js", () => ({
  gtfsVehicleCache: {
    getAll: getAllMock
  }
}));

vi.mock("../src/infrastructure/gtfs-static-cache.js", () => ({
  gtfsStaticCache: {
    getRouteName: getRouteNameMock
  }
}));

vi.mock("../src/infrastructure/gtfs-feed-cache.js", () => ({
  gtfsFeedCache: {
    getNextStop: getNextStopMock
  }
}));

describe("GET /vehicles", () => {
  beforeEach(() => {
    getAllMock.mockReset();
    getRouteNameMock.mockReset();
    getNextStopMock.mockReset();
    getAllMock.mockReturnValue(mockVehicles);
    getRouteNameMock.mockReturnValue("Phoenix Park - Dun Laoghaire");
    getNextStopMock.mockReturnValue("1234");
  });

  it("returns enriched vehicles", async () => {
    const response = await request(app).get("/vehicles");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        ...mockVehicles[0],
        routeName: "Phoenix Park - Dun Laoghaire",
        nextStop: "1234"
      }
    ]);
  });
});
