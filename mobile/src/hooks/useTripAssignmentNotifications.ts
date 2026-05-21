import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { useQuery } from '@tanstack/react-query';
import { viagensApi } from '../api/viagens';
import type { Viagem } from '../api/types';

export function useTripAssignmentNotifications(motoristaId: number | null | undefined) {
  const enabled = !!motoristaId;
  const knownIdsRef = useRef<Set<number> | null>(null);

  const query = useQuery({
    queryKey: ['viagens'],
    queryFn: () => viagensApi.list(),
    enabled,
    refetchInterval: 60_000, // poll every 60s to detect new assignments
  });

  useEffect(() => {
    if (!enabled || !query.data) return;

    const myTrips = query.data.filter(
      (t: Viagem) => t.motorista_id === motoristaId && t.status === 'cadastrada',
    );

    // First load — seed the known set without notifying
    if (knownIdsRef.current === null) {
      knownIdsRef.current = new Set(myTrips.map((t) => t.id));
      return;
    }

    const newTrips = myTrips.filter((t) => !knownIdsRef.current!.has(t.id));

    for (const trip of newTrips) {
      knownIdsRef.current.add(trip.id);
      Notifications.scheduleNotificationAsync({
        content: {
          title: 'Nova viagem atribuída',
          body: `Viagem de ${trip.produto || 'carga'} foi atribuída a você.`,
          data: { tripId: trip.id },
        },
        trigger: null,
      });
    }
  }, [query.data, enabled, motoristaId]);
}
