// Offline queue for GPS locations captured without internet
// Stores in localStorage, auto-syncs when back online

const QUEUE_KEY = 'fueltrack_offline_queue';

function getQueue() {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
  } catch { return []; }
}

function saveQueue(queue) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

// Add a location capture to the offline queue
export function queueLocationCapture({ type, tripId, lat, lng }) {
  const queue = getQueue();
  queue.push({
    type,       // 'trip_origin' | 'trip_destination'
    tripId,
    lat,
    lng,
    timestamp: new Date().toISOString(),
    synced: false,
  });
  saveQueue(queue);
  return queue.length;
}

// Get pending (unsynced) items
export function getPendingItems() {
  return getQueue().filter(item => !item.synced);
}

// Get total pending count
export function getPendingCount() {
  return getPendingItems().length;
}

// Sync all pending items with the server
export async function syncOfflineQueue(apiBase) {
  const queue = getQueue();
  const pending = queue.filter(item => !item.synced && item.tripId);
  if (pending.length === 0) return { synced: 0, failed: 0 };

  const token = localStorage.getItem('accessToken');
  if (!token) return { synced: 0, failed: pending.length };

  let synced = 0;
  let failed = 0;

  for (const item of pending) {
    try {
      const field = item.type === 'trip_origin' ? 'origem' : 'destino';
      const res = await fetch(`${apiBase}/${item.tripId}/location`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          field,
          lat: item.lat,
          lng: item.lng,
        }),
      });

      if (res.ok) {
        item.synced = true;
        synced++;
      } else {
        failed++;
      }
    } catch {
      failed++;
    }
  }

  saveQueue(queue);

  // Clean up synced items older than 24h
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  const cleaned = queue.filter(item =>
    !item.synced || new Date(item.timestamp).getTime() > cutoff
  );
  saveQueue(cleaned);

  return { synced, failed };
}

// Remove items for a specific trip (e.g., when trip is deleted)
export function clearTripQueue(tripId) {
  const queue = getQueue().filter(item => item.tripId !== tripId);
  saveQueue(queue);
}

// Setup auto-sync listener
let syncListenerActive = false;

export function setupAutoSync(apiBase) {
  if (syncListenerActive) return;
  syncListenerActive = true;

  window.addEventListener('online', async () => {
    const pending = getPendingCount();
    if (pending > 0) {
      const result = await syncOfflineQueue(apiBase);
      if (result.synced > 0) {
        // Dispatch custom event so UI can react
        window.dispatchEvent(new CustomEvent('offlineSync', { detail: result }));
      }
    }
  });
}
