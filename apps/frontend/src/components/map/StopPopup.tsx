import { Popup } from "react-leaflet";

import { useArrivals } from "../../hooks/useArrivals";
import type { Arrival } from "../../types";

interface StopPopupProps {
  stopId: string;
  stopName: string;
}

function formatArrivalTime(value: string): string {
  return new Intl.DateTimeFormat("en-IE", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function getDelayClass(status: Arrival["status"]): string {
  if (status === "on_time") {
    return "text-green-700";
  }

  if (status === "delayed") {
    return "text-red-700";
  }

  return "text-blue-700";
}

function formatDelay(arrival: Arrival): string {
  if (arrival.status === "on_time") {
    return "on time";
  }

  const delayMinutes = Math.round(arrival.delaySeconds / 60);

  if (arrival.status === "delayed") {
    return `+${delayMinutes} min`;
  }

  return `${delayMinutes} min`;
}

export function StopPopup({ stopId, stopName }: StopPopupProps) {
  const { arrivals, loading, error } = useArrivals(stopId);

  return (
    <Popup minWidth={280}>
      <div className="min-w-[16rem] space-y-3">
        <div>
          <p className="text-lg font-semibold text-slate-900">{stopName}</p>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            {stopId}
          </p>
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
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
                key={`${arrival.tripId}-${arrival.predictedArrival}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Route
                    </p>
                    <p className="text-lg font-bold text-slate-900">
                      {arrival.routeId}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Scheduled
                    </p>
                    <p className="text-sm font-semibold text-slate-700">
                      {formatArrivalTime(arrival.scheduledArrival)}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Delay
                    </p>
                    <p className={`text-sm font-semibold ${getDelayClass(arrival.status)}`}>
                      {formatDelay(arrival)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Predicted
                    </p>
                    <p className="text-lg font-bold text-slate-900">
                      {formatArrivalTime(arrival.predictedArrival)}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </Popup>
  );
}
