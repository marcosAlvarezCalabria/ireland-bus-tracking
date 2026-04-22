import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../src/server.js";

describe("GET /prediction/:stopId/:routeId", () => {
  it("returns an unavailable prediction placeholder", async () => {
    const response = await request(app).get("/prediction/stop-123/route-409");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        stopId: "stop-123",
        routeId: "route-409",
        status: "unavailable",
        predictedDelaySeconds: null,
        confidence: null
      })
    );
  });

  it("returns a non-empty unavailable message", async () => {
    const response = await request(app).get("/prediction/stop-123/route-409");

    expect(response.status).toBe(200);
    expect(response.body.message).toEqual(expect.any(String));
    expect(response.body.message.length).toBeGreaterThan(0);
  });
});
