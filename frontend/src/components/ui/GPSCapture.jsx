import { useState, useCallback } from 'react';
import { Navigation, WifiOff, Check, Loader2 } from 'lucide-react';
import { queueLocationCapture } from '../../lib/offlineQueue';

// States: idle, loading, success, offline_queued, error
const GPS_ERROR_MESSAGES = {
  1: 'Permissão negada — ative a localização nas configurações do navegador',
  2: 'Localização indisponível — verifique se o GPS está ativo',
  3: 'Tempo esgotado — tente novamente em local com melhor sinal',
};

export function GPSCapture({ type, tripId, onCapture, label, compact = false }) {
  const [status, setStatus] = useState('idle');
  const [coords, setCoords] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const capture = useCallback(() => {
    if (!navigator.geolocation) {
      setErrorMsg('Navegador não suporta GPS');
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Math.round(pos.coords.latitude * 1000000) / 1000000;
        const lng = Math.round(pos.coords.longitude * 1000000) / 1000000;
        setCoords({ lat, lng });

        if (navigator.onLine) {
          setStatus('success');
          onCapture?.({ lat, lng, offline: false });
        } else {
          queueLocationCapture({ type, tripId, lat, lng });
          setStatus('offline_queued');
          onCapture?.({ lat, lng, offline: true });
        }
      },
      (err) => {
        console.error('GPS error:', err.code, err.message);
        setErrorMsg(GPS_ERROR_MESSAGES[err.code] || err.message || 'Erro desconhecido');
        setStatus('error');
        setTimeout(() => setStatus('idle'), 5000);
      },
      {
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 300000, // accept 5min old position
      }
    );
  }, [type, tripId, onCapture]);

  const buttonLabel = {
    idle: label || 'Capturar GPS',
    loading: 'Obtendo...',
    success: 'Capturado',
    offline_queued: 'Salvo offline',
    error: 'Erro no GPS',
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
    <div className={compact ? 'inline-flex' : 'space-y-1'}>
      <button
        type="button"
        onClick={capture}
        disabled={status === 'loading'}
        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${buttonColor} ${compact ? '' : 'w-full justify-center'}`}
      >
        {buttonIcon}
        <span>{buttonLabel}</span>
      </button>

      {coords && !compact && (
        <p className="text-xs text-[var(--color-text-tertiary)] tabular-nums text-center">
          {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
          {status === 'offline_queued' && ' (sera sincronizado quando voltar online)'}
        </p>
      )}
      {status === 'error' && errorMsg && !compact && (
        <p className="text-xs text-red-400 text-center">{errorMsg}</p>
      )}
    </div>
  );
}
