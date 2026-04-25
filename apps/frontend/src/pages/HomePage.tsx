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
  const [routeQuery, setRouteQuery] = useState("");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const normalizedRouteQuery = routeQuery.trim().toLowerCase();
  const filteredStops =
    normalizedRouteQuery.length === 0
      ? stops
      : stops.filter((stop) =>
          stop.routes
            .replace(/[{}]/g, "")
            .split(",")
            .map((route) => route.trim().toLowerCase())
            .filter((route) => route.length > 0)
            .includes(normalizedRouteQuery)
        );
  const filteredVehicles =
    normalizedRouteQuery.length === 0
      ? vehicles
      : vehicles.filter((vehicle) => {
          const routeId = vehicle.routeId.trim().toLowerCase();
          const routeShortName = vehicle.routeShortName.trim().toLowerCase();

          return (
            routeId === normalizedRouteQuery ||
            routeShortName === normalizedRouteQuery
          );
        });

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
    if (selectedStop === null) {
      return;
    }

    const stopStillVisible = filteredStops.some((stop) => stop.id === selectedStop.id);
    if (!stopStillVisible) {
      setSelectedStop(null);
    }
  }, [filteredStops, selectedStop]);

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
          stops={filteredStops}
          userLocation={{ lat: location.lat, lng: location.lng }}
        >
          <VehicleMarkers vehicles={filteredVehicles} />
        </MapView>
        <div className="absolute left-4 right-4 top-4 z-[1000] sm:left-1/2 sm:right-auto sm:w-[26rem] sm:-translate-x-1/2">
          <div className="rounded-xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
            <label
              className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500"
              htmlFor="route-filter"
            >
              Filter by route
            </label>
            <div className="flex items-center gap-2">
              <input
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition placeholder:text-slate-400 focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                id="route-filter"
                onChange={(event) => setRouteQuery(event.target.value)}
                placeholder='Try "401"'
                value={routeQuery}
              />
              {normalizedRouteQuery.length > 0 ? (
                <button
                  className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                  onClick={() => setRouteQuery("")}
                  type="button"
                >
                  Clear
                </button>
              ) : null}
            </div>
          </div>
        </div>
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
