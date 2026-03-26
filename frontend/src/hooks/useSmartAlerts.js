import { useMemo } from 'react';

const ALERT_LEVELS = { critical: 0, warning: 1, info: 2 };

/**
 * Generates smart alerts from fleet data.
 * All calculations are frontend-only — no backend changes needed.
 */
export function useSmartAlerts({ trucks, drivers, fuelRecords, maintenanceRecords }) {
  return useMemo(() => {
    const alerts = [];
    const now = new Date();
    const in30Days = new Date(now);
    in30Days.setDate(in30Days.getDate() + 30);

    // === 1. CNH vencida ou vencendo ===
    (drivers || []).forEach(driver => {
      if (!driver.validade_cnh) return;
      const expiry = new Date(driver.validade_cnh);
      if (expiry < now) {
        alerts.push({
          id: `cnh-expired-${driver.id}`,
          level: 'critical',
          category: 'documentos',
          title: `CNH vencida — ${driver.nome}`,
          detail: `Venceu em ${expiry.toLocaleDateString('pt-BR')}`,
          action: 'drivers',
        });
      } else if (expiry <= in30Days) {
        const days = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
        alerts.push({
          id: `cnh-expiring-${driver.id}`,
          level: 'warning',
          category: 'documentos',
          title: `CNH vencendo — ${driver.nome}`,
          detail: `Vence em ${days} dia${days > 1 ? 's' : ''} (${expiry.toLocaleDateString('pt-BR')})`,
          action: 'drivers',
        });
      }
    });

    // === 2. Licenciamento vencido ou vencendo ===
    (trucks || []).forEach(truck => {
      if (!truck.data_licenciamento) return;
      const expiry = new Date(truck.data_licenciamento);
      if (expiry < now) {
        alerts.push({
          id: `lic-expired-${truck.id}`,
          level: 'critical',
          category: 'documentos',
          title: `Licenciamento vencido — ${truck.placa}`,
          detail: `Venceu em ${expiry.toLocaleDateString('pt-BR')}`,
          action: 'trucks',
        });
      } else if (expiry <= in30Days) {
        const days = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
        alerts.push({
          id: `lic-expiring-${truck.id}`,
          level: 'warning',
          category: 'documentos',
          title: `Licenciamento vencendo — ${truck.placa}`,
          detail: `Vence em ${days} dia${days > 1 ? 's' : ''} (${expiry.toLocaleDateString('pt-BR')})`,
          action: 'trucks',
        });
      }
    });

    // === 3. Revisao por KM ultrapassada ===
    (trucks || []).forEach(truck => {
      if (!truck.km_proxima_revisao || truck.km_proxima_revisao <= 0) return;
      const kmAtual = Number(truck.km_atual) || 0;
      if (kmAtual >= truck.km_proxima_revisao) {
        alerts.push({
          id: `revision-overdue-${truck.id}`,
          level: 'critical',
          category: 'manutencao',
          title: `Revisao atrasada — ${truck.placa}`,
          detail: `KM atual: ${kmAtual.toLocaleString('pt-BR')} / Revisao em: ${truck.km_proxima_revisao.toLocaleString('pt-BR')} km`,
          action: 'maintenance',
        });
      } else {
        const remaining = truck.km_proxima_revisao - kmAtual;
        if (remaining <= 5000) {
          alerts.push({
            id: `revision-soon-${truck.id}`,
            level: 'warning',
            category: 'manutencao',
            title: `Revisao proxima — ${truck.placa}`,
            detail: `Faltam ${remaining.toLocaleString('pt-BR')} km para a revisao`,
            action: 'maintenance',
          });
        }
      }
    });

    // === 4. Manutencoes pendentes ou em andamento ===
    const pendingMaintenance = (maintenanceRecords || []).filter(
      m => m.status === 'pendente' || m.status === 'em_andamento'
    );
    if (pendingMaintenance.length > 0) {
      const pendingCount = pendingMaintenance.filter(m => m.status === 'pendente').length;
      const inProgressCount = pendingMaintenance.filter(m => m.status === 'em_andamento').length;
      const parts = [];
      if (pendingCount > 0) parts.push(`${pendingCount} pendente${pendingCount > 1 ? 's' : ''}`);
      if (inProgressCount > 0) parts.push(`${inProgressCount} em andamento`);
      alerts.push({
        id: 'maintenance-pending',
        level: 'warning',
        category: 'manutencao',
        title: `Manutencoes nao concluidas`,
        detail: parts.join(', '),
        action: 'maintenance',
      });
    }

    // === 5. Consumo anomalo de combustivel ===
    // Detect trucks consuming 25%+ above their own average km/l
    const fuelByTruck = {};
    (fuelRecords || []).forEach(r => {
      if (!r.caminhao_id || !r.litros || !r.km_registro) return;
      if (!fuelByTruck[r.caminhao_id]) fuelByTruck[r.caminhao_id] = [];
      fuelByTruck[r.caminhao_id].push(r);
    });

    Object.entries(fuelByTruck).forEach(([truckId, records]) => {
      if (records.length < 3) return; // need at least 3 records for meaningful average
      const truck = (trucks || []).find(t => t.id === Number(truckId));
      if (!truck) return;

      const kmPerLiters = records
        .filter(r => Number(r.litros) > 0 && Number(r.km_registro) > 0)
        .map(r => Number(r.km_registro) / Number(r.litros));

      if (kmPerLiters.length < 3) return;

      const avg = kmPerLiters.reduce((s, v) => s + v, 0) / kmPerLiters.length;
      // Check if last record is 25%+ worse than average (lower km/l = worse)
      const lastKmPerL = kmPerLiters[kmPerLiters.length - 1];
      if (avg > 0 && lastKmPerL < avg * 0.75) {
        const deviation = ((1 - lastKmPerL / avg) * 100).toFixed(0);
        alerts.push({
          id: `fuel-anomaly-${truckId}`,
          level: 'warning',
          category: 'combustivel',
          title: `Consumo elevado — ${truck.placa}`,
          detail: `Ultimo abastecimento ${deviation}% acima da media (${lastKmPerL.toFixed(2)} vs ${avg.toFixed(2)} km/l)`,
          action: 'fuel',
        });
      }
    });

    // Sort: critical first, then warning, then info
    alerts.sort((a, b) => ALERT_LEVELS[a.level] - ALERT_LEVELS[b.level]);

    return alerts;
  }, [trucks, drivers, fuelRecords, maintenanceRecords]);
}
