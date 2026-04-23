import { useEffect, useState } from "react";

import { MapView } from "../components/map/MapView";
import { StopPanel } from "../components/stops/StopPanel";
import { useGeolocation } from "../hooks/useGeolocation";
import { getNearbyStops } from "../services/api";
import type { Stop } from "../types";

export function HomePage() {
  const location = useGeolocation();
  const [stops, setStops] = useState<Stop[]>([]);
  const [selectedStop, setSelectedStop] = useState<Stop | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (location.loading) {
      return;
    }

    void getNearbyStops(location.lat, location.lng)
      .then((nearbyStops) => {
        setStops(nearbyStops);
        setError(null);
      })
      .catch((error: unknown) => {
        setError(error instanceof Error ? error.message : "Unable to load stops");
        setStops([]);
      });
  }, [location.lat, location.lng, location.loading]);

  return (
    <main className="flex min-h-screen flex-col bg-slate-100 text-slate-950 dark:bg-slate-950 dark:text-white">
      <section className="relative h-[60vh]">
        <MapView
          onSelectStop={setSelectedStop}
          selectedStopId={selectedStop?.id ?? null}
          stops={stops}
          userLocation={{ lat: location.lat, lng: location.lng }}
        />
        {location.loading ? (
          <div className="absolute left-4 top-4 rounded-md bg-white px-4 py-2 font-semibold shadow dark:bg-slate-900">
            Loading...
          </div>
        ) : null}
        {error ? (
          <div className="absolute bottom-4 left-4 right-4 rounded-md bg-red-50 px-4 py-3 font-semibold text-red-800 shadow dark:bg-red-950 dark:text-red-100">
            {error}
          </div>
        ) : null}
      </section>
      <section className="h-[40vh] min-h-[280px]">
        <StopPanel selectedStop={selectedStop} />
      </section>
    </main>
  );
}
