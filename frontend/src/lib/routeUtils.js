// OSRM route fetching with cache

const ROUTE_CACHE_KEY = 'fueltrack_routecache';

function getRouteCache() {
  try {
    return JSON.parse(sessionStorage.getItem(ROUTE_CACHE_KEY) || '{}');
  } catch { return {}; }
}

function setRouteCache(cache) {
  try {
    // Limit cache to 50 entries
    const keys = Object.keys(cache);
    if (keys.length > 50) {
      keys.slice(0, keys.length - 50).forEach(k => delete cache[k]);
    }
    sessionStorage.setItem(ROUTE_CACHE_KEY, JSON.stringify(cache));
  } catch {}
}

function cacheKey(oLat, oLng, dLat, dLng) {
  return `${oLat.toFixed(4)}_${oLng.toFixed(4)}_${dLat.toFixed(4)}_${dLng.toFixed(4)}`;
}

// Rate limiting: queue OSRM requests (1 per second for demo server)
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

    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${oLng},${oLat};${dLng},${dLat}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.code === 'Ok' && data.routes?.[0]) {
        const route = {
          // GeoJSON comes as [lng, lat], Leaflet needs [lat, lng]
          coordinates: data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]),
          distance_km: Math.round(data.routes[0].distance / 100) / 10, // meters -> km (1 decimal)
          duration_min: Math.round(data.routes[0].duration / 60), // seconds -> minutes
        };
        cache[key] = route;
        setRouteCache(cache);
        resolve(route);
      } else {
        resolve(null);
      }
    } catch {
      resolve(null);
    }

    // Rate limit: 1 req/sec
    await new Promise(r => setTimeout(r, 1100));
  }
  routeRunning = false;
}

export function fetchRoute(oLat, oLng, dLat, dLng) {
  if (!oLat || !oLng || !dLat || !dLng) return Promise.resolve(null);

  // Check cache first (sync)
  const key = cacheKey(oLat, oLng, dLat, dLng);
  const cache = getRouteCache();
  if (cache[key]) return Promise.resolve(cache[key]);

  return new Promise(resolve => {
    routeQueue.push({ oLat, oLng, dLat, dLng, resolve });
    processRouteQueue();
  });
}
