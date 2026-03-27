import { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Search, Navigation, X } from 'lucide-react';

// Pin icon for selected location
const pinIcon = L.divIcon({
  className: 'custom-pin',
  html: `<div style="
    width: 20px; height: 20px; border-radius: 50% 50% 50% 0;
    background: #5E6AD2; border: 2.5px solid white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.4);
    transform: rotate(-45deg);
  "></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 20],
  popupAnchor: [0, -20],
});

// Default center: Carmo do Paranaiba, MG
const DEFAULT_CENTER = [-19.0, -46.3];
const DEFAULT_ZOOM = 13;

// Click handler component
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Fly-to component
function FlyTo({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom || 15, { duration: 1 });
    }
  }, [center, zoom, map]);
  return null;
}

// Nominatim search with debounce
async function searchAddress(query) {
  if (!query || query.length < 3) return [];
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=br&limit=5`,
      { headers: { 'User-Agent': 'FuelTrack/1.0' } }
    );
    return await res.json();
  } catch {
    return [];
  }
}

export function LocationPicker({ latitude, longitude, onChange, label, compact = false }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [flyTarget, setFlyTarget] = useState(null);
  const searchTimeout = useRef(null);
  const searchRef = useRef(null);

  const hasLocation = latitude != null && longitude != null;
  const center = hasLocation ? [latitude, longitude] : DEFAULT_CENTER;
  const zoom = hasLocation ? 15 : DEFAULT_ZOOM;

  // Close search dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearch(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLocationSelect = useCallback((lat, lng) => {
    onChange({ latitude: Math.round(lat * 1000000) / 1000000, longitude: Math.round(lng * 1000000) / 1000000 });
    setFlyTarget([lat, lng]);
    setShowSearch(false);
    setSearchResults([]);
  }, [onChange]);

  const handleSearch = useCallback((value) => {
    setSearchQuery(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (value.length < 3) {
      setSearchResults([]);
      return;
    }
    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      const results = await searchAddress(value);
      setSearchResults(results);
      setSearching(false);
      setShowSearch(true);
    }, 600);
  }, []);

  const handleSearchSelect = useCallback((result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    handleLocationSelect(lat, lng);
    setSearchQuery(result.display_name.split(',').slice(0, 2).join(','));
  }, [handleLocationSelect]);

  const handleGPS = useCallback(() => {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        handleLocationSelect(pos.coords.latitude, pos.coords.longitude);
        setGpsLoading(false);
      },
      () => {
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [handleLocationSelect]);

  const handleClear = useCallback(() => {
    onChange({ latitude: null, longitude: null });
    setSearchQuery('');
    setFlyTarget(null);
  }, [onChange]);

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-[var(--color-text-secondary)]">
          <MapPin className="inline h-3.5 w-3.5 mr-1" />
          {label}
        </label>
      )}

      {/* Search bar + GPS button */}
      <div className="flex gap-2" ref={searchRef}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-tertiary)]" />
          <input
            type="text"
            placeholder="Buscar endereco ou cidade..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => searchResults.length > 0 && setShowSearch(true)}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] pl-9 pr-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
          />
          {searching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-primary)]" />
            </div>
          )}

          {/* Search results dropdown */}
          {showSearch && searchResults.length > 0 && (
            <div className="absolute z-[2000] mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] shadow-xl max-h-48 overflow-y-auto">
              {searchResults.map((r, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSearchSelect(r)}
                  className="w-full px-3 py-2 text-left text-sm text-[var(--color-text)] hover:bg-[var(--color-bg-hover)] border-b border-[var(--color-border)] last:border-0"
                >
                  <span className="line-clamp-2">{r.display_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleGPS}
          disabled={gpsLoading}
          className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text)] disabled:opacity-50 transition-colors"
          title="Usar localizacao GPS"
        >
          <Navigation className={`h-4 w-4 ${gpsLoading ? 'animate-pulse' : ''}`} />
          <span className="hidden sm:inline">GPS</span>
        </button>

        {hasLocation && (
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-2.5 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
            title="Limpar localizacao"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Map */}
      <div className={`rounded-xl overflow-hidden border border-[var(--color-border)] ${compact ? 'h-[200px]' : 'h-[280px]'}`}>
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onLocationSelect={handleLocationSelect} />
          {flyTarget && <FlyTo center={flyTarget} zoom={15} />}
          {hasLocation && (
            <Marker position={[latitude, longitude]} icon={pinIcon} />
          )}
        </MapContainer>
      </div>

      {/* Coordinates display */}
      {hasLocation && (
        <p className="text-xs text-[var(--color-text-tertiary)] tabular-nums">
          {latitude.toFixed(6)}, {longitude.toFixed(6)}
        </p>
      )}

      {!hasLocation && (
        <p className="text-xs text-[var(--color-text-tertiary)]">
          Clique no mapa, busque um endereco ou use o GPS para marcar a localizacao
        </p>
      )}
    </div>
  );
}
