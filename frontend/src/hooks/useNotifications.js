import { useEffect, useRef } from 'react';

const NOTIFIED_KEY = 'fueltrack_notified_alerts';

function getNotifiedIds() {
  try {
    return JSON.parse(localStorage.getItem(NOTIFIED_KEY) || '[]');
  } catch { return []; }
}

function setNotifiedIds(ids) {
  // Keep last 100 to avoid bloating
  localStorage.setItem(NOTIFIED_KEY, JSON.stringify(ids.slice(-100)));
}

/**
 * Sends browser notifications for critical alerts.
 * Only notifies once per alert (tracked by id in localStorage).
 * Asks for permission on first critical alert.
 */
export function useNotifications(alerts) {
  const hasRequested = useRef(false);

  useEffect(() => {
    if (!alerts || alerts.length === 0) return;
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return;

    const criticals = alerts.filter(a => a.level === 'critical');
    if (criticals.length === 0) return;

    const notified = getNotifiedIds();
    const newAlerts = criticals.filter(a => !notified.includes(a.id));
    if (newAlerts.length === 0) return;

    // Request permission if not yet granted
    if (Notification.permission === 'default' && !hasRequested.current) {
      hasRequested.current = true;
      Notification.requestPermission();
      return; // Will notify on next render after permission is granted
    }

    if (Notification.permission !== 'granted') return;

    // Send via service worker for better reliability
    navigator.serviceWorker.ready.then(registration => {
      newAlerts.forEach(alert => {
        registration.active?.postMessage({
          type: 'SHOW_NOTIFICATION',
          title: 'FuelTrack — Alerta Critico',
          body: `${alert.title}\n${alert.detail}`,
          tag: alert.id,
        });
      });

      // Mark as notified
      const updatedIds = [...notified, ...newAlerts.map(a => a.id)];
      setNotifiedIds(updatedIds);
    });
  }, [alerts]);
}

// Utility to reset notifications (for testing)
export function resetNotifications() {
  localStorage.removeItem(NOTIFIED_KEY);
}
