export interface Stop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  distance: number;
}

export interface StopRepository {
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
