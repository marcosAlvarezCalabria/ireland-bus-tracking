import L from "leaflet";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
import { useEffect } from "react";
import {
  CircleMarker,
  MapContainer,
  Marker,
  TileLayer,
  Tooltip,
  useMap
} from "react-leaflet";

import type { Stop } from "../../types";

delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

const stopMarkerIcon = L.divIcon({
  className: "",
  html: '<span style="display:block;width:18px;height:18px;border-radius:9999px;background:#78aa36;border:3px solid #ffffff;box-shadow:0 2px 8px rgba(0,0,0,0.35);"></span>',
  iconAnchor: [9, 9],
  iconSize: [18, 18]
});

interface MapViewProps {
  userLocation: {
    lat: number;
    lng: number;
  };
  stops: Stop[];
  selectedStopId: string | null;
  onSelectStop: (stop: Stop) => void;
}

function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();

  useEffect(() => {
    map.setView([lat, lng], 15);
  }, [lat, lng, map]);

  return null;
}

export function MapView({
  userLocation,
  stops,
  selectedStopId,
  onSelectStop
}: MapViewProps) {
  return (
    <MapContainer
      center={[userLocation.lat, userLocation.lng]}
      zoom={15}
      className="h-full min-h-[360px] w-full"
    >
      <RecenterMap lat={userLocation.lat} lng={userLocation.lng} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <CircleMarker
        center={[userLocation.lat, userLocation.lng]}
        pathOptions={{ color: "#2563eb", fillColor: "#2563eb", fillOpacity: 0.85 }}
        radius={8}
      >
        <Tooltip>You are here</Tooltip>
      </CircleMarker>
      {stops.map((stop) => (
        <Marker
          eventHandlers={{
            click: () => onSelectStop(stop)
          }}
          icon={stopMarkerIcon}
          key={stop.id}
          opacity={selectedStopId === stop.id ? 1 : 0.85}
          position={[stop.lat, stop.lng]}
        >
          <Tooltip>{stop.name}</Tooltip>
        </Marker>
      ))}
    </MapContainer>
  );
}
