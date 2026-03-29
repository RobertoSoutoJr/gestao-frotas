import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { useSectionPrefs, SectionCustomizerButton, SectionCustomizerModal } from '../components/ui/SectionCustomizer';
import { Truck, Users, Gauge, DollarSign, Fuel, Wrench, ArrowRight, Building2, Factory, Route, Warehouse, Package, AlertCircle, AlertTriangle, TrendingUp, TrendingDown, Minus, Activity, Droplets, Zap, Bell, Wallet } from 'lucide-react';
import { useSmartAlerts } from '../hooks/useSmartAlerts';
import { useNotifications } from '../hooks/useNotifications';
import { MiniMapView } from '../components/ui/MapView';
import { formatCurrency, formatNumber } from '../lib/utils';
import { useTheme } from '../contexts/ThemeContext';
import {
  LineChart, Line, BarChart, Bar, ComposedChart, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

function StatCard({ title, value, icon: Icon, color, subtitle, onClick }) {
  return (
    <Card
      className="relative overflow-hidden group hover:-translate-y-0.5 transition-all duration-200"
      onClick={onClick}
    >
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1 sm:space-y-1.5 flex-1">
            <p className="text-[10px] sm:text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
              {title}
            </p>
            <p className="text-lg sm:text-2xl font-bold text-[var(--color-text)]">
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-[var(--color-text-secondary)]">{subtitle}</p>
            )}
          </div>
          <div
            className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${color}18` }}
          >
            <Icon className="h-5 w-5" style={{ color }} />
          </div>
        </div>
        {onClick && (
          <div className="mt-3 flex items-center gap-1 text-xs text-[var(--color-accent)] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <span>Ver detalhes</span>
            <ArrowRight className="h-3 w-3" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

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
  accent:    '#5E6AD2',
  secondary: '#8B5CF6',
  green:     '#10B981',
  orange:    '#F59E0B',
  red:       '#EF4444',
  pink:      '#EC4899',
};

const DASHBOARD_SECTIONS = [
  { id: 'alerts', label: 'Alertas Inteligentes', description: 'Documentos, manutencao, consumo e pagamentos', icon: Bell },
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
  kpis: true,
  main_stats: true,
  operations: true,
  alerts: true,
  freight_summary: true,
  spending_chart: true,
  cost_distribution: true,
  top_trucks: true,
  cashflow: true,
  client_profitability: true,
  fleet_map: true
};

const PERIOD_OPTIONS = [
  { value: 'daily', label: 'Hoje' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'monthly', label: 'Mensal' },
  { value: 'yearly', label: 'Anual' }
];

export function DashboardPage({ trucks, drivers, clients, suppliers, trips, stockRecords, fuelRecords, maintenanceRecords, onNavigate }) {
  const { isDark } = useTheme();
  const [showCustomize, setShowCustomize] = useState(false);
  const smartAlerts = useSmartAlerts({ trucks, drivers, fuelRecords, maintenanceRecords, trips });
  useNotifications(smartAlerts);

  const { prefs, setPrefs, isVisible, getOrder, moveUp, moveDown, toggleVisibility, reset } = useSectionPrefs(
    'dashboard_prefs_v2', DEFAULT_ORDER, DEFAULT_VISIBILITY
  );

  // Period state (stored inside prefs.extra)
  const period = prefs.period || 'monthly';
  const setPeriod = (p) => setPrefs(prev => ({ ...prev, period: p }));

  const periodLabel = PERIOD_OPTIONS.find(p => p.value === period)?.label || 'Mensal';

  const filterByPeriod = useCallback((records, dateField = 'created_at') => {
    const now = new Date();
    return records.filter(r => {
      const d = new Date(r[dateField] || r.created_at);
      switch (period) {
        case 'daily':
          return d.toDateString() === now.toDateString();
        case 'weekly': {
          const weekAgo = new Date(now);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return d >= weekAgo;
        }
        case 'monthly':
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        case 'yearly':
          return d.getFullYear() === now.getFullYear();
        default:
          return true;
      }
    });
  }, [period]);

  const filterByPreviousPeriod = useCallback((records, dateField = 'created_at') => {
    const now = new Date();
    return records.filter(r => {
      const d = new Date(r[dateField] || r.created_at);
      switch (period) {
        case 'daily': {
          const yesterday = new Date(now);
          yesterday.setDate(yesterday.getDate() - 1);
          return d.toDateString() === yesterday.toDateString();
        }
        case 'weekly': {
          const twoWeeksAgo = new Date(now);
          twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
          const oneWeekAgo = new Date(now);
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          return d >= twoWeeksAgo && d < oneWeekAgo;
        }
        case 'monthly': {
          const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          return d.getMonth() === prevMonth.getMonth() && d.getFullYear() === prevMonth.getFullYear();
        }
        case 'yearly':
          return d.getFullYear() === now.getFullYear() - 1;
        default:
          return false;
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

    // KPI calculations
    const costPerKm = totalKm > 0 ? totalCost / totalKm : 0;
    const kmPerLiter = totalLitros > 0 ? totalKm / totalLitros : 0;
    const costPerSaca = totalSacas > 0 ? totalCost / totalSacas : 0;

    // Fleet availability: trucks NOT in active maintenance (pendente or em_andamento)
    const allTrucks = trucks.filter(t => t.placa).length;
    const trucksInMaintenance = new Set(
      periodMaintenance
        .filter(m => m.status === 'pendente' || m.status === 'em_andamento')
        .map(m => m.caminhao_id)
    ).size;
    const fleetAvailability = allTrucks > 0 ? ((allTrucks - trucksInMaintenance) / allTrucks) * 100 : 100;

    // Previous period for trend comparison
    const prevFuel = filterByPreviousPeriod(fuelRecords, 'created_at');
    const prevMaintenance = filterByPreviousPeriod(maintenanceRecords, 'data_manutencao');
    const prevFuelCost = prevFuel.reduce((s, r) => s + (Number(r.valor_total) || 0), 0);
    const prevMaintenanceCost = prevMaintenance.reduce((s, r) => s + (Number(r.valor_total) || 0), 0);
    const prevTotalCost = prevFuelCost + prevMaintenanceCost;
    const prevKm = prevFuel.reduce((s, r) => s + (Number(r.km_registro) || 0), 0);
    const prevLitros = prevFuel.reduce((s, r) => s + (Number(r.litros) || 0), 0);
    const prevSacas = (stockRecords || []).reduce((s, r) => s + (Number(r.quantidade_sacas) || 0), 0); // stock is cumulative

    const prevCostPerKm = prevKm > 0 ? prevTotalCost / prevKm : 0;
    const prevKmPerLiter = prevLitros > 0 ? prevKm / prevLitros : 0;

    const calcTrend = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    return {
      activeTrucks: allTrucks,
      totalDrivers: (drivers || []).length,
      totalClients: (clients || []).length,
      totalSuppliers: (suppliers || []).length,
      totalCost,
      totalKm,
      totalLitros,
      fuelCost: totalFuelCost,
      maintenanceCost: totalMaintenanceCost,
      activeTrips,
      completedTrips,
      totalTrips: (trips || []).length,
      totalFreight,
      totalStockValue,
      pendingAmount,
      pendingPaymentsCount: pendingPayments.length,
      totalSacas,
      // KPIs
      costPerKm,
      kmPerLiter,
      costPerSaca,
      fleetAvailability,
      trucksInMaintenance,
      // Trends
      costPerKmTrend: calcTrend(costPerKm, prevCostPerKm),
      kmPerLiterTrend: calcTrend(kmPerLiter, prevKmPerLiter),
      totalCostTrend: calcTrend(totalCost, prevTotalCost),
    };
  }, [trucks, drivers, clients, suppliers, trips, stockRecords, fuelRecords, maintenanceRecords, filterByPeriod, filterByPreviousPeriod]);

  const spendingChartData = useMemo(() => {
    const now = new Date();
    const dataPoints = [];

    if (period === 'daily') {
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
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
    } else if (period === 'yearly') {
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const month = date.getMonth(); const year = date.getFullYear();
        const monthName = date.toLocaleDateString('pt-BR', { month: 'short' });
        const fuelCost = fuelRecords.filter(r => { const d = new Date(r.created_at); return d.getMonth() === month && d.getFullYear() === year; }).reduce((s, r) => s + (Number(r.valor_total) || 0), 0);
        const maintenanceCost = maintenanceRecords.filter(r => { const d = new Date(r.data_manutencao || r.created_at); return d.getMonth() === month && d.getFullYear() === year; }).reduce((s, r) => s + (Number(r.valor_total) || 0), 0);
        dataPoints.push({ month: monthName.charAt(0).toUpperCase() + monthName.slice(1), combustivel: fuelCost, manutencao: maintenanceCost, total: fuelCost + maintenanceCost });
      }
    } else {
      for (let i = 5; i >= 0; i--) {
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
      case 'daily': return 'Gastos — Últimos 7 dias';
      case 'weekly': return 'Gastos — Últimas 4 semanas';
      case 'yearly': return 'Gastos — Últimos 12 meses';
      default: return 'Gastos — Últimos 6 meses';
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

  // Cashflow data: receita (frete) vs despesas (combustivel + manutencao + custos viagem) por mes
  const cashflowData = useMemo(() => {
    const now = new Date();
    const months = [];
    const monthCount = period === 'yearly' ? 12 : 6;

    for (let i = monthCount - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = date.getMonth();
      const year = date.getFullYear();
      const label = date.toLocaleDateString('pt-BR', { month: 'short' });

      // Receita: frete de viagens finalizadas nesse mes
      const receita = (trips || [])
        .filter(t => {
          if (t.status !== 'finalizada') return false;
          const d = new Date(t.data_finalizacao || t.updated_at || t.created_at);
          return d.getMonth() === month && d.getFullYear() === year;
        })
        .reduce((s, t) => s + (Number(t.valor_total_frete) || 0), 0);

      // Despesas: combustivel + manutencao + custos de viagem
      const despCombustivel = fuelRecords
        .filter(r => { const d = new Date(r.created_at); return d.getMonth() === month && d.getFullYear() === year; })
        .reduce((s, r) => s + (Number(r.valor_total) || 0), 0);

      const despManutencao = maintenanceRecords
        .filter(r => { const d = new Date(r.data_manutencao || r.created_at); return d.getMonth() === month && d.getFullYear() === year; })
        .reduce((s, r) => s + (Number(r.valor_total) || 0), 0);

      const despViagem = (trips || [])
        .filter(t => {
          if (t.status !== 'finalizada') return false;
          const d = new Date(t.data_finalizacao || t.updated_at || t.created_at);
          return d.getMonth() === month && d.getFullYear() === year;
        })
        .reduce((s, t) =>
          s + (Number(t.custo_combustivel) || 0) + (Number(t.custo_pedagio) || 0) +
          (Number(t.custo_manutencao) || 0) + (Number(t.custo_outros) || 0), 0);

      const despesa = despCombustivel + despManutencao + despViagem;
      const resultado = receita - despesa;

      months.push({
        month: label.charAt(0).toUpperCase() + label.slice(1).replace('.', ''),
        receita,
        despesa,
        resultado,
      });
    }

    // Saldo acumulado
    let saldo = 0;
    months.forEach(m => {
      saldo += m.resultado;
      m.saldo = saldo;
    });

    return months;
  }, [trips, fuelRecords, maintenanceRecords, period]);

  const periodSubtitleMap = { daily: 'Hoje', weekly: 'Esta semana', monthly: 'Este mês', yearly: 'Este ano' };
  const periodSubtitle = periodSubtitleMap[period] || 'Este mês';

  // Section renderers
  const sectionRenderers = {
    alerts: () => {
      // Combine smart alerts with payment alerts
      const allAlerts = [...smartAlerts];

      if (stats.pendingPaymentsCount > 0) {
        allAlerts.push({
          id: 'payments-pending',
          level: 'warning',
          category: 'financeiro',
          title: `${stats.pendingPaymentsCount} pagamento${stats.pendingPaymentsCount > 1 ? 's' : ''} pendente${stats.pendingPaymentsCount > 1 ? 's' : ''}`,
          detail: `Total: ${formatCurrency(stats.pendingAmount)}`,
          action: 'stock',
        });
      }

      if (allAlerts.length === 0) return null;

      const levelStyles = {
        critical: {
          border: 'border-red-500/30',
          bg: 'bg-red-500/10',
          hoverBg: 'hover:bg-red-500/15',
          text: 'text-red-400',
          detailText: 'text-red-400/70',
          Icon: AlertCircle,
        },
        warning: {
          border: 'border-amber-500/30',
          bg: 'bg-amber-500/10',
          hoverBg: 'hover:bg-amber-500/15',
          text: 'text-amber-400',
          detailText: 'text-amber-400/70',
          Icon: AlertTriangle,
        },
        info: {
          border: 'border-blue-500/30',
          bg: 'bg-blue-500/10',
          hoverBg: 'hover:bg-blue-500/15',
          text: 'text-blue-400',
          detailText: 'text-blue-400/70',
          Icon: Bell,
        },
      };

      const criticalCount = allAlerts.filter(a => a.level === 'critical').length;
      const warningCount = allAlerts.filter(a => a.level === 'warning').length;

      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-[var(--color-text-secondary)]" />
              <span className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                Alertas ({allAlerts.length})
              </span>
            </div>
            <div className="flex items-center gap-2">
              {criticalCount > 0 && (
                <span className="text-[10px] font-medium text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">
                  {criticalCount} critico{criticalCount > 1 ? 's' : ''}
                </span>
              )}
              {warningCount > 0 && (
                <span className="text-[10px] font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                  {warningCount} aviso{warningCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
          {allAlerts.slice(0, 8).map(alert => {
            const style = levelStyles[alert.level] || levelStyles.info;
            const { Icon } = style;
            return (
              <div
                key={alert.id}
                className={`flex items-center gap-3 rounded-xl border ${style.border} ${style.bg} px-4 py-3 cursor-pointer ${style.hoverBg} transition-colors`}
                onClick={() => alert.action && onNavigate(alert.action)}
              >
                <Icon className={`h-5 w-5 ${style.text} shrink-0`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${style.text} truncate`}>{alert.title}</p>
                  <p className={`text-xs ${style.detailText} truncate`}>{alert.detail}</p>
                </div>
                <ArrowRight className={`h-4 w-4 ${style.text} shrink-0`} />
              </div>
            );
          })}
          {allAlerts.length > 8 && (
            <p className="text-xs text-center text-[var(--color-text-secondary)] pt-1">
              +{allAlerts.length - 8} alerta{allAlerts.length - 8 > 1 ? 's' : ''} adiciona{allAlerts.length - 8 > 1 ? 'is' : 'l'}
            </p>
          )}
        </div>
      );
    },

    kpis: () => {
      const hasKpiData = stats.totalKm > 0 || stats.totalLitros > 0 || stats.totalSacas > 0;
      if (!hasKpiData && stats.activeTrucks === 0) return null;

      const trendPeriodLabel = {
        daily: 'vs ontem',
        weekly: 'vs semana anterior',
        monthly: 'vs mês anterior',
        yearly: 'vs ano anterior',
      }[period] || 'vs período anterior';

      return (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
              Indicadores de Performance
            </h2>
            <span className="text-[10px] text-[var(--color-text-secondary)]">{trendPeriodLabel}</span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <KpiCard
              title="Custo / km"
              value={stats.costPerKm > 0 ? formatCurrency(stats.costPerKm) : '—'}
              icon={DollarSign}
              color={CHART_COLORS.accent}
              trend={stats.costPerKm > 0 ? stats.costPerKmTrend : null}
              invertTrend
              trendLabel={stats.totalKm > 0 ? `${formatNumber(stats.totalKm, 0)} km rodados` : 'Sem registros de km'}
            />
            <KpiCard
              title="km / Litro"
              value={stats.kmPerLiter > 0 ? stats.kmPerLiter.toFixed(2) : '—'}
              unit="km/l"
              icon={Droplets}
              color={CHART_COLORS.green}
              trend={stats.kmPerLiter > 0 ? stats.kmPerLiterTrend : null}
              trendLabel={stats.totalLitros > 0 ? `${formatNumber(stats.totalLitros, 0)} litros` : 'Sem registros de litros'}
            />
            <KpiCard
              title="Disponibilidade"
              value={`${stats.fleetAvailability.toFixed(0)}%`}
              icon={Zap}
              color={stats.fleetAvailability >= 80 ? '#10B981' : stats.fleetAvailability >= 50 ? '#F59E0B' : '#EF4444'}
              trend={null}
              trendLabel={stats.trucksInMaintenance > 0
                ? `${stats.trucksInMaintenance} em manutencao`
                : 'Nenhum em manutencao'}
            />
            <KpiCard
              title="Custo / Saca"
              value={stats.costPerSaca > 0 ? formatCurrency(stats.costPerSaca) : '—'}
              icon={Package}
              color={CHART_COLORS.orange}
              trend={null}
              trendLabel={stats.totalSacas > 0 ? `${formatNumber(stats.totalSacas, 0)} sacas` : 'Sem sacas registradas'}
            />
          </div>
        </div>
      );
    },

    main_stats: () => (
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard title="Caminhões Ativos" value={stats.activeTrucks} icon={Truck} color={CHART_COLORS.accent} subtitle="Total na frota" onClick={() => onNavigate('trucks')} />
        <StatCard title="Motoristas" value={stats.totalDrivers} icon={Users} color={CHART_COLORS.secondary} subtitle="Equipe cadastrada" onClick={() => onNavigate('drivers')} />
        <StatCard title={`Gasto — ${periodLabel}`} value={formatCurrency(stats.totalCost)} icon={DollarSign} color={CHART_COLORS.green} subtitle={`${formatCurrency(stats.fuelCost)} comb. + ${formatCurrency(stats.maintenanceCost)} man.`} onClick={() => onNavigate('reports')} />
        <StatCard title="KM Rodado" value={formatNumber(stats.totalKm, 0)} icon={Gauge} color={CHART_COLORS.orange} subtitle={periodSubtitle} onClick={() => onNavigate('fuel')} />
      </div>
    ),

    operations: () => (
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard title="Clientes" value={stats.totalClients} icon={Building2} color="#06B6D4" subtitle="Cadastrados" onClick={() => onNavigate('clients')} />
        <StatCard title="Fornecedores" value={stats.totalSuppliers} icon={Factory} color="#F97316" subtitle="Cadastrados" onClick={() => onNavigate('suppliers')} />
        <StatCard title="Viagens" value={stats.totalTrips} icon={Route} color={CHART_COLORS.green} subtitle={`${stats.activeTrips} em andamento · ${stats.completedTrips} finalizadas`} onClick={() => onNavigate('trips')} />
        <StatCard title="Estoque" value={`${formatNumber(stats.totalSacas, 0)} sacas`} icon={Warehouse} color={CHART_COLORS.red} subtitle={`${formatCurrency(stats.totalStockValue)} investido`} onClick={() => onNavigate('stock')} />
      </div>
    ),

    freight_summary: () => {
      if (stats.totalTrips <= 0) return null;
      return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="cursor-pointer hover:-translate-y-0.5 transition-all duration-200" onClick={() => onNavigate('trips')}>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15">
                  <Route className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-[var(--color-text-secondary)]">Total Frete</p>
                  <p className="text-lg font-bold text-[var(--color-text)]">{formatCurrency(stats.totalFreight)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:-translate-y-0.5 transition-all duration-200" onClick={() => onNavigate('stock')}>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15">
                  <Package className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-[var(--color-text-secondary)]">Valor em Estoque</p>
                  <p className="text-lg font-bold text-[var(--color-text)]">{formatCurrency(stats.totalStockValue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:-translate-y-0.5 transition-all duration-200" onClick={() => onNavigate('stock')}>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: stats.pendingAmount > 0 ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)' }}>
                  <DollarSign className="h-5 w-5" style={{ color: stats.pendingAmount > 0 ? '#EF4444' : '#10B981' }} />
                </div>
                <div>
                  <p className="text-xs text-[var(--color-text-secondary)]">Contas a Pagar</p>
                  <p className="text-lg font-bold" style={{ color: stats.pendingAmount > 0 ? '#EF4444' : 'var(--color-text)' }}>
                    {formatCurrency(stats.pendingAmount)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    },

    spending_chart: () => {
      const hasData = spendingChartData.some(d => d.combustivel > 0 || d.manutencao > 0);
      return (
      <Card className="transition-all duration-200" onClick={() => onNavigate('reports')}>
        <CardContent className="p-4 sm:p-6">
          <div className="mb-4 sm:mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-[var(--color-text)]">{spendingChartTitle}</h3>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">Evolução dos custos operacionais</p>
            </div>
            <ArrowRight className="h-4 w-4 text-[var(--color-text-secondary)] opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          {!hasData ? (
            <div className="flex h-[200px] sm:h-[280px] items-center justify-center">
              <p className="text-sm text-[var(--color-text-secondary)]">Sem dados para o período selecionado</p>
            </div>
          ) : (
          <div className="h-[200px] sm:h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={spendingChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="month" stroke={axisColor} style={{ fontSize: '11px', fontFamily: '"JetBrains Mono"' }} />
                <YAxis stroke={axisColor} style={{ fontSize: '11px', fontFamily: '"JetBrains Mono"' }} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={tooltipStyle} formatter={v => formatCurrency(v)} />
                <Legend wrapperStyle={{ paddingTop: '16px', fontFamily: '"Inter"', fontSize: '12px' }} iconType="plainline" />
                <Line type="monotone" dataKey="combustivel" name="Combustível" stroke={CHART_COLORS.accent} strokeWidth={2} dot={{ fill: CHART_COLORS.accent, r: 3, strokeWidth: 0 }} activeDot={{ r: 5, stroke: CHART_COLORS.accent, strokeWidth: 2, fill: isDark ? '#0a0a0c' : '#fff' }} />
                <Line type="monotone" dataKey="manutencao" name="Manutenção" stroke={CHART_COLORS.secondary} strokeWidth={2} dot={{ fill: CHART_COLORS.secondary, r: 3, strokeWidth: 0 }} activeDot={{ r: 5, stroke: CHART_COLORS.secondary, strokeWidth: 2, fill: isDark ? '#0a0a0c' : '#fff' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          )}
        </CardContent>
      </Card>
      );
    },

    cost_distribution: () => {
      const hasDistData = costDistributionData.some(d => d.value > 0);
      return (
      <Card className="transition-all duration-200">
        <CardContent className="p-4 sm:p-6">
          <div className="mb-4 sm:mb-6">
            <h3 className="text-sm sm:text-base font-semibold text-[var(--color-text)]">Distribuição de Custos</h3>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">Combustível vs Manutenção — {periodLabel}</p>
          </div>
          {!hasDistData ? (
            <div className="flex h-[200px] sm:h-[280px] items-center justify-center">
              <p className="text-sm text-[var(--color-text-secondary)]">Sem dados para o período selecionado</p>
            </div>
          ) : (
          <div className="h-[200px] sm:h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={costDistributionData} cx="50%" cy="50%" labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={90} fill="#8884d8" dataKey="value" stroke={isDark ? '#0a0a0c' : '#fff'} strokeWidth={2}>
                  {costDistributionData.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={v => formatCurrency(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          )}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Card className="!rounded-xl !p-0 cursor-pointer" onClick={() => onNavigate('fuel')}>
              <div className="flex items-center gap-2.5 p-3">
                <Fuel className="h-4 w-4 text-[var(--color-accent)]" />
                <div>
                  <p className="text-xs text-[var(--color-text-secondary)]">Combustível</p>
                  <p className="text-sm font-semibold text-[var(--color-text)]">{formatCurrency(stats.fuelCost)}</p>
                </div>
              </div>
            </Card>
            <Card className="!rounded-xl !p-0 cursor-pointer" onClick={() => onNavigate('maintenance')}>
              <div className="flex items-center gap-2.5 p-3">
                <Wrench className="h-4 w-4 text-[#8B5CF6]" />
                <div>
                  <p className="text-xs text-[var(--color-text-secondary)]">Manutenção</p>
                  <p className="text-sm font-semibold text-[var(--color-text)]">{formatCurrency(stats.maintenanceCost)}</p>
                </div>
              </div>
            </Card>
          </div>
        </CardContent>
      </Card>
      );
    },

    top_trucks: () => {
      if (topTrucksData.length === 0) {
        return (
          <Card>
            <CardContent className="p-6">
              <h3 className="text-base font-semibold text-[var(--color-text)] mb-4">Top 5 — Custo por Veículo</h3>
              <div className="flex h-[200px] items-center justify-center">
                <p className="text-sm text-[var(--color-text-secondary)]">Sem dados para o período selecionado</p>
              </div>
            </CardContent>
          </Card>
        );
      }
      return (
      <Card className="transition-all duration-200" onClick={() => onNavigate('trucks')}>
        <CardContent className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-[var(--color-text)]">Top 5 — Custo por Veículo</h3>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">Veículos com maior custo operacional — {periodLabel}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-[var(--color-text-secondary)]" />
          </div>
          <div className="h-[220px] sm:h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topTrucksData}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_COLORS.accent} stopOpacity={1} />
                    <stop offset="100%" stopColor={CHART_COLORS.secondary} stopOpacity={1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="truck" stroke={axisColor} style={{ fontSize: '11px', fontFamily: '"JetBrains Mono"' }} />
                <YAxis stroke={axisColor} style={{ fontSize: '11px', fontFamily: '"JetBrains Mono"' }} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={tooltipStyle} formatter={v => formatCurrency(v)} cursor={{ fill: isDark ? 'rgba(94,106,210,0.05)' : 'rgba(94,106,210,0.08)' }} />
                <Bar dataKey="gasto" name="Gasto Total" fill="url(#barGradient)" radius={[4, 4, 0, 0]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      );
    },

    fleet_map: () => {
      const mapTrips = (trips || [])
        .filter(t => t.status !== 'finalizada')
        .map(t => ({
          ...t,
          origem_cidade: t.origem_cidade || t.fornecedores?.cidade,
          origem_estado: t.origem_estado || t.fornecedores?.estado,
          destino_cidade: t.destino_cidade || t.clientes?.cidade,
          destino_estado: t.destino_estado || t.clientes?.estado,
        }))
        .filter(t => t.origem_cidade || t.destino_cidade);
      if (mapTrips.length === 0) return null;
      return (
        <Card>
          <CardContent className="p-4 sm:p-6">
            <h3 className="mb-3 text-sm sm:text-base font-semibold text-[var(--color-text)]">
              Viagens Ativas ({mapTrips.length})
            </h3>
            <MiniMapView trips={mapTrips} height="280px" />
          </CardContent>
        </Card>
      );
    },
    cashflow: () => {
      const hasData = cashflowData.some(d => d.receita > 0 || d.despesa > 0);
      if (!hasData) return null;

      const totalReceita = cashflowData.reduce((s, d) => s + d.receita, 0);
      const totalDespesa = cashflowData.reduce((s, d) => s + d.despesa, 0);
      const totalResultado = totalReceita - totalDespesa;
      const saldoFinal = cashflowData[cashflowData.length - 1]?.saldo || 0;

      return (
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="mb-4 sm:mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-[var(--color-text)]">Fluxo de Caixa</h3>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1">Receita vs despesas — {period === 'yearly' ? '12 meses' : '6 meses'}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[var(--color-text-secondary)]">Saldo acumulado</p>
                  <p className={`text-lg font-bold ${saldoFinal >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatCurrency(saldoFinal)}
                  </p>
                </div>
              </div>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-center">
                <p className="text-[10px] text-emerald-400/70 uppercase tracking-wider">Receita</p>
                <p className="text-sm font-bold text-emerald-400 mt-0.5">{formatCurrency(totalReceita)}</p>
              </div>
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-center">
                <p className="text-[10px] text-red-400/70 uppercase tracking-wider">Despesas</p>
                <p className="text-sm font-bold text-red-400 mt-0.5">{formatCurrency(totalDespesa)}</p>
              </div>
              <div className={`rounded-xl ${totalResultado >= 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'} border p-3 text-center`}>
                <p className={`text-[10px] ${totalResultado >= 0 ? 'text-emerald-400/70' : 'text-red-400/70'} uppercase tracking-wider`}>Resultado</p>
                <p className={`text-sm font-bold ${totalResultado >= 0 ? 'text-emerald-400' : 'text-red-400'} mt-0.5`}>{formatCurrency(totalResultado)}</p>
              </div>
            </div>

            {/* Chart */}
            <div className="h-[250px] sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={cashflowData} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="month" stroke={axisColor} style={{ fontSize: '11px', fontFamily: '"JetBrains Mono"' }} />
                  <YAxis stroke={axisColor} style={{ fontSize: '11px', fontFamily: '"JetBrains Mono"' }} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(v, name) => [formatCurrency(v), name]}
                  />
                  <Legend wrapperStyle={{ paddingTop: '12px', fontFamily: '"Inter"', fontSize: '12px' }} />
                  <Bar dataKey="receita" name="Receita" fill="#10B981" radius={[3, 3, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="despesa" name="Despesas" fill="#EF4444" radius={[3, 3, 0, 0]} maxBarSize={40} />
                  <Line type="monotone" dataKey="saldo" name="Saldo Acum." stroke="#5E6AD2" strokeWidth={2.5} dot={{ fill: '#5E6AD2', r: 3, strokeWidth: 0 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      );
    },

    client_profitability: () => {
      if (clientProfitData.length === 0) return null;
      return (
        <Card className="transition-all duration-200 cursor-pointer" onClick={() => onNavigate('clients')}>
          <CardContent className="p-4 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-[var(--color-text)]">Rentabilidade por Cliente</h3>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">Top 5 — Viagens finalizadas</p>
              </div>
              <ArrowRight className="h-4 w-4 text-[var(--color-text-secondary)]" />
            </div>
            <div className="space-y-3">
              {clientProfitData.map((c, i) => {
                const maxReceita = clientProfitData[0]?.receita || 1;
                const barWidth = Math.max(5, (c.receita / maxReceita) * 100);
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-[var(--color-text)] truncate max-w-[50%]">{c.nome}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-[var(--color-text-secondary)]">{c.viagens} viagen{c.viagens > 1 ? 's' : ''}</span>
                        <span className={`text-xs font-semibold tabular-nums ${c.lucro >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {formatCurrency(c.lucro)} ({c.margem.toFixed(0)}%)
                        </span>
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-[var(--color-surface)] overflow-hidden">
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
      );
    },
  };

  // Charts that pair together in a 2-col grid
  const chartIds = ['spending_chart', 'cost_distribution'];

  const renderOrderedSections = () => {
    const order = getOrder();
    const elements = [];
    let chartBuffer = [];

    const flushCharts = () => {
      if (chartBuffer.length > 0) {
        elements.push(
          <div key={`chart-group-${chartBuffer[0]}`} className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {chartBuffer.map(id => {
              const content = sectionRenderers[id]?.();
              return content ? <div key={id}>{content}</div> : null;
            })}
          </div>
        );
        chartBuffer = [];
      }
    };

    for (const id of order) {
      if (!isVisible(id)) continue;

      if (chartIds.includes(id)) {
        chartBuffer.push(id);
      } else {
        flushCharts();
        const content = sectionRenderers[id]?.();
        if (content) elements.push(<div key={id}>{content}</div>);
      }
    }
    flushCharts();

    return elements;
  };

  // Period selector for customize modal
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[var(--color-text)]">Dashboard</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Visão geral da frota e operações — {periodLabel}
          </p>
        </div>
        <SectionCustomizerButton onClick={() => setShowCustomize(true)} />
      </div>

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

      {renderOrderedSections()}
    </div>
  );
}
