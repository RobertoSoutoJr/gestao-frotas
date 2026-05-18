import AsyncStorage from '@react-native-async-storage/async-storage';

const QUEUE_KEY = '@fueltrack:offline_abastecimentos';

export interface QueuedAbastecimento {
  id: string; // local UUID for deduplication
  payload: Record<string, any>;
  createdAt: string;
}

export async function enqueueAbastecimento(payload: Record<string, any>): Promise<void> {
  const existing = await getQueue();
  const item: QueuedAbastecimento = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    payload,
    createdAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify([...existing, item]));
}

export async function getQueue(): Promise<QueuedAbastecimento[]> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function removeFromQueue(id: string): Promise<void> {
  const existing = await getQueue();
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(existing.filter((i) => i.id !== id)));
}

export async function clearQueue(): Promise<void> {
  await AsyncStorage.removeItem(QUEUE_KEY);
}
