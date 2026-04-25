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
    bearing: 180
  }
];

const { getAllMock } = vi.hoisted(() => ({
  getAllMock: vi.fn()
}));

vi.mock("../src/infrastructure/gtfs-vehicle-cache.js", () => ({
  gtfsVehicleCache: {
    getAll: getAllMock
  }
}));

describe("GET /vehicles", () => {
  beforeEach(() => {
    getAllMock.mockReset();
    getAllMock.mockReturnValue(mockVehicles);
  });

  it("returns vehicles", async () => {
    const response = await request(app).get("/vehicles");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockVehicles);
  });
});
