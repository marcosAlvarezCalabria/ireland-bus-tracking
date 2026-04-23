import { parse } from "csv-parse/sync";
import { readFileSync } from "node:fs";
import path from "node:path";
import { Pool } from "pg";

const DATABASE_URL =
  process.env.DATABASE_URL ??
  "postgresql://openclaw_admin:openclaw2026@localhost:5432/galway_bus";
const MAX_BATCH_SIZE = 9000;

interface GtfsStopRow {
  stop_id?: string;
  stop_name?: string;
  stop_lat?: string;
  stop_lon?: string;
}

interface StopRecord {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

function readStopsFile(): string {
  const stopsPath = path.join(process.cwd(), "GTFS_All", "stops.txt");
  return readFileSync(stopsPath, "utf8");
}

function isGalwayStop(stop: StopRecord): boolean {
  return (
    stop.lat >= 53.2 &&
    stop.lat <= 53.35 &&
    stop.lng >= -9.2 &&
    stop.lng <= -8.9
  );
}

function parseStops(stopsCsv: string): StopRecord[] {
  const rows = parse(stopsCsv, {
    bom: true,
    columns: true,
    skip_empty_lines: true,
    trim: true
  }) as GtfsStopRow[];

  console.log(`Total rows: ${rows.length}`);

  const galwayStops = rows
    .map((row) => {
      const lat = Number(row.stop_lat);
      const lng = Number(row.stop_lon);

      if (!row.stop_id || !row.stop_name || Number.isNaN(lat) || Number.isNaN(lng)) {
        return null;
      }

      return {
        id: row.stop_id,
        name: row.stop_name,
        lat,
        lng
      };
    })
    .filter((stop): stop is StopRecord => stop !== null)
    .filter(isGalwayStop);

  console.log(`Galway rows: ${galwayStops.length}`);

  return galwayStops;
}

async function insertStops(pool: Pool, stops: StopRecord[]): Promise<number> {
  let insertedRows = 0;

  await pool.query("TRUNCATE TABLE stops");

  for (let start = 0; start < stops.length; start += MAX_BATCH_SIZE) {
    const batch = stops.slice(start, start + MAX_BATCH_SIZE);
    const values: Array<string | number> = [];
    const placeholders = batch
      .map((stop, index) => {
        const offset = index * 4;
        values.push(stop.id, stop.name, stop.lat, stop.lng);
        return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4})`;
      })
      .join(", ");

    await pool.query(
      `INSERT INTO stops (id, name, lat, lng) VALUES ${placeholders}`,
      values
    );

    insertedRows += batch.length;
    console.log(`Inserted rows: ${insertedRows}`);
  }

  return insertedRows;
}

async function main(): Promise<void> {
  const stopsCsv = readStopsFile();
  const galwayStops = parseStops(stopsCsv);
  const pool = new Pool({ connectionString: DATABASE_URL });

  try {
    const insertedRows = await insertStops(pool, galwayStops);
    console.log(`Import complete. Inserted rows: ${insertedRows}`);
  } finally {
    await pool.end();
  }
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
