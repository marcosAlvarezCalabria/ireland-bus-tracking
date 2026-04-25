export interface Stop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  routes: string;
  distance: number;
}

export interface StopRepository {
  findAll(): Promise<Stop[]>;
  findNearby(
    lat: number,
    lng: number,
    radiusMeters: number
  ): Promise<Stop[]>;
  findInBounds(
    minLat: number,
    maxLat: number,
    minLng: number,
    maxLng: number
  ): Promise<Stop[]>;
}
