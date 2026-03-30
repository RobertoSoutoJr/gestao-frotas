import { useState, useCallback, useRef, useEffect } from 'react';
import { Navigation, WifiOff, Check, Loader2, MapPin, X, LocateFixed } from 'lucide-react';
import { queueLocationCapture } from '../../lib/offlineQueue';

export function GPSCapture({ type, tripId, onCapture, label, compact = false }) {
  const [status, setStatus] = useState('idle'); // idle, loading, success, offline_queued, manual
  const [coords, setCoords] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [manualInput, setManualInput] = useState('');
  const watchRef = useRef(null);
  const timeoutRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchRef.current !== null) navigator.geolocation?.clearWatch(watchRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const cleanup = useCallback(() => {
    if (watchRef.current !== null) {
      navigator.geolocation.clearWatch(watchRef.current);
      watchRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const handleSuccess = useCallback((lat, lng) => {
    cleanup();
    setCoords({ lat, lng });
    setErrorMsg('');
    if (navigator.onLine) {
      setStatus('success');
      onCapture?.({ lat, lng, offline: false });
    } else {
      queueLocationCapture({ type, tripId, lat, lng });
      setStatus('offline_queued');
      onCapture?.({ lat, lng, offline: true });
    }
  }, [cleanup, type, tripId, onCapture]);

  // Try automatic GPS
  const tryAutoGPS = useCallback(() => {
    if (!navigator.geolocation) {
      setErrorMsg('Navegador sem suporte a GPS — digite as coordenadas');
      return;
    }

    setStatus('loading');
    setErrorMsg('');
    cleanup();

    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = Math.round(pos.coords.latitude * 1000000) / 1000000;
        const lng = Math.round(pos.coords.longitude * 1000000) / 1000000;
        handleSuccess(lat, lng);
      },
      (err) => {
        cleanup();
        console.error('GPS error:', err.code, err.message);
        const msg = err.code === 1
          ? 'Permissão negada — digite as coordenadas abaixo'
          : 'GPS indisponível — digite as coordenadas abaixo';
        setErrorMsg(msg);
        setStatus('manual');
      },
      { enableHighAccuracy: false, maximumAge: 600000 }
    );

    // Timeout → fall to manual
    timeoutRef.current = setTimeout(() => {
      if (watchRef.current !== null) {
        cleanup();
        setErrorMsg('GPS demorou — digite as coordenadas abaixo');
        setStatus('manual');
      }
    }, 8000);
  }, [cleanup, handleSuccess]);

  const handleManualSubmit = () => {
    const cleaned = manualInput.replace(/\s+/g, ' ').trim();
    // Accept: "-19.123, -44.456" or "-19.123 -44.456" or Google Maps URL
    let lat, lng;

    // Try to extract from Google Maps URL
    const urlMatch = cleaned.match(/@?(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
    if (urlMatch) {
      lat = parseFloat(urlMatch[1]);
      lng = parseFloat(urlMatch[2]);
    } else {
      const parts = cleaned.split(/[,\s]+/).filter(Boolean);
      if (parts.length >= 2) {
        lat = parseFloat(parts[0]);
        lng = parseFloat(parts[1]);
      }
    }

    if (lat !== undefined && lng !== undefined && !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      handleSuccess(lat, lng);
      setManualInput('');
      return;
    }
    setErrorMsg('Formato inválido. Use: -19.123, -44.456');
  };

  // --- SUCCESS STATE ---
  if (status === 'success' || status === 'offline_queued') {
    return (
      <div className={compact ? 'inline-flex' : 'space-y-1'}>
        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
          <Check className="h-4 w-4 shrink-0" />
          <span className="tabular-nums">
            {coords?.lat.toFixed(5)}, {coords?.lng.toFixed(5)}
          </span>
          {status === 'offline_queued' && <WifiOff className="h-3.5 w-3.5 ml-1" />}
        </div>
      </div>
    );
  }

  // --- LOADING STATE ---
  if (status === 'loading') {
    return (
      <div className={compact ? 'inline-flex' : ''}>
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Obtendo localização...</span>
          <button
            type="button"
            onClick={() => { cleanup(); setStatus('manual'); setErrorMsg(''); }}
            className="ml-auto text-amber-400/60 hover:text-amber-400 cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // --- IDLE / MANUAL STATE ---
  return (
    <div className="space-y-2">
      {/* Two action buttons side by side */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={tryAutoGPS}
          className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
          title="Captura automática via GPS"
        >
          <LocateFixed className="h-4 w-4" />
          <span>{label || 'GPS Auto'}</span>
        </button>
        <button
          type="button"
          onClick={() => { setStatus('manual'); setErrorMsg(''); }}
          className="flex flex-1 items-center gap-2 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text)] transition-colors cursor-pointer justify-center"
          title="Digitar coordenadas do Google Maps"
        >
          <MapPin className="h-4 w-4" />
          <span>Digitar Coordenadas</span>
        </button>
      </div>

      {/* Manual input — shown in manual state or after GPS error */}
      {status === 'manual' && (
        <div className="space-y-1.5">
          {errorMsg && (
            <p className="text-xs text-amber-400">{errorMsg}</p>
          )}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="-19.9167, -43.9345"
              className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] placeholder-[var(--color-text-tertiary)] focus:border-[var(--color-accent)] focus:outline-none"
              onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
              autoFocus
            />
            <button
              type="button"
              onClick={handleManualSubmit}
              className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400 hover:bg-emerald-500/20 transition-colors cursor-pointer"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => { setStatus('idle'); setErrorMsg(''); setManualInput(''); }}
              className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-[10px] text-[var(--color-text-tertiary)]">
            Abra o Google Maps, clique no local e cole as coordenadas (lat, lng)
          </p>
        </div>
      )}
    </div>
  );
}
