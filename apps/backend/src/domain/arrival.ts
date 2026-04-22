export interface Arrival {
  tripId: string;
  routeId: string;
  stopId: string;
  scheduledArrival: string;
  delaySeconds: number;
  predictedArrival: string;
  status: "on_time" | "delayed" | "early";
}

export interface ArrivalRepository {
  findByStopId(stopId: string): Promise<Arrival[]>;
}
