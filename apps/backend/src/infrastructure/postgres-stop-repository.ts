import type pg from "pg";

import type { Stop, StopRepository } from "../domain/stop.js";

interface StopRow {
  id: string;
  name: string;
  lat: string | number;
  lng: string | number;
  routes: string | null;
  distance: string | number;
}

export class PostgresStopRepository implements StopRepository {
  public constructor(private pool: pg.Pool) {}

  public async findAll(): Promise<Stop[]> {
    const query = `
      SELECT
        id,
        name,
        lat,
        lng,
        routes,
        0 AS distance
      FROM stops
      ORDER BY name ASC
    `;

    const result = await this.pool.query<StopRow>(query);

    return result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      lat: Number(row.lat),
      lng: Number(row.lng),
      routes: row.routes ?? "",
      distance: Number(row.distance)
    }));
  }

  public async findNearby(
    lat: number,
    lng: number,
    radiusMeters: number
  ): Promise<Stop[]> {
    const query = `
      SELECT id, name, lat, lng, routes, distance
      FROM (
        SELECT
          id,
          name,
          lat,
          lng,
          routes,
          6371000 * acos(
            cos(radians($1)) * cos(radians(lat)) *
            cos(radians(lng) - radians($2)) +
            sin(radians($1)) * sin(radians(lat))
          ) AS distance
        FROM stops
      ) nearby_stops
      WHERE distance <= $3
      ORDER BY distance ASC
      LIMIT 50
    `;

    const result = await this.pool.query<StopRow>(query, [
      lat,
      lng,
      radiusMeters
    ]);

    return result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      lat: Number(row.lat),
      lng: Number(row.lng),
      routes: row.routes ?? "",
      distance: Number(row.distance)
    }));
  }

  public async findInBounds(
    minLat: number,
    maxLat: number,
    minLng: number,
    maxLng: number
  ): Promise<Stop[]> {
    const query = `
      SELECT
        id,
        name,
        lat,
        lng,
        routes,
        0 AS distance
      FROM stops
      WHERE lat BETWEEN $1 AND $2
        AND lng BETWEEN $3 AND $4
      ORDER BY name ASC
      LIMIT 500
    `;

    const result = await this.pool.query<StopRow>(query, [
      minLat,
      maxLat,
      minLng,
      maxLng
    ]);

    return result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      lat: Number(row.lat),
      lng: Number(row.lng),
      routes: row.routes ?? "",
      distance: Number(row.distance)
    }));
  }
}
