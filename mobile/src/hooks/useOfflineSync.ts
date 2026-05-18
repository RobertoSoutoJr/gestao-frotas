import { useEffect, useRef, useState } from 'react';
import * as Network from 'expo-network';
import { useQueryClient } from '@tanstack/react-query';
import { abastecimentosApi } from '../api/abastecimentos';
import { getQueue, removeFromQueue } from '../lib/offlineQueue';

export function useOfflineSync() {
  const queryClient = useQueryClient();
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refreshCount = async () => {
    const queue = await getQueue();
    setPendingCount(queue.length);
  };

  const sync = async () => {
    const queue = await getQueue();
    if (queue.length === 0) return;

    const state = await Network.getNetworkStateAsync();
    if (!state.isConnected || !state.isInternetReachable) return;

    setSyncing(true);
    let synced = 0;

    for (const item of queue) {
      try {
        await abastecimentosApi.create(item.payload as any);
        await removeFromQueue(item.id);
        synced++;
      } catch {
        // Leave in queue to retry next cycle
      }
    }

    if (synced > 0) {
      queryClient.invalidateQueries({ queryKey: ['abastecimentos'] });
    }

    setSyncing(false);
    await refreshCount();
  };

  useEffect(() => {
    refreshCount();
    // Check and sync every 30 seconds
    intervalRef.current = setInterval(sync, 30_000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { pendingCount, syncing, sync, refreshCount };
}
