import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useGeolocation } from "./useGeolocation";

describe("useGeolocation", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("falls back to Galway center when geolocation fails", async () => {
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: {
        getCurrentPosition: vi.fn((_success, error) => {
          error({ message: "Permission denied" });
        })
      }
    });

    const { result } = renderHook(() => useGeolocation());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.lat).toBe(53.2743);
    expect(result.current.lng).toBe(-9.0491);
    expect(result.current.error).toBe("Permission denied");
  });
});
