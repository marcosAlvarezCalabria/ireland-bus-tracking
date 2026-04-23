import type { Arrival } from "../../types";

interface ArrivalCardProps {
  arrival: Arrival;
}

function getStatusClass(arrival: Arrival): string {
  if (arrival.status === "on_time" || arrival.status === "early") {
    return "border-primary bg-green-50 text-accent dark:bg-green-950 dark:text-green-100";
  }

  if (arrival.delaySeconds <= 300) {
    return "border-yellow-500 bg-yellow-50 text-yellow-900 dark:bg-yellow-950 dark:text-yellow-100";
  }

  return "border-red-500 bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100";
}

function formatArrivalTime(value: string): string {
  return new Intl.DateTimeFormat("en-IE", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export function ArrivalCard({ arrival }: ArrivalCardProps) {
  const delayMinutes = Math.round(arrival.delaySeconds / 60);

  return (
    <article
      className={`rounded-md border-l-8 p-4 shadow-sm ${getStatusClass(arrival)}`}
      data-testid="arrival-card"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-normal">Route</p>
          <p className="text-3xl font-bold">{arrival.routeId}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold uppercase tracking-normal">Arrives</p>
          <p className="text-3xl font-bold">
            {formatArrivalTime(arrival.predictedArrival)}
          </p>
        </div>
      </div>
      <p className="mt-3 text-xl font-semibold">
        Delay: {delayMinutes > 0 ? `+${delayMinutes}` : delayMinutes} min
      </p>
    </article>
  );
}
