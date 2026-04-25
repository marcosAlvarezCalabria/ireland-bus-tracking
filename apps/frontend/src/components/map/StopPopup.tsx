import { Popup } from "react-leaflet";

import { useArrivals } from "../../hooks/useArrivals";
import type { Arrival } from "../../types";

interface StopPopupProps {
  stopId: string;
}

function formatArrivalTime(value: string): string {
  return new Intl.DateTimeFormat("en-IE", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function getStatusBadgeClass(status: Arrival["status"]): string {
  if (status === "on_time") {
    return "bg-green-100 text-green-800";
  }

  if (status === "delayed") {
    return "bg-red-100 text-red-800";
  }

  return "bg-blue-100 text-blue-800";
}

export function StopPopup({ stopId }: StopPopupProps) {
  const { arrivals, loading, error } = useArrivals(stopId);

  return (
    <Popup minWidth={280}>
      <div className="min-w-[16rem] space-y-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Stop
          </p>
          <p className="text-sm font-semibold text-slate-900">{stopId}</p>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
            Loading arrivals...
          </div>
        ) : null}

        {!loading && error ? (
          <p className="text-sm font-medium text-red-600">{error}</p>
        ) : null}

        {!loading && !error && arrivals.length === 0 ? (
          <p className="text-sm text-slate-600">No upcoming buses</p>
        ) : null}

        {!loading && !error && arrivals.length > 0 ? (
          <ul className="space-y-2">
            {arrivals.map((arrival) => (
              <li
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm"
                key={`${arrival.tripId}-${arrival.predictedArrival}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Route
                    </p>
                    <p className="text-base font-semibold text-slate-900">
                      {arrival.routeId}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Arrives
                    </p>
                    <p className="text-base font-semibold text-slate-900">
                      {formatArrivalTime(arrival.predictedArrival)}
                    </p>
                  </div>
                </div>
                <div className="mt-2">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadgeClass(arrival.status)}`}
                  >
                    {arrival.status.replace("_", " ")}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </Popup>
  );
}
