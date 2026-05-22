import AsyncStorage from '@react-native-async-storage/async-storage';

const QUEUE_KEY_PREFIX = '@fueltrack:offline_';

// Legacy key for backwards compatibility
const LEGACY_KEY = '@fueltrack:offline_abastecimentos';

export type QueueEntityType = 'abastecimentos' | 'manutencoes';

export interface QueuedItem {
  id: string; // local UUID for deduplication
  entityType: QueueEntityType;
  payload: Record<string, any>;
  createdAt: string;
  retryCount?: number;
}

// Legacy interface for backwards compatibility
export interface QueuedAbastecimento {
  id: string;
  payload: Record<string, any>;
  createdAt: string;
}

function getKey(entityType: QueueEntityType): string {
  return `${QUEUE_KEY_PREFIX}${entityType}`;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export async function enqueueItem(entityType: QueueEntityType, payload: Record<string, any>): Promise<void> {
  const existing = await getQueueByType(entityType);
  const item: QueuedItem = {
    id: generateId(),
    entityType,
    payload,
    createdAt: new Date().toISOString(),
    retryCount: 0,
  };
  await AsyncStorage.setItem(getKey(entityType), JSON.stringify([...existing, item]));
}

// Backwards-compatible alias
export async function enqueueAbastecimento(payload: Record<string, any>): Promise<void> {
  return enqueueItem('abastecimentos', payload);
}

export async function enqueueManutencao(payload: Record<string, any>): Promise<void> {
  return enqueueItem('manutencoes', payload);
}

export async function getQueueByType(entityType: QueueEntityType): Promise<QueuedItem[]> {
  try {
    const raw = await AsyncStorage.getItem(getKey(entityType));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Backwards-compatible: returns abastecimentos queue
export async function getQueue(): Promise<QueuedAbastecimento[]> {
  // Check legacy key first, migrate if needed
  try {
    const legacyRaw = await AsyncStorage.getItem(LEGACY_KEY);
    if (legacyRaw) {
      const legacyItems = JSON.parse(legacyRaw) as QueuedAbastecimento[];
      if (legacyItems.length > 0) {
        // Migrate to new key
        const newKey = getKey('abastecimentos');
        const existing = await getQueueByType('abastecimentos');
        const migrated: QueuedItem[] = legacyItems.map((item) => ({
          ...item,
          entityType: 'abastecimentos' as QueueEntityType,
          retryCount: 0,
        }));
        await AsyncStorage.setItem(newKey, JSON.stringify([...existing, ...migrated]));
        await AsyncStorage.removeItem(LEGACY_KEY);
      }
    }
  } catch {
    // ignore migration errors
  }

  return getQueueByType('abastecimentos');
}

// Get total count across all entity types
export async function getTotalQueueCount(): Promise<number> {
  const types: QueueEntityType[] = ['abastecimentos', 'manutencoes'];
  let total = 0;
  for (const t of types) {
    const items = await getQueueByType(t);
    total += items.length;
  }
  return total;
}

export async function removeFromQueue(id: string, entityType?: QueueEntityType): Promise<void> {
  const types: QueueEntityType[] = entityType ? [entityType] : ['abastecimentos', 'manutencoes'];
  for (const t of types) {
    const existing = await getQueueByType(t);
    const filtered = existing.filter((i) => i.id !== id);
    if (filtered.length !== existing.length) {
      await AsyncStorage.setItem(getKey(t), JSON.stringify(filtered));
      return;
    }
  }
}

export async function incrementRetry(id: string, entityType: QueueEntityType): Promise<void> {
  const existing = await getQueueByType(entityType);
  const updated = existing.map((item) =>
    item.id === id ? { ...item, retryCount: (item.retryCount || 0) + 1 } : item
  );
  await AsyncStorage.setItem(getKey(entityType), JSON.stringify(updated));
}

export async function clearQueue(): Promise<void> {
  const types: QueueEntityType[] = ['abastecimentos', 'manutencoes'];
  for (const t of types) {
    await AsyncStorage.removeItem(getKey(t));
  }
  // Also clear legacy key
  await AsyncStorage.removeItem(LEGACY_KEY);
}
