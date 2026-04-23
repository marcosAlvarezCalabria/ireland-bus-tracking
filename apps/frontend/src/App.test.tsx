import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import App from "./App";
import "./i18n";

vi.mock("./components/map/MapView", () => ({
  MapView: () => <div data-testid="map-view" />
}));

vi.mock("./hooks/useGeolocation", () => ({
  useGeolocation: () => ({
    lat: 53.2743,
    lng: -9.0491,
    error: null,
    loading: false
  })
}));

vi.mock("./services/api", () => ({
  getNearbyStops: vi.fn(() => new Promise(() => undefined)),
  getArrivals: vi.fn().mockResolvedValue([])
}));

describe("App", () => {
  it("renders the home page route", () => {
    render(<App />);

    expect(screen.getByTestId("map-view")).toBeInTheDocument();
    expect(screen.getByText("Select a stop on the map")).toBeInTheDocument();
  });
});
