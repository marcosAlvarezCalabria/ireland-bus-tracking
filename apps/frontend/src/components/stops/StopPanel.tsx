import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { getArrivals } from "../../services/api";
import type { Arrival, Stop } from "../../types";
import { ArrivalCard } from "./ArrivalCard";

interface StopPanelProps {
  selectedStop: Stop | null;
}

export function StopPanel({ selectedStop }: StopPanelProps) {
  const { t } = useTranslation();
  const [arrivals, setArrivals] = useState<Arrival[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedStop) {
      setArrivals([]);
      return;
    }

    setLoading(true);
    setError(null);

    void getArrivals(selectedStop.id)
      .then(setArrivals)
      .catch((error: unknown) => {
        setError(error instanceof Error ? error.message : "Unable to load arrivals");
        setArrivals([]);
      })
      .finally(() => setLoading(false));
  }, [selectedStop]);

  if (!selectedStop) {
    return (
      <section className="h-full overflow-y-auto bg-white p-5 dark:bg-slate-950">
        <p className="text-lg font-semibold text-slate-700 dark:text-slate-200">
          Select a stop on the map
        </p>
      </section>
    );
  }

  return (
    <section className="h-full overflow-y-auto bg-white p-5 dark:bg-slate-950">
      <h2 className="text-2xl font-bold text-slate-950 dark:text-white">
        {selectedStop.name}
      </h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
        {Math.round(selectedStop.distance)} m away
      </p>

      {loading ? (
        <div className="mt-5 space-y-3" role="status">
          <div className="h-24 animate-pulse rounded-md bg-slate-200 dark:bg-slate-800" />
          <div className="h-24 animate-pulse rounded-md bg-slate-200 dark:bg-slate-800" />
        </div>
      ) : null}

      {error ? (
        <p className="mt-5 rounded-md bg-red-50 p-4 font-semibold text-red-800 dark:bg-red-950 dark:text-red-100">
          {error}
        </p>
      ) : null}

      {!loading && !error && arrivals.length === 0 ? (
        <p className="mt-5 text-lg font-semibold text-slate-700 dark:text-slate-200">
          {t("no_buses")}
        </p>
      ) : null}

      <div className="mt-5 space-y-4">
        {arrivals.map((arrival) => (
          <ArrivalCard arrival={arrival} key={`${arrival.tripId}-${arrival.stopId}`} />
        ))}
      </div>
    </section>
  );
}
