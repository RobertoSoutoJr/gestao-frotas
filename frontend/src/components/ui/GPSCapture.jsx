import { useState, useCallback, useRef } from 'react';
import { Navigation, WifiOff, Check, Loader2, MapPin, X } from 'lucide-react';
import { queueLocationCapture } from '../../lib/offlineQueue';

// States: idle, loading, success, offline_queued, error, manual
const GPS_ERROR_MESSAGES = {
  1: 'Permissão negada',
  2: 'Localização indisponível',
  3: 'Tempo esgotado',
};

export function GPSCapture({ type, tripId, onCapture, label, compact = false }) {
  const [status, setStatus] = useState('idle');
  const [coords, setCoords] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [manualInput, setManualInput] = useState('');
  const watchRef = useRef(null);
  const timeoutRef = useRef(null);

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
    if (navigator.onLine) {
      setStatus('success');
      onCapture?.({ lat, lng, offline: false });
    } else {
      queueLocationCapture({ type, tripId, lat, lng });
      setStatus('offline_queued');
      onCapture?.({ lat, lng, offline: true });
    }
  }, [cleanup, type, tripId, onCapture]);

  const capture = useCallback(() => {
    if (!navigator.geolocation) {
      setErrorMsg('Navegador não suporta GPS');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMsg('');
    cleanup();

    // Use watchPosition — more reliable than getCurrentPosition on desktop browsers
    // It keeps trying until it gets a fix, instead of failing after one attempt
    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = Math.round(pos.coords.latitude * 1000000) / 1000000;
        const lng = Math.round(pos.coords.longitude * 1000000) / 1000000;
        handleSuccess(lat, lng);
      },
      (err) => {
        cleanup();
        console.error('GPS error:', err.code, err.message);
        setErrorMsg(GPS_ERROR_MESSAGES[err.code] || 'Erro desconhecido');
        setStatus('error');
      },
      {
        enableHighAccuracy: false,
        maximumAge: 600000, // accept 10min old position
      }
    );

    // Manual timeout — if no position in 12s, stop and show manual option
    timeoutRef.current = setTimeout(() => {
      if (watchRef.current !== null) {
        cleanup();
        setErrorMsg('GPS demorou — use entrada manual');
        setStatus('error');
      }
    }, 12000);
  }, [cleanup, handleSuccess]);

  const handleManualSubmit = () => {
    // Accept formats: "-19.123, -44.456" or "-19.123 -44.456"
    const cleaned = manualInput.replace(/\s+/g, ' ').trim();
    const parts = cleaned.split(/[,\s]+/).filter(Boolean);
    if (parts.length === 2) {
      const lat = parseFloat(parts[0]);
      const lng = parseFloat(parts[1]);
      if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        handleSuccess(lat, lng);
        setManualInput('');
        return;
      }
    }
    setErrorMsg('Formato inválido. Use: -19.123, -44.456');
  };

  const showManual = () => {
    setStatus('manual');
    setErrorMsg('');
  };

  if (status === 'manual') {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder="-19.123, -44.456"
            className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] placeholder-[var(--color-text-tertiary)] focus:border-[var(--color-accent)] focus:outline-none"
            onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
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
            onClick={() => { setStatus('idle'); setErrorMsg(''); }}
            className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-[10px] text-[var(--color-text-tertiary)] text-center">
          Cole as coordenadas (lat, lng) do Google Maps
        </p>
        {errorMsg && <p className="text-xs text-red-400 text-center">{errorMsg}</p>}
      </div>
    );
  }

  const buttonLabel = {
    idle: label || 'Capturar GPS',
    loading: 'Obtendo...',
    success: coords ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : 'Capturado',
    offline_queued: 'Salvo offline',
    error: errorMsg || 'Erro no GPS',
  }[status];

  const buttonIcon = {
    idle: <Navigation className="h-4 w-4" />,
    loading: <Loader2 className="h-4 w-4 animate-spin" />,
    success: <Check className="h-4 w-4" />,
    offline_queued: <WifiOff className="h-4 w-4" />,
    error: <Navigation className="h-4 w-4" />,
  }[status];

  const buttonColor = {
    idle: 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text)]',
    loading: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
    success: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
    offline_queued: 'border-blue-500/30 text-blue-400 bg-blue-500/10',
    error: 'border-red-500/30 text-red-400 bg-red-500/10',
  }[status];

  return (
    <div className={compact ? 'inline-flex flex-col gap-1' : 'space-y-1'}>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={status === 'error' ? capture : status === 'idle' ? capture : undefined}
          disabled={status === 'loading'}
          className={`flex flex-1 items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors cursor-pointer ${buttonColor} ${compact ? '' : 'justify-center'}`}
        >
          {buttonIcon}
          <span className="truncate">{buttonLabel}</span>
        </button>

        {/* Manual entry button — always visible */}
        {status !== 'success' && status !== 'offline_queued' && (
          <button
            type="button"
            onClick={showManual}
            title="Digitar coordenadas manualmente"
            className="rounded-lg border border-[var(--color-border)] px-2.5 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
          >
            <MapPin className="h-4 w-4" />
          </button>
        )}
      </div>

      {coords && !compact && status === 'success' && (
        <p className="text-xs text-[var(--color-text-tertiary)] tabular-nums text-center">
          {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
        </p>
      )}
    </div>
  );
}
