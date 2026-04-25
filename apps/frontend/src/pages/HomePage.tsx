import { useEffect, useState } from "react";

import { MapView } from "../components/map/MapView";
import { VehicleMarkers } from "../components/map/VehicleMarkers";
import { StopPanel } from "../components/stops/StopPanel";
import { useGeolocation } from "../hooks/useGeolocation";
import { getStops, getVehicles, type Vehicle } from "../services/api";
import type { Stop } from "../types";

export function HomePage() {
  const location = useGeolocation();
  const [stops, setStops] = useState<Stop[]>([]);
  const [selectedStop, setSelectedStop] = useState<Stop | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    void getStops()
      .then((allStops) => {
        setStops(allStops);
        setSelectedStop((currentSelectedStop) => {
          if (currentSelectedStop === null) {
            return null;
          }

          return allStops.find((stop) => stop.id === currentSelectedStop.id) ?? null;
        });
        setError(null);
      })
      .catch((loadError: unknown) => {
        setError(loadError instanceof Error ? loadError.message : "Unable to load stops");
        setStops([]);
      });
  }, []);

  useEffect(() => {
    const loadVehicles = () => {
      void getVehicles()
        .then((activeVehicles) => {
          setVehicles(activeVehicles);
        })
        .catch(() => {
          setVehicles([]);
        });
    };

    loadVehicles();

    const intervalId = window.setInterval(loadVehicles, 30_000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <main className="flex min-h-screen flex-col bg-slate-100 text-slate-950 dark:bg-slate-950 dark:text-white">
      <section className="relative h-[60vh]">
        <MapView
          onSelectStop={setSelectedStop}
          selectedStopId={selectedStop?.id ?? null}
          stops={stops}
          userLocation={{ lat: location.lat, lng: location.lng }}
        >
          <VehicleMarkers vehicles={vehicles} />
        </MapView>
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
