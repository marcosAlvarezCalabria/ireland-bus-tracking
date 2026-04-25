import { useEffect, useState } from "react";

import { getArrivals } from "../services/api";
import type { Arrival } from "../types";

interface UseArrivalsResult {
  arrivals: Arrival[];
  loading: boolean;
  error: string | null;
}

export function useArrivals(stopId: string): UseArrivalsResult {
  const [arrivals, setArrivals] = useState<Arrival[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadArrivals = () => {
      if (!active) {
        return;
      }

      setLoading(true);

      void getArrivals(stopId)
        .then((nextArrivals) => {
          if (!active) {
            return;
          }

          setArrivals(nextArrivals);
          setError(null);
        })
        .catch((fetchError: unknown) => {
          if (!active) {
            return;
          }

          setArrivals([]);
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "Unable to load arrivals"
          );
        })
        .finally(() => {
          if (!active) {
            return;
          }

          setLoading(false);
        });
    };

    loadArrivals();

    const intervalId = window.setInterval(loadArrivals, 30_000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [stopId]);

  return { arrivals, loading, error };
}
