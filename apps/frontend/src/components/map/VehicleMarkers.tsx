import L from "leaflet";
import { Marker, Tooltip } from "react-leaflet";

import type { Vehicle } from "../../services/api";

interface VehicleMarkersProps {
  vehicles: Vehicle[];
}

function createVehicleIcon(vehicle: Vehicle): L.DivIcon {
  return L.divIcon({
    className: "",
    html: `
      <div style="width:36px;height:36px;transform:rotate(${vehicle.bearing}deg);display:flex;align-items:center;justify-content:center;">
        <svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Bus ${vehicle.routeId}">
          <rect x="4" y="6" width="28" height="24" rx="8" fill="#166534" />
          <path d="M18 3 L22 11 H14 Z" fill="#FFFFFF" />
          <text x="18" y="21" text-anchor="middle" dominant-baseline="middle" font-size="10" font-family="Arial, sans-serif" font-weight="700" fill="#FFFFFF" transform="rotate(${-vehicle.bearing} 18 18)">${vehicle.routeShortName}</text>
        </svg>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18]
  });
}

export function VehicleMarkers({ vehicles }: VehicleMarkersProps) {
  return (
    <>
      {vehicles.map((vehicle) => (
        <Marker
          icon={createVehicleIcon(vehicle)}
          key={vehicle.id}
          position={[vehicle.lat, vehicle.lng]}
        >
          <Tooltip>{vehicle.routeId}</Tooltip>
        </Marker>
      ))}
    </>
  );
}
