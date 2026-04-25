export interface Stop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  routes: string[];
  distance: number;
}

export interface Arrival {
  tripId: string;
  routeId: string;
  stopId: string;
  scheduledArrival: string;
  delaySeconds: number;
  predictedArrival: string;
  status: "on_time" | "delayed" | "early";
}
