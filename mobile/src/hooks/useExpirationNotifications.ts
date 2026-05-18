import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { useQuery } from '@tanstack/react-query';
import { caminhoesApi } from '../api/caminhoes';
import { motoristasApi } from '../api/motoristas';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function daysUntil(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

async function requestPermission(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

async function scheduleAlert(title: string, body: string, id: string) {
  await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
  await Notifications.scheduleNotificationAsync({
    identifier: id,
    content: { title, body },
    trigger: null, // show immediately
  });
}

export function useExpirationNotifications(enabled: boolean) {
  const trucksQuery = useQuery({
    queryKey: ['caminhoes'],
    queryFn: () => caminhoesApi.list(),
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  const driversQuery = useQuery({
    queryKey: ['motoristas'],
    queryFn: () => motoristasApi.list(),
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!enabled) return;
    if (!trucksQuery.data && !driversQuery.data) return;

    const run = async () => {
      const granted = await requestPermission();
      if (!granted) return;

      // Check trucks — licenciamento
      for (const truck of trucksQuery.data ?? []) {
        const days = daysUntil(truck.data_licenciamento);
        if (days === null) continue;

        if (days < 0) {
          await scheduleAlert(
            '⚠️ Licenciamento vencido',
            `Caminhão ${truck.placa} — licenciamento venceu há ${Math.abs(days)} dia(s). Regularize para evitar multas.`,
            `licenciamento-${truck.id}`,
          );
        } else if (days <= 30) {
          await scheduleAlert(
            '📋 Licenciamento próximo do vencimento',
            `Caminhão ${truck.placa} — licenciamento vence em ${days} dia(s).`,
            `licenciamento-${truck.id}`,
          );
        }
      }

      // Check drivers — CNH
      for (const driver of driversQuery.data ?? []) {
        const days = daysUntil(driver.validade_cnh);
        if (days === null) continue;

        if (days < 0) {
          await scheduleAlert(
            '⚠️ CNH vencida',
            `${driver.nome} — CNH venceu há ${Math.abs(days)} dia(s). Motorista não pode operar.`,
            `cnh-${driver.id}`,
          );
        } else if (days <= 30) {
          await scheduleAlert(
            '🪪 CNH próxima do vencimento',
            `${driver.nome} — CNH vence em ${days} dia(s).`,
            `cnh-${driver.id}`,
          );
        }
      }
    };

    run();
  }, [trucksQuery.data, driversQuery.data, enabled]);
}
