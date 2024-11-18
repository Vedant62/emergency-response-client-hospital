import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { AmbulanceData } from '@/app/types/emergency';
import { useMemo, useState, useCallback } from 'react';

interface AmbulanceMapProps {
  ambulance: AmbulanceData;
  containerStyle?: {
    width: string;
    height: string;
  };
}

const defaultContainerStyle = {
  width: '100%',
  height: '100%'
};

export function AmbulanceMap({ ambulance, containerStyle = defaultContainerStyle }: AmbulanceMapProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  });

  const center = useMemo(() => ({
    lat: ambulance.location.lat,
    lng: ambulance.location.lng
  }), [ambulance.location]);

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markerIcon, setMarkerIcon] = useState<google.maps.Icon | null>(null);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
    setMarkerIcon({
      url: '/ambulance-icon.png',
      scaledSize: new google.maps.Size(32, 32)
    });
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
    setMarkerIcon(null);
  }, []);

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={15}
      onLoad={onLoad}
      onUnmount={onUnmount}
    >
      {markerIcon && (
        <Marker
          position={center}
          icon={markerIcon}
        />
      )}
    </GoogleMap>
  );
} 