import type pg from "pg";

import type { Arrival, ArrivalRepository } from "../domain/arrival.js";

interface ArrivalRow {
  trip_id: string;
  route_id: string;
  stop_id: string;
  scheduled_arrival: Date;
  predicted_arrival: Date;
  delay_seconds: number;
}

export class PostgresArrivalRepository implements ArrivalRepository {
  public constructor(private pool: pg.Pool) {}

  public async findByStopId(stopId: string): Promise<Arrival[]> {
    const query = `
      SELECT trip_id, route_id, stop_id, scheduled_arrival, predicted_arrival, delay_seconds
      FROM trip_updates
      WHERE stop_id = $1
        AND scheduled_arrival > NOW()
      ORDER BY scheduled_arrival ASC
      LIMIT 10
    `;

    const result = await this.pool.query<ArrivalRow>(query, [stopId]);

    return result.rows.map((row) => {
      const delaySeconds = row.delay_seconds;
      const scheduledArrival = row.scheduled_arrival;
      const predictedArrival = row.predicted_arrival;

      return {
        tripId: row.trip_id,
        routeId: row.route_id,
        stopId: row.stop_id,
        scheduledArrival: scheduledArrival.toISOString(),
        delaySeconds,
        predictedArrival: predictedArrival.toISOString(),
        status: this.getStatus(delaySeconds)
      };
    });
  }

  private getStatus(delaySeconds: number): Arrival["status"] {
    if (delaySeconds > 60) {
      return "delayed";
    }

    if (delaySeconds < -60) {
      return "early";
    }

    return "on_time";
  }
}
