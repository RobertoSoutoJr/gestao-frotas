// Route fetching with cache — Valhalla (primary) + OSRM (fallback)
// Both are free, no API key required

const ROUTE_CACHE_KEY = 'fueltrack_routecache_v3';

function getRouteCache() {
  try {
    return JSON.parse(sessionStorage.getItem(ROUTE_CACHE_KEY) || '{}');
  } catch { return {}; }
}

function setRouteCache(cache) {
  try {
    const keys = Object.keys(cache);
    if (keys.length > 100) {
      keys.slice(0, keys.length - 100).forEach(k => delete cache[k]);
    }
    sessionStorage.setItem(ROUTE_CACHE_KEY, JSON.stringify(cache));
  } catch {}
}

function cacheKey(oLat, oLng, dLat, dLng) {
  return `${oLat.toFixed(4)}_${oLng.toFixed(4)}_${dLat.toFixed(4)}_${dLng.toFixed(4)}`;
}

// Decode Google encoded polyline → [[lat, lng], ...]
function decodePolyline(encoded) {
  const points = [];
  let index = 0, lat = 0, lng = 0;

  while (index < encoded.length) {
    let shift = 0, result = 0, byte;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lat += (result & 1) ? ~(result >> 1) : (result >> 1);

    shift = 0; result = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lng += (result & 1) ? ~(result >> 1) : (result >> 1);

    points.push([lat / 1e6, lng / 1e6]);
  }
  return points;
}

// Sequential queue to respect rate limits
const routeQueue = [];
let routeRunning = false;

async function processRouteQueue() {
  if (routeRunning) return;
  routeRunning = true;

  while (routeQueue.length > 0) {
    const { oLat, oLng, dLat, dLng, resolve } = routeQueue.shift();
    const key = cacheKey(oLat, oLng, dLat, dLng);
    const cache = getRouteCache();

    if (cache[key]) {
      resolve(cache[key]);
      continue;
    }

    let route = null;

    // 1) Valhalla (OpenStreetMap hosted) — most reliable free option
    try {
      route = await fetchFromValhalla(oLat, oLng, dLat, dLng);
    } catch (e) {
      console.warn('Valhalla failed:', e.message);
    }

    // 2) Fallback: OSRM demo server
    if (!route) {
      try {
        route = await fetchFromOSRM(oLat, oLng, dLat, dLng);
      } catch (e) {
        console.warn('OSRM failed:', e.message);
      }
    }

    if (route) {
      cache[key] = route;
      setRouteCache(cache);
    }

    resolve(route);
    await new Promise(r => setTimeout(r, 400));
  }

  routeRunning = false;
}

// Valhalla — free, no API key, reliable, hosted by OSM
async function fetchFromValhalla(oLat, oLng, dLat, dLng) {
  const params = JSON.stringify({
    locations: [
      { lat: oLat, lon: oLng },
      { lat: dLat, lon: dLng }
    ],
    costing: 'truck',
    directions_options: { units: 'kilometers' }
  });

  const url = `https://valhalla1.openstreetmap.de/route?json=${encodeURIComponent(params)}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`Valhalla ${res.status}`);
    const data = await res.json();

    const trip = data.trip;
    if (!trip || !trip.legs?.[0]?.shape) return null;

    const coordinates = decodePolyline(trip.legs[0].shape);

    return {
      coordinates,
      distance_km: Math.round(trip.summary.length * 10) / 10,
      duration_min: Math.round(trip.summary.time / 60),
    };
  } catch (e) {
    clearTimeout(timeout);
    throw e;
  }
}

// OSRM demo server — free, sometimes slow/down
async function fetchFromOSRM(oLat, oLng, dLat, dLng) {
  const url = `https://router.project-osrm.org/route/v1/driving/${oLng},${oLat};${dLng},${dLat}?overview=full&geometries=geojson`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`OSRM ${res.status}`);
    const data = await res.json();

    if (data.code !== 'Ok' || !data.routes?.[0]) return null;

    return {
      coordinates: data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]),
      distance_km: Math.round(data.routes[0].distance / 100) / 10,
      duration_min: Math.round(data.routes[0].duration / 60),
    };
  } catch (e) {
    clearTimeout(timeout);
    throw e;
  }
}

export function fetchRoute(oLat, oLng, dLat, dLng) {
  if (!oLat || !oLng || !dLat || !dLng) return Promise.resolve(null);

  const key = cacheKey(oLat, oLng, dLat, dLng);
  const cache = getRouteCache();
  if (cache[key]) return Promise.resolve(cache[key]);

  return new Promise(resolve => {
    routeQueue.push({ oLat, oLng, dLat, dLng, resolve });
    processRouteQueue();
  });
}
