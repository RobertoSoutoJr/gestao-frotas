import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import * as Network from 'expo-network';
import { useQueryClient } from '@tanstack/react-query';
import { abastecimentosApi } from '../api/abastecimentos';
import { getQueue, removeFromQueue } from '../lib/offlineQueue';
import { useToast } from './ToastContext';

interface OfflineSyncContextValue {
  pendingCount: number;
  syncing: boolean;
  sync: () => Promise<void>;
  refreshCount: () => Promise<void>;
}

const OfflineSyncContext = createContext<OfflineSyncContextValue>({
  pendingCount: 0,
  syncing: false,
  sync: async () => {},
  refreshCount: async () => {},
});

export function OfflineSyncProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const syncingRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refreshCount = async () => {
    const queue = await getQueue();
    setPendingCount(queue.length);
  };

  const sync = async () => {
    if (syncingRef.current) return;

    const queue = await getQueue();
    if (queue.length === 0) return;

    // Only skip if explicitly offline — null means unknown, try anyway
    try {
      const state = await Network.getNetworkStateAsync();
      if (state.isConnected === false) return;
    } catch {
      // expo-network threw — proceed and let the API call fail naturally
    }

    syncingRef.current = true;
    setSyncing(true);
    let synced = 0;
    let discarded = 0;
    let lastTransientError = '';
    const discardedErrors: string[] = [];

    for (const item of queue) {
      try {
        await abastecimentosApi.create(item.payload as any);
        await removeFromQueue(item.id);
        synced++;
      } catch (err: any) {
        const status: number | undefined = err?.status;
        if (status !== undefined && status >= 400 && status < 500) {
          // Permanent validation error — will never succeed, remove from queue
          await removeFromQueue(item.id);
          discarded++;
          discardedErrors.push(err?.message ?? 'Erro de validação');
        } else {
          // Transient error (network, 5xx) — keep for retry
          lastTransientError = err?.message ?? 'Erro ao conectar';
        }
      }
    }

    syncingRef.current = false;
    setSyncing(false);
    await refreshCount();

    if (synced > 0) {
      queryClient.invalidateQueries({ queryKey: ['abastecimentos'] });
      showToast(
        `${synced} lançamento${synced > 1 ? 's' : ''} sincronizado${synced > 1 ? 's' : ''}`,
        'success',
      );
    }

    if (discarded > 0) {
      showToast(
        `${discarded} lançamento${discarded > 1 ? 's' : ''} descartado${discarded > 1 ? 's' : ''}: ${discardedErrors[0]}`,
        'error',
      );
    }

    const remaining = await getQueue();
    if (remaining.length > 0 && lastTransientError) {
      showToast(`Erro ao sincronizar: ${lastTransientError}`, 'error');
    }
  };

  useEffect(() => {
    refreshCount().then(() => sync());
    intervalRef.current = setInterval(sync, 30_000);

    const appStateSub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') sync();
    });

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      appStateSub.remove();
    };
  }, []);

  return (
    <OfflineSyncContext.Provider value={{ pendingCount, syncing, sync, refreshCount }}>
      {children}
    </OfflineSyncContext.Provider>
  );
}

export function useOfflineSyncContext() {
  return useContext(OfflineSyncContext);
}
