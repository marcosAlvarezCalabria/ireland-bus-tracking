export interface Vehicle {
  id: string;
  lat: number;
  lng: number;
  routeId: string;
  tripId: string;
  bearing: number;
  routeName: string;
  nextStop: string;
}
