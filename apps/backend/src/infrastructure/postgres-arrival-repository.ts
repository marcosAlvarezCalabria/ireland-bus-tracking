import type pg from "pg";

import type { Arrival, ArrivalRepository } from "../domain/arrival.js";

interface ArrivalRow {
  trip_id: string;
  route_id: string;
  stop_id: string;
  arrival_time: Date;
  delay_seconds: number;
}

export class PostgresArrivalRepository implements ArrivalRepository {
  public constructor(private pool: pg.Pool) {}

  public async findByStopId(stopId: string): Promise<Arrival[]> {
    const query = `
      SELECT trip_id, route_id, stop_id, arrival_time, delay_seconds
      FROM trip_updates
      WHERE stop_id = $1
        AND arrival_time > NOW()
      ORDER BY arrival_time ASC
      LIMIT 10
    `;

    const result = await this.pool.query<ArrivalRow>(query, [stopId]);

    return result.rows.map((row) => {
      const delaySeconds = row.delay_seconds;
      const scheduledArrival = row.arrival_time;
      const predictedArrival = new Date(
        scheduledArrival.getTime() + delaySeconds * 1000
      );

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
