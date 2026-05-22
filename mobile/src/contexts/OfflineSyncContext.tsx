import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import * as Network from 'expo-network';
import { useQueryClient } from '@tanstack/react-query';
import { abastecimentosApi } from '../api/abastecimentos';
import { manutencoesApi } from '../api/manutencoes';
import {
  getQueueByType,
  getTotalQueueCount,
  removeFromQueue,
  incrementRetry,
  type QueuedItem,
  type QueueEntityType,
} from '../lib/offlineQueue';
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
    const total = await getTotalQueueCount();
    setPendingCount(total);
  };

  const MAX_RETRIES = 5;

  const syncEntityType = async (entityType: QueueEntityType) => {
    const queue = await getQueueByType(entityType);
    if (queue.length === 0) return { synced: 0, discarded: 0, transientError: '' };

    let synced = 0;
    let discarded = 0;
    let lastTransientError = '';
    const discardedErrors: string[] = [];

    for (const item of queue) {
      // Skip items that exceeded max retries
      if ((item.retryCount || 0) >= MAX_RETRIES) {
        await removeFromQueue(item.id, entityType);
        discarded++;
        discardedErrors.push('Excedeu tentativas máximas');
        continue;
      }

      try {
        if (entityType === 'abastecimentos') {
          await abastecimentosApi.create(item.payload as any);
        } else if (entityType === 'manutencoes') {
          await manutencoesApi.create(item.payload as any);
        }
        await removeFromQueue(item.id, entityType);
        synced++;
      } catch (err: any) {
        const status: number | undefined = err?.status;
        if (status !== undefined && status >= 400 && status < 500) {
          await removeFromQueue(item.id, entityType);
          discarded++;
          discardedErrors.push(err?.message ?? 'Erro de validação');
        } else {
          await incrementRetry(item.id, entityType);
          lastTransientError = err?.message ?? 'Erro ao conectar';
        }
      }
    }

    return { synced, discarded, transientError: lastTransientError, discardedErrors };
  };

  const sync = async () => {
    if (syncingRef.current) return;

    const total = await getTotalQueueCount();
    if (total === 0) return;

    // Only skip if explicitly offline
    try {
      const state = await Network.getNetworkStateAsync();
      if (state.isConnected === false) return;
    } catch {
      // expo-network threw — proceed and let the API call fail naturally
    }

    syncingRef.current = true;
    setSyncing(true);

    const entityTypes: QueueEntityType[] = ['abastecimentos', 'manutencoes'];
    let totalSynced = 0;
    let totalDiscarded = 0;
    let lastError = '';
    const invalidatedKeys: string[] = [];

    for (const entityType of entityTypes) {
      const result = await syncEntityType(entityType);
      totalSynced += result.synced;
      totalDiscarded += result.discarded;
      if (result.transientError) lastError = result.transientError;
      if (result.synced > 0) invalidatedKeys.push(entityType);
    }

    syncingRef.current = false;
    setSyncing(false);
    await refreshCount();

    if (totalSynced > 0) {
      for (const key of invalidatedKeys) {
        queryClient.invalidateQueries({ queryKey: [key] });
      }
      showToast(
        `${totalSynced} lançamento${totalSynced > 1 ? 's' : ''} sincronizado${totalSynced > 1 ? 's' : ''}`,
        'success',
      );
    }

    if (totalDiscarded > 0) {
      showToast(
        `${totalDiscarded} lançamento${totalDiscarded > 1 ? 's' : ''} descartado${totalDiscarded > 1 ? 's' : ''}`,
        'error',
      );
    }

    if (lastError) {
      const remaining = await getTotalQueueCount();
      if (remaining > 0) {
        showToast(`Erro ao sincronizar: ${lastError}`, 'error');
      }
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
