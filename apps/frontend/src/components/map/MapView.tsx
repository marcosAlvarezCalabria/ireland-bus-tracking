import L from "leaflet";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
import { CircleMarker, MapContainer, Marker, TileLayer, Tooltip } from "react-leaflet";

import type { Stop } from "../../types";

delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

interface MapViewProps {
  userLocation: {
    lat: number;
    lng: number;
  };
  stops: Stop[];
  selectedStopId: string | null;
  onSelectStop: (stop: Stop) => void;
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
