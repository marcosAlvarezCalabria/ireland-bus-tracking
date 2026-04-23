import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { Arrival } from "../../types";
import { ArrivalCard } from "./ArrivalCard";

const baseArrival: Arrival = {
  tripId: "trip-1",
  routeId: "409",
  stopId: "stop-1",
  scheduledArrival: "2026-04-23T10:30:00.000Z",
  delaySeconds: 0,
  predictedArrival: "2026-04-23T10:30:00.000Z",
  status: "on_time"
};

describe("ArrivalCard", () => {
  it("uses green status colors for on-time arrivals", () => {
    render(<ArrivalCard arrival={baseArrival} />);

    expect(screen.getByTestId("arrival-card")).toHaveClass("border-primary");
  });

  it("uses yellow status colors for delayed arrivals up to five minutes", () => {
    render(
      <ArrivalCard
        arrival={{ ...baseArrival, delaySeconds: 240, status: "delayed" }}
      />
    );

    expect(screen.getByTestId("arrival-card")).toHaveClass("border-yellow-500");
  });

  it("uses red status colors for delayed arrivals over five minutes", () => {
    render(
      <ArrivalCard
        arrival={{ ...baseArrival, delaySeconds: 420, status: "delayed" }}
      />
    );

    expect(screen.getByTestId("arrival-card")).toHaveClass("border-red-500");
  });
});
