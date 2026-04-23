import { useEffect, useState } from "react";

const GALWAY_CENTER = { lat: 53.2743, lng: -9.0491 };

interface GeolocationState {
  lat: number;
  lng: number;
  error: string | null;
  loading: boolean;
}

export function useGeolocation(): GeolocationState {
  const [state, setState] = useState<GeolocationState>({
    ...GALWAY_CENTER,
    error: null,
    loading: true
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({
        ...GALWAY_CENTER,
        error: "Geolocation is not supported",
        loading: false
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          error: null,
          loading: false
        });
      },
      (error) => {
        setState({
          ...GALWAY_CENTER,
          error: error.message,
          loading: false
        });
      }
    );
  }, []);

  return state;
}
