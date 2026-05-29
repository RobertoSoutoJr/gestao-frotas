import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { useSectionPrefs, SectionCustomizerButton, SectionCustomizerModal } from '../components/ui/SectionCustomizer';
import {
  Truck, Users, Gauge, DollarSign, Fuel, Wrench, ArrowRight, Building2, Factory,
  Route, Warehouse, Package, AlertCircle, AlertTriangle, TrendingUp, TrendingDown,
  Minus, Activity, Droplets, Zap, Bell, Wallet, Plus, ChevronRight, Circle
} from 'lucide-react';
import { useSmartAlerts } from '../hooks/useSmartAlerts';
import { useNotifications } from '../hooks/useNotifications';
import { MiniMapView } from '../components/ui/MapView';
import { formatCurrency, formatNumber } from '../lib/utils';
import { useTheme } from '../contexts/ThemeContext';
import {
  LineChart, Line, BarChart, Bar, ComposedChart, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// ─── KPI Card (compact for command strip) ───
function KpiCard({ title, value, unit, icon: Icon, color, trend, trendLabel, invertTrend }) {
  const hasTrend = trend !== null && trend !== undefined && isFinite(trend);
  const isPositive = invertTrend ? trend < 0 : trend > 0;
  const isNeutral = !hasTrend || trend === 0;
  const TrendIcon = isNeutral ? Minus : (isPositive ? TrendingUp : TrendingDown);
  const trendColor = isNeutral ? 'var(--color-text-secondary)' : (isPositive ? '#10B981' : '#EF4444');

  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between mb-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${color}18` }}
          >
            <Icon className="h-4.5 w-4.5" style={{ color }} />
          </div>
          {hasTrend && (
            <div
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium"
              style={{ backgroundColor: `${trendColor}15`, color: trendColor }}
            >
              <TrendIcon className="h-3 w-3" />
              <span>{Math.abs(trend).toFixed(1)}%</span>
            </div>
          )}
        </div>
        <p className="text-[10px] sm:text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
          {title}
        </p>
        <div className="flex items-baseline gap-1.5 mt-1">
          <p className="text-lg sm:text-xl font-bold text-[var(--color-text)]">{value}</p>
          {unit && <span className="text-xs text-[var(--color-text-secondary)]">{unit}</span>}
        </div>
        {trendLabel && (
          <p className="text-[10px] sm:text-xs text-[var(--color-text-secondary)] mt-1.5">{trendLabel}</p>
        )}
      </CardContent>
    </Card>
  );
}

const CHART_COLORS = {
  accent:    '#28633D',
  secondary: '#34D399',
  green:     '#10B981',
  orange:    '#34D399',
  red:       '#EF4444',
  pink:      '#EC4899',
};

const DASHBOARD_SECTIONS = [
  { id: 'alerts', label: 'Alertas Inteligentes', description: 'Documentos, manutenção, consumo e pagamentos', icon: Bell },
  { id: 'kpis', label: 'Indicadores de Performance', description: 'Custo/km, km/litro, disponibilidade, tendências', icon: Activity },
  { id: 'main_stats', label: 'Estatísticas Principais', description: 'Caminhões, motoristas, gastos e KM', icon: Gauge },
  { id: 'operations', label: 'Operações', description: 'Clientes, fornecedores, viagens e estoque', icon: Route },
  { id: 'freight_summary', label: 'Resumo de Frete', description: 'Total frete, valor estoque, contas a pagar', icon: Package },
  { id: 'spending_chart', label: 'Gráfico de Gastos', description: 'Evolução dos custos nos últimos meses', icon: DollarSign },
  { id: 'cost_distribution', label: 'Distribuição de Custos', description: 'Combustível vs Manutenção', icon: Fuel },
  { id: 'top_trucks', label: 'Top 5 Veículos', description: 'Veículos com maior custo operacional', icon: Truck },
  { id: 'client_profitability', label: 'Rentabilidade por Cliente', description: 'Lucro e margem por cliente', icon: Building2 },
  { id: 'cashflow', label: 'Fluxo de Caixa', description: 'Receita vs despesas com saldo acumulado', icon: Wallet },
  { id: 'fleet_map', label: 'Mapa da Frota', description: 'Viagens ativas no mapa', icon: Route },
];

const DEFAULT_ORDER = ['alerts', 'kpis', 'fleet_map', 'main_stats', 'operations', 'freight_summary', 'cashflow', 'spending_chart', 'cost_distribution', 'top_trucks', 'client_profitability'];
const DEFAULT_VISIBILITY = {
  kpis: true, main_stats: true, operations: true, alerts: true, freight_summary: true,
  spending_chart: true, cost_distribution: true, top_trucks: true, cashflow: true,
  client_profitability: true, fleet_map: true
};

const PERIOD_OPTIONS = [
  { value: 'daily', label: 'Hoje' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'monthly', label: 'Mensal' },
  { value: 'yearly', label: 'Anual' }
];

// ─── Quick Actions ───
const QUICK_ACTIONS = [
  { label: 'Nova Viagem', icon: Route, nav: 'trips', color: '#28633D' },
  { label: 'Abastecer', icon: Fuel, nav: 'fuel', color: '#10B981' },
  { label: 'Manutenção', icon: Wrench, nav: 'maintenance', color: '#06B6D4' },
  { label: 'Estoque', icon: Package, nav: 'stock', color: '#8B5CF6' },
];

export function DashboardPage({ trucks, drivers, clients, suppliers, trips, stockRecords, fuelRecords, maintenanceRecords, onNavigate }) {
  const { isDark } = useTheme();
  const [showCustomize, setShowCustomize] = useState(false);
  const smartAlerts = useSmartAlerts({ trucks, drivers, fuelRecords, maintenanceRecords, trips });
  useNotifications(smartAlerts);

  const { prefs, setPrefs, isVisible, getOrder, moveUp, moveDown, toggleVisibility, reset } = useSectionPrefs(
    'dashboard_prefs_v2', DEFAULT_ORDER, DEFAULT_VISIBILITY
  );

  const period = prefs.period || 'monthly';
  const setPeriod = (p) => setPrefs(prev => ({ ...prev, period: p }));
  const periodLabel = PERIOD_OPTIONS.find(p => p.value === period)?.label || 'Mensal';

  const filterByPeriod = useCallback((records, dateField = 'created_at') => {
    const now = new Date();
    return records.filter(r => {
      const d = new Date(r[dateField] || r.created_at);
      switch (period) {
        case 'daily': return d.toDateString() === now.toDateString();
        case 'weekly': { const w = new Date(now); w.setDate(w.getDate() - 7); return d >= w; }
        case 'monthly': return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        case 'yearly': return d.getFullYear() === now.getFullYear();
        default: return true;
      }
    });
  }, [period]);

  const filterByPreviousPeriod = useCallback((records, dateField = 'created_at') => {
    const now = new Date();
    return records.filter(r => {
      const d = new Date(r[dateField] || r.created_at);
      switch (period) {
        case 'daily': { const y = new Date(now); y.setDate(y.getDate() - 1); return d.toDateString() === y.toDateString(); }
        case 'weekly': { const t = new Date(now); t.setDate(t.getDate() - 14); const o = new Date(now); o.setDate(o.getDate() - 7); return d >= t && d < o; }
        case 'monthly': { const p = new Date(now.getFullYear(), now.getMonth() - 1, 1); return d.getMonth() === p.getMonth() && d.getFullYear() === p.getFullYear(); }
        case 'yearly': return d.getFullYear() === now.getFullYear() - 1;
        default: return false;
      }
    });
  }, [period]);

  const tooltipStyle = {
    backgroundColor: isDark ? 'rgba(10,10,12,0.95)' : 'rgba(255,255,255,0.98)',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)'}`,
    borderRadius: '12px',
    fontFamily: '"Inter", sans-serif',
    color: isDark ? '#EDEDEF' : '#1A1D23',
    boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.5)' : '0 8px 32px rgba(0,0,0,0.08)',
  };

  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const axisColor = isDark ? '#8A8F98' : '#6B7280';

  // ─── Stats computation ───
  const stats = useMemo(() => {
    const periodFuel = filterByPeriod(fuelRecords, 'created_at');
    const periodMaintenance = filterByPeriod(maintenanceRecords, 'data_manutencao');

    const totalFuelCost = periodFuel.reduce((s, r) => s + (Number(r.valor_total) || 0), 0);
    const totalMaintenanceCost = periodMaintenance.reduce((s, r) => s + (Number(r.valor_total) || 0), 0);
    const totalKm = periodFuel.reduce((s, r) => s + (Number(r.km_registro) || 0), 0);
    const totalLitros = periodFuel.reduce((s, r) => s + (Number(r.litros) || 0), 0);

    const activeTrips = (trips || []).filter(t => t.status === 'cadastrada').length;
    const completedTrips = (trips || []).filter(t => t.status === 'finalizada').length;
    const totalFreight = (trips || []).reduce((s, t) => s + (Number(t.valor_total_frete) || 0), 0);

    const totalStockValue = (stockRecords || []).reduce((s, r) => s + (Number(r.valor_total) || 0), 0);
    const pendingPayments = (stockRecords || []).filter(r => !r.pago);
    const pendingAmount = pendingPayments.reduce((s, r) => s + (Number(r.valor_total) || 0), 0);
    const totalSacas = (stockRecords || []).reduce((s, r) => s + (Number(r.quantidade_sacas) || 0), 0);

    const totalCost = totalFuelCost + totalMaintenanceCost;
    const costPerKm = totalKm > 0 ? totalCost / totalKm : 0;
    const kmPerLiter = totalLitros > 0 ? totalKm / totalLitros : 0;
    const costPerSaca = totalSacas > 0 ? totalCost / totalSacas : 0;

    const allTrucks = trucks.filter(t => t.placa).length;
    const trucksInMaintenance = new Set(
      periodMaintenance.filter(m => m.status === 'pendente' || m.status === 'em_andamento').map(m => m.caminhao_id)
    ).size;
    const fleetAvailability = allTrucks > 0 ? ((allTrucks - trucksInMaintenance) / allTrucks) * 100 : 100;

    const prevFuel = filterByPreviousPeriod(fuelRecords, 'created_at');
    const prevMaintenance = filterByPreviousPeriod(maintenanceRecords, 'data_manutencao');
    const prevTotalCost = prevFuel.reduce((s, r) => s + (Number(r.valor_total) || 0), 0) + prevMaintenance.reduce((s, r) => s + (Number(r.valor_total) || 0), 0);
    const prevKm = prevFuel.reduce((s, r) => s + (Number(r.km_registro) || 0), 0);
    const prevLitros = prevFuel.reduce((s, r) => s + (Number(r.litros) || 0), 0);
    const prevCostPerKm = prevKm > 0 ? prevTotalCost / prevKm : 0;
    const prevKmPerLiter = prevLitros > 0 ? prevKm / prevLitros : 0;

    const calcTrend = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    return {
      activeTrucks: allTrucks, totalDrivers: (drivers || []).length,
      totalClients: (clients || []).length, totalSuppliers: (suppliers || []).length,
      totalCost, totalKm, totalLitros, fuelCost: totalFuelCost, maintenanceCost: totalMaintenanceCost,
      activeTrips, completedTrips, totalTrips: (trips || []).length, totalFreight,
      totalStockValue, pendingAmount, pendingPaymentsCount: pendingPayments.length, totalSacas,
      costPerKm, kmPerLiter, costPerSaca, fleetAvailability, trucksInMaintenance,
      costPerKmTrend: calcTrend(costPerKm, prevCostPerKm),
      kmPerLiterTrend: calcTrend(kmPerLiter, prevKmPerLiter),
      totalCostTrend: calcTrend(totalCost, prevTotalCost),
    };
  }, [trucks, drivers, clients, suppliers, trips, stockRecords, fuelRecords, maintenanceRecords, filterByPeriod, filterByPreviousPeriod]);

  // ─── Chart data ───
  const spendingChartData = useMemo(() => {
    const now = new Date();
    const dataPoints = [];
    if (period === 'daily') {
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now); date.setDate(date.getDate() - i);
        const dayStr = date.toDateString();
        const label = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        const fuelCost = fuelRecords.filter(r => new Date(r.created_at).toDateString() === dayStr).reduce((s, r) => s + (Number(r.valor_total) || 0), 0);
        const maintenanceCost = maintenanceRecords.filter(r => new Date(r.data_manutencao || r.created_at).toDateString() === dayStr).reduce((s, r) => s + (Number(r.valor_total) || 0), 0);
        dataPoints.push({ month: label, combustivel: fuelCost, manutencao: maintenanceCost, total: fuelCost + maintenanceCost });
      }
    } else if (period === 'weekly') {
      for (let i = 3; i >= 0; i--) {
        const weekEnd = new Date(now); weekEnd.setDate(weekEnd.getDate() - (i * 7));
        const weekStart = new Date(weekEnd); weekStart.setDate(weekStart.getDate() - 6);
        const label = `${weekStart.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`;
        const fuelCost = fuelRecords.filter(r => { const d = new Date(r.created_at); return d >= weekStart && d <= weekEnd; }).reduce((s, r) => s + (Number(r.valor_total) || 0), 0);
        const maintenanceCost = maintenanceRecords.filter(r => { const d = new Date(r.data_manutencao || r.created_at); return d >= weekStart && d <= weekEnd; }).reduce((s, r) => s + (Number(r.valor_total) || 0), 0);
        dataPoints.push({ month: label, combustivel: fuelCost, manutencao: maintenanceCost, total: fuelCost + maintenanceCost });
      }
    } else {
      const count = period === 'yearly' ? 12 : 6;
      for (let i = count - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const month = date.getMonth(); const year = date.getFullYear();
        const monthName = date.toLocaleDateString('pt-BR', { month: 'short' });
        const fuelCost = fuelRecords.filter(r => { const d = new Date(r.created_at); return d.getMonth() === month && d.getFullYear() === year; }).reduce((s, r) => s + (Number(r.valor_total) || 0), 0);
        const maintenanceCost = maintenanceRecords.filter(r => { const d = new Date(r.data_manutencao || r.created_at); return d.getMonth() === month && d.getFullYear() === year; }).reduce((s, r) => s + (Number(r.valor_total) || 0), 0);
        dataPoints.push({ month: monthName.charAt(0).toUpperCase() + monthName.slice(1), combustivel: fuelCost, manutencao: maintenanceCost, total: fuelCost + maintenanceCost });
      }
    }
    return dataPoints;
  }, [fuelRecords, maintenanceRecords, period]);

  const spendingChartTitle = useMemo(() => {
    switch (period) {
      case 'daily': return 'Últimos 7 dias';
      case 'weekly': return 'Últimas 4 semanas';
      case 'yearly': return 'Últimos 12 meses';
      default: return 'Últimos 6 meses';
    }
  }, [period]);

  const topTrucksData = useMemo(() => {
    const periodFuel = filterByPeriod(fuelRecords, 'created_at');
    const periodMaintenance = filterByPeriod(maintenanceRecords, 'data_manutencao');
    const spending = {};
    periodFuel.forEach(r => { spending[r.caminhao_id] = (spending[r.caminhao_id] || 0) + (Number(r.valor_total) || 0); });
    periodMaintenance.forEach(r => { spending[r.caminhao_id] = (spending[r.caminhao_id] || 0) + (Number(r.valor_total) || 0); });
    return Object.entries(spending)
      .map(([id, gasto]) => ({ truck: trucks.find(t => t.id === Number(id))?.placa || `ID:${id}`, gasto }))
      .sort((a, b) => b.gasto - a.gasto)
      .slice(0, 5);
  }, [trucks, fuelRecords, maintenanceRecords, period]);

  const clientProfitData = useMemo(() => {
    const finalized = (trips || []).filter(t => t.status === 'finalizada');
    const map = {};
    finalized.forEach(t => {
      const cid = t.cliente_id;
      if (!map[cid]) map[cid] = { receita: 0, custos: 0, viagens: 0 };
      map[cid].receita += Number(t.valor_total_frete) || 0;
      map[cid].custos += (Number(t.custo_combustivel) || 0) + (Number(t.custo_pedagio) || 0) +
        (Number(t.custo_manutencao) || 0) + (Number(t.custo_outros) || 0);
      map[cid].viagens += 1;
    });
    return Object.entries(map)
      .map(([id, d]) => {
        const client = (clients || []).find(c => c.id === Number(id));
        const lucro = d.receita - d.custos;
        return { nome: client?.nome || `#${id}`, ...d, lucro, margem: d.receita > 0 ? (lucro / d.receita) * 100 : 0 };
      })
      .sort((a, b) => b.lucro - a.lucro)
      .slice(0, 5);
  }, [trips, clients]);

  const costDistributionData = [
    { name: 'Combustível', value: stats.fuelCost, color: CHART_COLORS.accent },
    { name: 'Manutenção', value: stats.maintenanceCost, color: CHART_COLORS.secondary }
  ];

  const cashflowData = useMemo(() => {
    const now = new Date();
    const months = [];
    const monthCount = period === 'yearly' ? 12 : 6;
    for (let i = monthCount - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = date.getMonth(); const year = date.getFullYear();
      const label = date.toLocaleDateString('pt-BR', { month: 'short' });
      const receita = (trips || []).filter(t => { if (t.status !== 'finalizada') return false; const d = new Date(t.data_finalizacao || t.updated_at || t.created_at); return d.getMonth() === month && d.getFullYear() === year; }).reduce((s, t) => s + (Number(t.valor_total_frete) || 0), 0);
      const despCombustivel = fuelRecords.filter(r => { const d = new Date(r.created_at); return d.getMonth() === month && d.getFullYear() === year; }).reduce((s, r) => s + (Number(r.valor_total) || 0), 0);
      const despManutencao = maintenanceRecords.filter(r => { const d = new Date(r.data_manutencao || r.created_at); return d.getMonth() === month && d.getFullYear() === year; }).reduce((s, r) => s + (Number(r.valor_total) || 0), 0);
      const despViagem = (trips || []).filter(t => { if (t.status !== 'finalizada') return false; const d = new Date(t.data_finalizacao || t.updated_at || t.created_at); return d.getMonth() === month && d.getFullYear() === year; }).reduce((s, t) => s + (Number(t.custo_combustivel) || 0) + (Number(t.custo_pedagio) || 0) + (Number(t.custo_manutencao) || 0) + (Number(t.custo_outros) || 0), 0);
      const despesa = despCombustivel + despManutencao + despViagem;
      months.push({ month: label.charAt(0).toUpperCase() + label.slice(1).replace('.', ''), receita, despesa, resultado: receita - despesa });
    }
    let saldo = 0;
    months.forEach(m => { saldo += m.resultado; m.saldo = saldo; });
    return months;
  }, [trips, fuelRecords, maintenanceRecords, period]);

  // ─── Alerts ───
  const allAlerts = useMemo(() => {
    const alerts = [...smartAlerts];
    if (stats.pendingPaymentsCount > 0) {
      alerts.push({
        id: 'payments-pending', level: 'warning', category: 'financeiro',
        title: `${stats.pendingPaymentsCount} pagamento${stats.pendingPaymentsCount > 1 ? 's' : ''} pendente${stats.pendingPaymentsCount > 1 ? 's' : ''}`,
        detail: `Total: ${formatCurrency(stats.pendingAmount)}`, action: 'stock',
      });
    }
    return alerts;
  }, [smartAlerts, stats.pendingPaymentsCount, stats.pendingAmount]);

  const criticalCount = allAlerts.filter(a => a.level === 'critical').length;
  const warningCount = allAlerts.filter(a => a.level === 'warning').length;

  // Fleet status indicators
  const availColor = stats.fleetAvailability >= 80 ? '#10B981' : stats.fleetAvailability >= 50 ? '#F59E0B' : '#EF4444';
  const trendPeriodLabel = { daily: 'vs ontem', weekly: 'vs semana anterior', monthly: 'vs mês anterior', yearly: 'vs ano anterior' }[period] || 'vs período anterior';

  // Map trips
  const mapTrips = useMemo(() => (trips || [])
    .filter(t => t.status !== 'finalizada')
    .map(t => ({
      ...t,
      origem_cidade: t.origem_cidade || t.fornecedores?.cidade,
      origem_estado: t.origem_estado || t.fornecedores?.estado,
      destino_cidade: t.destino_cidade || t.clientes?.cidade,
      destino_estado: t.destino_estado || t.clientes?.estado,
    }))
    .filter(t => t.origem_cidade || t.destino_cidade), [trips]);

  // Cashflow totals
  const totalReceita = cashflowData.reduce((s, d) => s + d.receita, 0);
  const totalDespesa = cashflowData.reduce((s, d) => s + d.despesa, 0);
  const totalResultado = totalReceita - totalDespesa;
  const saldoFinal = cashflowData[cashflowData.length - 1]?.saldo || 0;

  const periodSelector = (
    <div>
      <p className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider mb-3">
        Período de referência
      </p>
      <div className="flex gap-2">
        {PERIOD_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => setPeriod(opt.value)}
            className={`flex-1 rounded-lg px-2 py-1.5 text-xs sm:px-3 sm:py-2 sm:text-sm font-medium transition-all duration-200 ${
              period === opt.value
                ? 'bg-[var(--color-accent)] text-white shadow-sm'
                : 'bg-[var(--color-bg)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] border border-[var(--color-border)]'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════
  // RENDER — Centro de Comando Layout
  // ═══════════════════════════════════════════════
  return (
    <div className="space-y-5">
      {/* ── Command Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[var(--color-text)]">Centro de Comando</h1>
          <p className="mt-0.5 text-sm text-[var(--color-text-secondary)]">
            Visão operacional — {periodLabel}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Inline period selector */}
          <div className="flex rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-0.5">
            {PERIOD_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setPeriod(opt.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-150 ${
                  period === opt.value
                    ? 'bg-[var(--color-accent)] text-white'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <SectionCustomizerButton onClick={() => setShowCustomize(true)} />
        </div>
      </div>

      {/* ── Fleet Status Strip ── */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 py-2.5">
        <StatusPill
          icon={Truck} label="Frota"
          value={`${stats.activeTrucks - stats.trucksInMaintenance}/${stats.activeTrucks}`}
          color={availColor}
          sub={stats.trucksInMaintenance > 0 ? `${stats.trucksInMaintenance} em manut.` : 'Todos disponíveis'}
        />
        <div className="h-4 w-px bg-[var(--color-border)] hidden sm:block" />
        <StatusPill
          icon={Route} label="Viagens"
          value={`${stats.activeTrips} ativa${stats.activeTrips !== 1 ? 's' : ''}`}
          color="#06B6D4"
          sub={`${stats.completedTrips} finalizada${stats.completedTrips !== 1 ? 's' : ''}`}
        />
        <div className="h-4 w-px bg-[var(--color-border)] hidden sm:block" />
        <StatusPill
          icon={Bell} label="Alertas"
          value={allAlerts.length === 0 ? 'Nenhum' : `${allAlerts.length}`}
          color={criticalCount > 0 ? '#EF4444' : warningCount > 0 ? '#F59E0B' : '#10B981'}
          sub={criticalCount > 0 ? `${criticalCount} crítico${criticalCount > 1 ? 's' : ''}` : 'Sob controle'}
        />
        <div className="h-4 w-px bg-[var(--color-border)] hidden sm:block" />
        <StatusPill
          icon={DollarSign} label="Gasto"
          value={formatCurrency(stats.totalCost)}
          color={stats.totalCostTrend > 0 ? '#EF4444' : '#10B981'}
          sub={periodLabel}
        />

        {/* Quick actions */}
        <div className="ml-auto hidden lg:flex items-center gap-1.5">
          {QUICK_ACTIONS.map(a => (
            <button
              key={a.nav}
              onClick={() => onNavigate(a.nav)}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] transition-colors"
            >
              <Plus className="h-3 w-3" />
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main Grid: 2 columns on desktop ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Left: Main content (2/3) */}
        <div className="lg:col-span-2 space-y-5">

          {/* KPI Row */}
          {isVisible('kpis') && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Hero KPI: Custo/km */}
              <Card className="col-span-2 relative overflow-hidden">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: `${CHART_COLORS.accent}18` }}>
                          <DollarSign className="h-4 w-4" style={{ color: CHART_COLORS.accent }} />
                        </div>
                        <p className="text-[10px] sm:text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Custo por KM</p>
                      </div>
                      <p className="text-2xl sm:text-3xl font-bold text-[var(--color-text)] tabular-nums">
                        {stats.costPerKm > 0 ? formatCurrency(stats.costPerKm) : '—'}
                      </p>
                      <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                        {stats.totalKm > 0 ? `${formatNumber(stats.totalKm, 0)} km rodados` : 'Sem km registrados'}
                      </p>
                    </div>
                    <div className="text-right">
                      {stats.costPerKm > 0 && isFinite(stats.costPerKmTrend) && (
                        <div
                          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium"
                          style={{
                            backgroundColor: `${stats.costPerKmTrend < 0 ? '#10B981' : '#EF4444'}15`,
                            color: stats.costPerKmTrend < 0 ? '#10B981' : '#EF4444'
                          }}
                        >
                          {stats.costPerKmTrend < 0 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                          <span>{Math.abs(stats.costPerKmTrend).toFixed(1)}%</span>
                        </div>
                      )}
                      <p className="text-[10px] text-[var(--color-text-secondary)] mt-1">{trendPeriodLabel}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Secondary KPIs */}
              <KpiCard
                title="km / Litro"
                value={stats.kmPerLiter > 0 ? stats.kmPerLiter.toFixed(2) : '—'}
                unit="km/l"
                icon={Droplets}
                color={CHART_COLORS.green}
                trend={stats.kmPerLiter > 0 ? stats.kmPerLiterTrend : null}
                trendLabel={stats.totalLitros > 0 ? `${formatNumber(stats.totalLitros, 0)} L` : null}
              />
              <KpiCard
                title="Disponibilidade"
                value={`${stats.fleetAvailability.toFixed(0)}%`}
                icon={Zap}
                color={availColor}
                trend={null}
                trendLabel={stats.trucksInMaintenance > 0 ? `${stats.trucksInMaintenance} em manut.` : '100% operando'}
              />
            </div>
          )}

          {/* Gasto Total + Stats */}
          {isVisible('main_stats') && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Card className="col-span-2 cursor-pointer hover:border-[var(--color-border-hover)]" onClick={() => onNavigate('reports')}>
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] sm:text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                        Gasto Total — {periodLabel}
                      </p>
                      <p className="text-2xl font-bold text-[var(--color-text)] mt-1">{formatCurrency(stats.totalCost)}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-[var(--color-text-secondary)]">
                        <span className="flex items-center gap-1"><Fuel className="h-3 w-3 text-[var(--color-accent)]" />{formatCurrency(stats.fuelCost)}</span>
                        <span className="text-[var(--color-border)]">|</span>
                        <span className="flex items-center gap-1"><Wrench className="h-3 w-3 text-[#34D399]" />{formatCurrency(stats.maintenanceCost)}</span>
                      </div>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                      <DollarSign className="h-5 w-5 text-emerald-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card onClick={() => onNavigate('trucks')}>
                <CardContent className="p-4">
                  <p className="text-[10px] font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Caminhões</p>
                  <p className="text-lg font-bold text-[var(--color-text)] mt-1">{stats.activeTrucks}</p>
                  <p className="text-[11px] text-[var(--color-text-secondary)]">Na frota</p>
                </CardContent>
              </Card>
              <Card onClick={() => onNavigate('fuel')}>
                <CardContent className="p-4">
                  <p className="text-[10px] font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">KM Rodado</p>
                  <p className="text-lg font-bold text-[var(--color-text)] mt-1">{formatNumber(stats.totalKm, 0)}</p>
                  <p className="text-[11px] text-[var(--color-text-secondary)]">{periodLabel}</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Cashflow — full width, most important chart */}
          {isVisible('cashflow') && cashflowData.some(d => d.receita > 0 || d.despesa > 0) && (
            <Card>
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--color-text)]">Fluxo de Caixa</h3>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{period === 'yearly' ? '12 meses' : '6 meses'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-[10px] text-[var(--color-text-secondary)] uppercase">Saldo</p>
                      <p className={`text-base font-bold ${saldoFinal >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {formatCurrency(saldoFinal)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mini totals */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-center">
                    <p className="text-[10px] text-emerald-400/70 uppercase">Receita</p>
                    <p className="text-sm font-bold text-emerald-400">{formatCurrency(totalReceita)}</p>
                  </div>
                  <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-center">
                    <p className="text-[10px] text-red-400/70 uppercase">Despesas</p>
                    <p className="text-sm font-bold text-red-400">{formatCurrency(totalDespesa)}</p>
                  </div>
                  <div className={`rounded-lg ${totalResultado >= 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'} border px-3 py-2 text-center`}>
                    <p className={`text-[10px] ${totalResultado >= 0 ? 'text-emerald-400/70' : 'text-red-400/70'} uppercase`}>Resultado</p>
                    <p className={`text-sm font-bold ${totalResultado >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{formatCurrency(totalResultado)}</p>
                  </div>
                </div>

                <div className="h-[200px] sm:h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={cashflowData} barGap={2}>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                      <XAxis dataKey="month" stroke={axisColor} style={{ fontSize: '11px', fontFamily: '"JetBrains Mono"' }} />
                      <YAxis stroke={axisColor} style={{ fontSize: '11px', fontFamily: '"JetBrains Mono"' }} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
                      <Tooltip contentStyle={tooltipStyle} formatter={(v, name) => [formatCurrency(v), name]} />
                      <Legend wrapperStyle={{ paddingTop: '8px', fontFamily: '"Inter"', fontSize: '11px' }} />
                      <Bar dataKey="receita" name="Receita" fill="#10B981" radius={[3, 3, 0, 0]} maxBarSize={36} />
                      <Bar dataKey="despesa" name="Despesas" fill="#EF4444" radius={[3, 3, 0, 0]} maxBarSize={36} />
                      <Line type="monotone" dataKey="saldo" name="Saldo" stroke="#28633D" strokeWidth={2.5} dot={{ fill: '#28633D', r: 3, strokeWidth: 0 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Charts row: Gastos + Distribuição */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {isVisible('spending_chart') && (
              <Card onClick={() => onNavigate('reports')}>
                <CardContent className="p-4 sm:p-5">
                  <div className="mb-3">
                    <h3 className="text-sm font-semibold text-[var(--color-text)]">Gastos — {spendingChartTitle}</h3>
                  </div>
                  {spendingChartData.some(d => d.combustivel > 0 || d.manutencao > 0) ? (
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={spendingChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                          <XAxis dataKey="month" stroke={axisColor} style={{ fontSize: '10px', fontFamily: '"JetBrains Mono"' }} />
                          <YAxis stroke={axisColor} style={{ fontSize: '10px', fontFamily: '"JetBrains Mono"' }} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
                          <Tooltip contentStyle={tooltipStyle} formatter={v => formatCurrency(v)} />
                          <Line type="monotone" dataKey="combustivel" name="Combustível" stroke={CHART_COLORS.accent} strokeWidth={2} dot={{ fill: CHART_COLORS.accent, r: 2.5, strokeWidth: 0 }} />
                          <Line type="monotone" dataKey="manutencao" name="Manutenção" stroke={CHART_COLORS.secondary} strokeWidth={2} dot={{ fill: CHART_COLORS.secondary, r: 2.5, strokeWidth: 0 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="flex h-[200px] items-center justify-center">
                      <p className="text-sm text-[var(--color-text-secondary)]">Sem dados</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {isVisible('cost_distribution') && (
              <Card>
                <CardContent className="p-4 sm:p-5">
                  <div className="mb-3">
                    <h3 className="text-sm font-semibold text-[var(--color-text)]">Distribuição de Custos</h3>
                  </div>
                  {costDistributionData.some(d => d.value > 0) ? (
                    <>
                      <div className="h-[160px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={costDistributionData} cx="50%" cy="50%" labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={70} fill="#8884d8" dataKey="value" stroke={isDark ? '#0a0a0c' : '#fff'} strokeWidth={2}>
                              {costDistributionData.map((entry, i) => (
                                <Cell key={`cell-${i}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={tooltipStyle} formatter={v => formatCurrency(v)} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div className="flex items-center gap-2 rounded-lg bg-[var(--color-surface)] p-2 cursor-pointer" onClick={() => onNavigate('fuel')}>
                          <Fuel className="h-3.5 w-3.5 text-[var(--color-accent)]" />
                          <div>
                            <p className="text-[10px] text-[var(--color-text-secondary)]">Combustível</p>
                            <p className="text-xs font-semibold text-[var(--color-text)]">{formatCurrency(stats.fuelCost)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 rounded-lg bg-[var(--color-surface)] p-2 cursor-pointer" onClick={() => onNavigate('maintenance')}>
                          <Wrench className="h-3.5 w-3.5 text-[#34D399]" />
                          <div>
                            <p className="text-[10px] text-[var(--color-text-secondary)]">Manutenção</p>
                            <p className="text-xs font-semibold text-[var(--color-text)]">{formatCurrency(stats.maintenanceCost)}</p>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex h-[200px] items-center justify-center">
                      <p className="text-sm text-[var(--color-text-secondary)]">Sem dados</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Bottom row: Top trucks + Client profitability */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {isVisible('top_trucks') && topTrucksData.length > 0 && (
              <Card onClick={() => onNavigate('trucks')}>
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-[var(--color-text)]">Top Veículos — Custo</h3>
                    <ChevronRight className="h-4 w-4 text-[var(--color-text-secondary)]" />
                  </div>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topTrucksData}>
                        <defs>
                          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={CHART_COLORS.accent} stopOpacity={1} />
                            <stop offset="100%" stopColor={CHART_COLORS.secondary} stopOpacity={1} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                        <XAxis dataKey="truck" stroke={axisColor} style={{ fontSize: '10px', fontFamily: '"JetBrains Mono"' }} />
                        <YAxis stroke={axisColor} style={{ fontSize: '10px', fontFamily: '"JetBrains Mono"' }} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
                        <Tooltip contentStyle={tooltipStyle} formatter={v => formatCurrency(v)} />
                        <Bar dataKey="gasto" name="Gasto Total" fill="url(#barGradient)" radius={[4, 4, 0, 0]} maxBarSize={48} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {isVisible('client_profitability') && clientProfitData.length > 0 && (
              <Card onClick={() => onNavigate('clients')}>
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-[var(--color-text)]">Rentabilidade por Cliente</h3>
                    <ChevronRight className="h-4 w-4 text-[var(--color-text-secondary)]" />
                  </div>
                  <div className="space-y-3">
                    {clientProfitData.map((c, i) => {
                      const maxReceita = clientProfitData[0]?.receita || 1;
                      const barWidth = Math.max(5, (c.receita / maxReceita) * 100);
                      return (
                        <div key={i} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-[var(--color-text)] truncate max-w-[45%]">{c.nome}</span>
                            <span className={`text-xs font-semibold tabular-nums ${c.lucro >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {formatCurrency(c.lucro)} ({c.margem.toFixed(0)}%)
                            </span>
                          </div>
                          <div className="h-1.5 rounded-full bg-[var(--color-surface)] overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${barWidth}%`,
                                background: c.lucro >= 0
                                  ? `linear-gradient(90deg, ${CHART_COLORS.green}, ${CHART_COLORS.accent})`
                                  : `linear-gradient(90deg, ${CHART_COLORS.red}, ${CHART_COLORS.orange})`
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Fleet Map */}
          {isVisible('fleet_map') && mapTrips.length > 0 && (
            <Card>
              <CardContent className="p-4 sm:p-5">
                <h3 className="mb-3 text-sm font-semibold text-[var(--color-text)]">
                  Viagens Ativas ({mapTrips.length})
                </h3>
                <MiniMapView trips={mapTrips} height="260px" />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Sidebar: Alerts + Operations (1/3) */}
        <div className="space-y-5">

          {/* Alerts Panel */}
          {isVisible('alerts') && allAlerts.length > 0 && (
            <Card className="border-l-2" style={{ borderLeftColor: criticalCount > 0 ? '#EF4444' : warningCount > 0 ? '#F59E0B' : '#10B981' }}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-[var(--color-text-secondary)]" />
                    <span className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                      Alertas
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {criticalCount > 0 && (
                      <span className="text-[10px] font-medium text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded-md">
                        {criticalCount}
                      </span>
                    )}
                    {warningCount > 0 && (
                      <span className="text-[10px] font-medium text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-md">
                        {warningCount}
                      </span>
                    )}
                  </div>
                </div>
                <div className="space-y-1.5">
                  {allAlerts.slice(0, 10).map(alert => {
                    const isC = alert.level === 'critical';
                    const isW = alert.level === 'warning';
                    const Icon = isC ? AlertCircle : isW ? AlertTriangle : Bell;
                    const textColor = isC ? 'text-red-400' : isW ? 'text-amber-400' : 'text-blue-400';
                    const bgColor = isC ? 'bg-red-500/5 hover:bg-red-500/10' : isW ? 'bg-amber-500/5 hover:bg-amber-500/10' : 'bg-blue-500/5 hover:bg-blue-500/10';
                    return (
                      <div
                        key={alert.id}
                        className={`flex items-start gap-2.5 rounded-lg ${bgColor} px-3 py-2.5 cursor-pointer transition-colors`}
                        onClick={() => alert.action && onNavigate(alert.action)}
                      >
                        <Icon className={`h-4 w-4 ${textColor} shrink-0 mt-0.5`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-medium ${textColor} leading-tight`}>{alert.title}</p>
                          <p className="text-[10px] text-[var(--color-text-secondary)] mt-0.5 truncate">{alert.detail}</p>
                        </div>
                      </div>
                    );
                  })}
                  {allAlerts.length > 10 && (
                    <p className="text-[10px] text-center text-[var(--color-text-secondary)] pt-1">
                      +{allAlerts.length - 10} mais
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Operations grid */}
          {isVisible('operations') && (
            <div className="grid grid-cols-2 gap-2">
              <MiniStatCard label="Motoristas" value={stats.totalDrivers} icon={Users} color="#34D399" onClick={() => onNavigate('drivers')} />
              <MiniStatCard label="Clientes" value={stats.totalClients} icon={Building2} color="#06B6D4" onClick={() => onNavigate('clients')} />
              <MiniStatCard label="Fornecedores" value={stats.totalSuppliers} icon={Factory} color="#F97316" onClick={() => onNavigate('suppliers')} />
              <MiniStatCard label="Estoque" value={`${formatNumber(stats.totalSacas, 0)}sc`} icon={Warehouse} color="#EF4444" onClick={() => onNavigate('stock')} />
            </div>
          )}

          {/* Freight summary */}
          {isVisible('freight_summary') && stats.totalTrips > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-3">Resumo Financeiro</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between cursor-pointer hover:opacity-80" onClick={() => onNavigate('trips')}>
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15">
                        <Route className="h-3.5 w-3.5 text-emerald-400" />
                      </div>
                      <span className="text-xs text-[var(--color-text-secondary)]">Total Frete</span>
                    </div>
                    <span className="text-sm font-bold text-[var(--color-text)]">{formatCurrency(stats.totalFreight)}</span>
                  </div>
                  <div className="flex items-center justify-between cursor-pointer hover:opacity-80" onClick={() => onNavigate('stock')}>
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/15">
                        <Package className="h-3.5 w-3.5 text-blue-400" />
                      </div>
                      <span className="text-xs text-[var(--color-text-secondary)]">Estoque</span>
                    </div>
                    <span className="text-sm font-bold text-[var(--color-text)]">{formatCurrency(stats.totalStockValue)}</span>
                  </div>
                  <div className="flex items-center justify-between cursor-pointer hover:opacity-80" onClick={() => onNavigate('stock')}>
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ backgroundColor: stats.pendingAmount > 0 ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)' }}>
                        <DollarSign className="h-3.5 w-3.5" style={{ color: stats.pendingAmount > 0 ? '#EF4444' : '#10B981' }} />
                      </div>
                      <span className="text-xs text-[var(--color-text-secondary)]">A Pagar</span>
                    </div>
                    <span className="text-sm font-bold" style={{ color: stats.pendingAmount > 0 ? '#EF4444' : 'var(--color-text)' }}>
                      {formatCurrency(stats.pendingAmount)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Custo / Saca KPI */}
          {isVisible('kpis') && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Package className="h-4 w-4 text-[#34D399]" />
                  <span className="text-[10px] font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Custo / Saca</span>
                </div>
                <p className="text-xl font-bold text-[var(--color-text)]">
                  {stats.costPerSaca > 0 ? formatCurrency(stats.costPerSaca) : '—'}
                </p>
                <p className="text-[10px] text-[var(--color-text-secondary)] mt-0.5">
                  {stats.totalSacas > 0 ? `${formatNumber(stats.totalSacas, 0)} sacas` : 'Sem sacas'}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Mobile quick actions */}
          <div className="lg:hidden">
            <p className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">Ações Rápidas</p>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_ACTIONS.map(a => {
                const AIcon = a.icon;
                return (
                  <button
                    key={a.nav}
                    onClick={() => onNavigate(a.nav)}
                    className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-3 text-left hover:border-[var(--color-border-hover)] transition-colors"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ backgroundColor: `${a.color}18` }}>
                      <AIcon className="h-3.5 w-3.5" style={{ color: a.color }} />
                    </div>
                    <span className="text-xs font-medium text-[var(--color-text)]">{a.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Section Customizer Modal */}
      <SectionCustomizerModal
        isOpen={showCustomize}
        onClose={() => setShowCustomize(false)}
        title="Personalizar Dashboard"
        sections={DASHBOARD_SECTIONS}
        prefs={prefs}
        moveUp={moveUp}
        moveDown={moveDown}
        toggleVisibility={toggleVisibility}
        reset={reset}
        extraControls={periodSelector}
      />
    </div>
  );
}

// ─── Sub-components ───

function StatusPill({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="flex items-center gap-2 py-0.5 pr-3">
      <div className="flex h-6 w-6 items-center justify-center rounded-md" style={{ backgroundColor: `${color}18` }}>
        <Icon className="h-3.5 w-3.5" style={{ color }} />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-[var(--color-text)] tabular-nums">{value}</span>
          <span className="text-[10px] text-[var(--color-text-secondary)] hidden sm:inline">{label}</span>
        </div>
        {sub && <p className="text-[10px] text-[var(--color-text-secondary)] leading-tight truncate">{sub}</p>}
      </div>
    </div>
  );
}

function MiniStatCard({ label, value, icon: Icon, color, onClick }) {
  return (
    <Card onClick={onClick}>
      <CardContent className="p-3">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 shrink-0" style={{ color, opacity: 0.7 }} />
          <div className="min-w-0">
            <p className="text-sm font-bold text-[var(--color-text)] tabular-nums">{value}</p>
            <p className="text-[10px] text-[var(--color-text-secondary)] truncate">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
