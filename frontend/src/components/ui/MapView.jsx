import { useEffect, useRef, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchRoute } from '../../lib/routeUtils';

// Fix default marker icons (leaflet + bundler issue)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom colored markers
function createColoredIcon(color) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 14px; height: 14px; border-radius: 50%;
      background: ${color}; border: 2.5px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.35);
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -10],
  });
}

const ICONS = {
  origin: createColoredIcon('#5E6AD2'),
  destination: createColoredIcon('#10B981'),
  active: createColoredIcon('#F59E0B'),
  finalized: createColoredIcon('#6B7280'),
};

// Geocoding cache (persisted in sessionStorage) — fallback for old data without coords
const GEO_CACHE_KEY = 'fueltrack_geocache';

function getGeoCache() {
  try {
    return JSON.parse(sessionStorage.getItem(GEO_CACHE_KEY) || '{}');
  } catch { return {}; }
}

function setGeoCache(cache) {
  try { sessionStorage.setItem(GEO_CACHE_KEY, JSON.stringify(cache)); } catch {}
}

// Nominatim geocoding with rate limiting (fallback only)
const geocodeQueue = [];
let geocodeRunning = false;

async function processGeoQueue() {
  if (geocodeRunning) return;
  geocodeRunning = true;
  while (geocodeQueue.length > 0) {
    const { query, resolve } = geocodeQueue.shift();
    const cache = getGeoCache();
    if (cache[query]) { resolve(cache[query]); continue; }
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=br&limit=1`,
        { headers: { 'User-Agent': 'FuelTrack/1.0' } }
      );
      const data = await res.json();
      if (data.length > 0) {
        const coords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        cache[query] = coords;
        setGeoCache(cache);
        resolve(coords);
      } else {
        resolve(null);
      }
    } catch {
      resolve(null);
    }
    await new Promise(r => setTimeout(r, 1100));
  }
  geocodeRunning = false;
}

export function geocodeCity(cidade, estado) {
  if (!cidade) return Promise.resolve(null);
  const query = estado ? `${cidade}, ${estado}, Brasil` : `${cidade}, Brasil`;
  return new Promise(resolve => {
    geocodeQueue.push({ query, resolve });
    processGeoQueue();
  });
}

// Auto-fit bounds component
function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    const bounds = L.latLngBounds(points.map(p => [p.lat, p.lng]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
  }, [points, map]);
  return null;
}

// Main MapView component
export function MapView({ trips = [], height = '400px', className = '', onTripClick }) {
  const [geoTrips, setGeoTrips] = useState([]);
  const [routeData, setRouteData] = useState({});
  const [loading, setLoading] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // Resolve coordinates: use direct lat/lng first, fallback to geocoding
  useEffect(() => {
    if (trips.length === 0) { setGeoTrips([]); return; }
    setLoading(true);

    async function resolve() {
      const results = [];
      for (const trip of trips) {
        let oLat = trip.origem_lat, oLng = trip.origem_lng;
        let dLat = trip.destino_lat, dLng = trip.destino_lng;

        // Fallback: geocode by city if no direct coords
        if (!oLat && trip.origem_cidade) {
          const coords = await geocodeCity(trip.origem_cidade, trip.origem_estado);
          if (coords) { oLat = coords.lat; oLng = coords.lng; }
        }

        if (!dLat && trip.destino_cidade) {
          const coords = await geocodeCity(trip.destino_cidade, trip.destino_estado);
          if (coords) { dLat = coords.lat; dLng = coords.lng; }
        }

        if (oLat && dLat) {
          results.push({
            ...trip,
            origem_lat: oLat, origem_lng: oLng,
            destino_lat: dLat, destino_lng: dLng,
          });
        }
      }
      if (mountedRef.current) {
        setGeoTrips(results);
        setLoading(false);
      }
    }

    resolve();
  }, [trips]);

  // Fetch real routes via OSRM for resolved trips
  useEffect(() => {
    if (geoTrips.length === 0) return;

    async function fetchRoutes() {
      const routes = {};
      for (const trip of geoTrips) {
        const route = await fetchRoute(
          trip.origem_lat, trip.origem_lng,
          trip.destino_lat, trip.destino_lng
        );
        if (route && mountedRef.current) {
          routes[trip.id] = route;
        }
      }
      if (mountedRef.current) {
        setRouteData(prev => ({ ...prev, ...routes }));
      }
    }

    fetchRoutes();
  }, [geoTrips]);

  const allPoints = useMemo(() => {
    const pts = [];
    geoTrips.forEach(t => {
      if (t.origem_lat) pts.push({ lat: t.origem_lat, lng: t.origem_lng });
      if (t.destino_lat) pts.push({ lat: t.destino_lat, lng: t.destino_lng });
    });
    return pts;
  }, [geoTrips]);

  // Default center: Brazil
  const center = allPoints.length > 0
    ? [allPoints[0].lat, allPoints[0].lng]
    : [-15.78, -47.93];

  return (
    <div className={`relative rounded-xl overflow-hidden border border-[var(--color-border)] ${className}`} style={{ height }}>
      {loading && (
        <div className="absolute top-3 right-3 z-[1000] bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg px-3 py-1.5 text-xs text-[var(--color-text-secondary)] shadow-lg">
          Carregando rotas...
        </div>
      )}
      <MapContainer
        center={center}
        zoom={5}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; Google Maps'
          url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
          maxZoom={20}
        />
        <FitBounds points={allPoints} />

        {geoTrips.map(trip => {
          const isActive = trip.status !== 'finalizada';
          const lineColor = isActive ? '#F59E0B' : '#6B7280';
          const route = routeData[trip.id];

          return (
            <div key={trip.id}>
              {/* Origin marker */}
              <Marker
                position={[trip.origem_lat, trip.origem_lng]}
                icon={isActive ? ICONS.active : ICONS.origin}
              >
                <Popup>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', lineHeight: 1.5 }}>
                    <strong>Origem</strong><br />
                    {trip.origem_cidade}{trip.origem_estado ? `/${trip.origem_estado}` : ''}<br />
                    <span style={{ color: '#666' }}>Viagem #{trip.id}</span>
                    {route && (
                      <><br /><span style={{ color: '#5E6AD2' }}>{route.distance_km} km - {route.duration_min} min</span></>
                    )}
                    {onTripClick && (
                      <><br /><a href="#" onClick={(e) => { e.preventDefault(); onTripClick(trip); }} style={{ color: '#5E6AD2' }}>Ver detalhes</a></>
                    )}
                  </div>
                </Popup>
              </Marker>

              {/* Destination marker */}
              <Marker
                position={[trip.destino_lat, trip.destino_lng]}
                icon={isActive ? ICONS.active : ICONS.destination}
              >
                <Popup>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', lineHeight: 1.5 }}>
                    <strong>Destino</strong><br />
                    {trip.destino_cidade}{trip.destino_estado ? `/${trip.destino_estado}` : ''}<br />
                    <span style={{ color: '#666' }}>Viagem #{trip.id}</span>
                    {route && (
                      <><br /><span style={{ color: '#10B981' }}>{route.distance_km} km - {route.duration_min} min</span></>
                    )}
                  </div>
                </Popup>
              </Marker>

              {/* Route line: real OSRM route or fallback straight line */}
              <Polyline
                positions={
                  route
                    ? route.coordinates
                    : [[trip.origem_lat, trip.origem_lng], [trip.destino_lat, trip.destino_lng]]
                }
                color={lineColor}
                weight={isActive ? 3 : 2}
                opacity={isActive ? 0.9 : 0.5}
                dashArray={route ? '' : '8 4'}
              />
            </div>
          );
        })}
      </MapContainer>

      {/* Legend */}
      {geoTrips.length > 0 && (
        <div className="absolute bottom-3 left-3 z-[1000] bg-[var(--color-bg-elevated)]/95 backdrop-blur-sm border border-[var(--color-border)] rounded-lg px-3 py-2 text-[10px] space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
            <span className="text-[var(--color-text-secondary)]">Viagem ativa</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#5E6AD2]" />
            <span className="text-[var(--color-text-secondary)]">Origem</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#10B981]" />
            <span className="text-[var(--color-text-secondary)]">Destino</span>
          </div>
          <div className="flex items-center gap-2 mt-1 pt-1 border-t border-[var(--color-border)]">
            <span className="inline-block w-4 h-0.5 bg-[var(--color-text-secondary)]" />
            <span className="text-[var(--color-text-secondary)]">Rota real</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-4 h-0.5 bg-[var(--color-text-secondary)]" style={{ borderTop: '2px dashed var(--color-text-tertiary)' }} />
            <span className="text-[var(--color-text-secondary)]">Linha reta (sem rota)</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Lightweight mini map for dashboard
export function MiniMapView({ trips = [], height = '250px', className = '' }) {
  const activeTrips = useMemo(() =>
    trips.filter(t => t.status !== 'finalizada' && (t.origem_cidade || t.origem_lat)),
    [trips]
  );

  if (activeTrips.length === 0) return null;

  return <MapView trips={activeTrips} height={height} className={className} />;
}
