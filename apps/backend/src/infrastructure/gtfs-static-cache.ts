import { readFile } from "node:fs/promises";
import path from "node:path";

const ROUTES_FILE_PATHS = [
  path.resolve(process.cwd(), "../../GTFS_All/routes.txt"),
  path.resolve(process.cwd(), "GTFS_All/routes.txt")
];

class GtfsStaticCache {
  private routeNames = new Map<string, string>();
  private routeShortNames = new Map<string, string>();

  public async load(): Promise<void> {
    const routesFile = await this.readRoutesFile();
    const lines = routesFile.split(/\r?\n/).filter((line) => line.length > 0);

    if (lines.length === 0) {
      this.routeNames = new Map();
      this.routeShortNames = new Map();
      console.info("[static-cache] loaded 0 routes");
      return;
    }

    const headerLine = lines[0];
    if (headerLine === undefined) {
      this.routeNames = new Map();
      this.routeShortNames = new Map();
      console.info("[static-cache] loaded 0 routes");
      return;
    }

    const dataLines = lines.slice(1);
    const headers = this.parseCsvLine(headerLine);
    const routeIdIndex = headers.indexOf("route_id");
    const routeLongNameIndex = headers.indexOf("route_long_name");
    const routeShortNameIndex = headers.indexOf("route_short_name");
    const routeNames = new Map<string, string>();
    const routeShortNames = new Map<string, string>();

    for (const line of dataLines) {
      const fields = this.parseCsvLine(line);
      const routeId = fields[routeIdIndex] ?? "";
      const routeLongName = fields[routeLongNameIndex] ?? "";
      const routeShortName = fields[routeShortNameIndex] ?? "";

      if (routeId.length === 0) {
        continue;
      }

      routeNames.set(
        routeId,
        routeLongName.length > 0 ? routeLongName : routeShortName
      );
      routeShortNames.set(routeId, routeShortName);
    }

    this.routeNames = routeNames;
    this.routeShortNames = routeShortNames;

    console.info(`[static-cache] loaded ${routeNames.size} routes`);
  }

  public getRouteName(routeId: string): string {
    return this.routeNames.get(routeId) ?? "";
  }

  public getRouteShortName(routeId: string): string {
    return this.routeShortNames.get(routeId) ?? "";
  }

  private async readRoutesFile(): Promise<string> {
    for (const filePath of ROUTES_FILE_PATHS) {
      try {
        return await readFile(filePath, "utf8");
      } catch {}
    }

    throw new Error("Unable to load GTFS routes.txt");
  }

  private parseCsvLine(line: string): string[] {
    const values: string[] = [];
    let current = "";
    let insideQuotes = false;

    for (let index = 0; index < line.length; index += 1) {
      const char = line[index];

      if (char === '"') {
        if (insideQuotes && line[index + 1] === '"') {
          current += '"';
          index += 1;
          continue;
        }

        insideQuotes = !insideQuotes;
        continue;
      }

      if (char === "," && !insideQuotes) {
        values.push(current);
        current = "";
        continue;
      }

      current += char;
    }

    values.push(current);

    return values;
  }
}

export const gtfsStaticCache = new GtfsStaticCache();
