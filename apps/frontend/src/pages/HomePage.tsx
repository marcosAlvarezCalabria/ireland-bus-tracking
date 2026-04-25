import { useEffect, useRef, useState } from "react";

import { MapView } from "../components/map/MapView";
import { VehicleMarkers } from "../components/map/VehicleMarkers";
import { StopPanel } from "../components/stops/StopPanel";
import { useGeolocation } from "../hooks/useGeolocation";
import { getStopsInBounds, getVehicles, type Vehicle } from "../services/api";
import type { Stop } from "../types";

interface MapBounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

export function HomePage() {
  const location = useGeolocation();
  const [stops, setStops] = useState<Stop[]>([]);
  const [selectedStop, setSelectedStop] = useState<Stop | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bounds, setBounds] = useState<MapBounds | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    if (bounds === null) {
      return;
    }

    if (debounceRef.current !== null) {
      window.clearTimeout(debounceRef.current);
    }

    debounceRef.current = window.setTimeout(() => {
      void getStopsInBounds(
        bounds.minLat,
        bounds.maxLat,
        bounds.minLng,
        bounds.maxLng
      )
        .then((visibleStops) => {
          setStops(visibleStops);
          setSelectedStop((currentSelectedStop) => {
            if (currentSelectedStop === null) {
              return null;
            }

            return (
              visibleStops.find((stop) => stop.id === currentSelectedStop.id) ?? null
            );
          });
          setError(null);
        })
        .catch((error: unknown) => {
          setError(error instanceof Error ? error.message : "Unable to load stops");
          setStops([]);
        });
    }, 300);

    return () => {
      if (debounceRef.current !== null) {
        window.clearTimeout(debounceRef.current);
      }
    };
  }, [bounds]);

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
          onBoundsChange={setBounds}
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
