import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchRoute } from '../../lib/routeUtils';
import { geocodeCity } from './MapView';
import { Loader2, MapPin, Navigation2, Clock, Ruler } from 'lucide-react';

// Colored marker icons
function createIcon(color, size = 16) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: ${size}px; height: ${size}px; border-radius: 50%;
      background: ${color}; border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 4)],
  });
}

const ORIGIN_ICON = createIcon('#F59E0B', 18);
const DEST_ICON = createIcon('#3B82F6', 18);

// Auto-fit bounds
function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 13);
    } else {
      const bounds = L.latLngBounds(points.map(p => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [points, map]);
  return null;
}

export function TripMapDetail({ trip }) {
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    setLoading(true);
    setError('');
    setRoute(null);

    async function resolve() {
      // Resolve origin coordinates
      let oLat = trip.origem_lat, oLng = trip.origem_lng;
      if (!oLat && trip.origem_cidade) {
        const coords = await geocodeCity(trip.origem_cidade, trip.origem_estado);
        if (coords) { oLat = coords.lat; oLng = coords.lng; }
      }

      if (!oLat) {
        if (mountedRef.current) {
          setError('Sem coordenadas de origem — cadastre a cidade do fornecedor');
          setLoading(false);
        }
        return;
      }

      if (mountedRef.current) setOrigin({ lat: oLat, lng: oLng });

      // Resolve destination coordinates
      let dLat = trip.destino_lat, dLng = trip.destino_lng;
      if (!dLat && trip.destino_cidade) {
        const coords = await geocodeCity(trip.destino_cidade, trip.destino_estado);
        if (coords) { dLat = coords.lat; dLng = coords.lng; }
      }

      if (dLat && mountedRef.current) {
        setDestination({ lat: dLat, lng: dLng });

        // Fetch real route
        const routeData = await fetchRoute(oLat, oLng, dLat, dLng);
        if (routeData && mountedRef.current) {
          setRoute(routeData);
        }
      }

      if (mountedRef.current) setLoading(false);
    }

    resolve();
  }, [trip.id]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-8 text-sm text-[var(--color-text-secondary)]">
        <Loader2 className="h-4 w-4 animate-spin" />
        Carregando mapa...
      </div>
    );
  }

  // No coordinates available
  if (error || !origin) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] py-6 text-xs text-[var(--color-text-tertiary)]">
        <MapPin className="h-4 w-4" />
        {error || 'Localização não disponível'}
      </div>
    );
  }

  const points = [origin];
  if (destination) points.push(destination);

  const originLabel = trip.fornecedores?.nome || trip.origem_cidade || 'Origem';
  const destLabel = trip.clientes?.nome || trip.destino_cidade || 'Destino';

  return (
    <div className="space-y-2">
      {/* Route info badges */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-400">
          <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
          {originLabel}
        </span>
        {destination && (
          <>
            <Navigation2 className="h-3 w-3 text-[var(--color-text-tertiary)] rotate-90" />
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-1 text-[11px] font-medium text-blue-400">
              <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
              {destLabel}
            </span>
          </>
        )}
        {route && (
          <>
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] px-2.5 py-1 text-[11px] text-[var(--color-text-secondary)]">
              <Ruler className="h-3 w-3" />
              {route.distance_km} km
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] px-2.5 py-1 text-[11px] text-[var(--color-text-secondary)]">
              <Clock className="h-3 w-3" />
              {route.duration_min >= 60
                ? `${Math.floor(route.duration_min / 60)}h${route.duration_min % 60 > 0 ? ` ${route.duration_min % 60}min` : ''}`
                : `${route.duration_min} min`
              }
            </span>
          </>
        )}
      </div>

      {/* Map */}
      <div className="relative rounded-xl overflow-hidden border border-[var(--color-border)]" style={{ height: '280px' }}>
        <MapContainer
          center={[origin.lat, origin.lng]}
          zoom={10}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitBounds points={points} />

          {/* Origin marker */}
          <Marker position={[origin.lat, origin.lng]} icon={ORIGIN_ICON}>
            <Popup>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px' }}>
                <strong style={{ color: '#F59E0B' }}>Origem</strong><br />
                {originLabel}
                {trip.origem_cidade && <><br /><span style={{ color: '#888' }}>{trip.origem_cidade}{trip.origem_estado ? `/${trip.origem_estado}` : ''}</span></>}
              </div>
            </Popup>
          </Marker>

          {/* Destination marker */}
          {destination && (
            <Marker position={[destination.lat, destination.lng]} icon={DEST_ICON}>
              <Popup>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px' }}>
                  <strong style={{ color: '#3B82F6' }}>Destino</strong><br />
                  {destLabel}
                  {trip.destino_cidade && <><br /><span style={{ color: '#888' }}>{trip.destino_cidade}{trip.destino_estado ? `/${trip.destino_estado}` : ''}</span></>}
                  {route && <><br /><span style={{ color: '#5E6AD2' }}>{route.distance_km} km — {route.duration_min} min</span></>}
                </div>
              </Popup>
            </Marker>
          )}

          {/* Route line */}
          {destination && (
            <Polyline
              positions={
                route
                  ? route.coordinates
                  : [[origin.lat, origin.lng], [destination.lat, destination.lng]]
              }
              color={route ? '#5E6AD2' : '#6B7280'}
              weight={route ? 4 : 2}
              opacity={0.85}
              dashArray={route ? '' : '8 4'}
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
}
