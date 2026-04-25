import type { Arrival, Stop } from "../types";

const API_URL = import.meta.env.VITE_API_URL;

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function getNearbyStops(
  lat: number,
  lng: number,
  radius = 500
): Promise<Stop[]> {
  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
    radius: String(radius)
  });

  return fetchJson<Stop[]>(`${API_URL}/stops?${params.toString()}`);
}

export async function getStops(): Promise<Stop[]> {
  return fetchJson<Stop[]>(`${API_URL}/stops`);
}

export async function getStopsInBounds(
  minLat: number,
  maxLat: number,
  minLng: number,
  maxLng: number
): Promise<Stop[]> {
  const params = new URLSearchParams({
    minLat: String(minLat),
    maxLat: String(maxLat),
    minLng: String(minLng),
    maxLng: String(maxLng)
  });

  return fetchJson<Stop[]>(`${API_URL}/stops?${params.toString()}`);
}

export async function getArrivals(stopId: string): Promise<Arrival[]> {
  return fetchJson<Arrival[]>(
    `${API_URL}/arrivals/${encodeURIComponent(stopId)}`
  );
}

export interface Vehicle {
  id: string;
  lat: number;
  lng: number;
  routeId: string;
  tripId: string;
  bearing: number;
  routeName: string;
  routeShortName: string;
  nextStop: string;
}

export async function getVehicles(): Promise<Vehicle[]> {
  return fetchJson<Vehicle[]>(`${API_URL}/vehicles`);
}
