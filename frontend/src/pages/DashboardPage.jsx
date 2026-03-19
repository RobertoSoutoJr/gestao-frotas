import { useMemo } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Truck, Users, Gauge, DollarSign, Fuel, Wrench, ArrowRight, Building2, Factory, Route, Warehouse, Package, AlertCircle } from 'lucide-react';
import { formatCurrency, formatNumber } from '../lib/utils';
import { useTheme } from '../contexts/ThemeContext';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

function StatCard({ title, value, icon: Icon, color, subtitle, onClick }) {
  return (
    <Card
      className="relative overflow-hidden group hover:-translate-y-0.5 transition-all duration-200"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5 flex-1">
            <p className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
              {title}
            </p>
            <p className="text-2xl font-bold text-[var(--color-text)]">
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-[var(--color-text-secondary)]">{subtitle}</p>
            )}
          </div>
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl"
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

const CHART_COLORS = {
  accent:    '#5E6AD2',
  secondary: '#8B5CF6',
  green:     '#10B981',
  orange:    '#F59E0B',
  red:       '#EF4444',
  pink:      '#EC4899',
};

export function DashboardPage({ trucks, drivers, clients, suppliers, trips, stockRecords, fuelRecords, maintenanceRecords, onNavigate }) {
  const { isDark } = useTheme();

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
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const currentMonthFuel = fuelRecords.filter(r => {
      const d = new Date(r.created_at);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    const currentMonthMaintenance = maintenanceRecords.filter(r => {
      const d = new Date(r.data_manutencao || r.created_at);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const totalFuelCost = currentMonthFuel.reduce((s, r) => s + (Number(r.valor_total) || 0), 0);
    const totalMaintenanceCost = currentMonthMaintenance.reduce((s, r) => s + (Number(r.valor_total) || 0), 0);
    const totalKm = currentMonthFuel.reduce((s, r) => s + (Number(r.km_registro) || 0), 0);

    // Trips stats
    const activeTrips = (trips || []).filter(t => t.status === 'cadastrada').length;
    const completedTrips = (trips || []).filter(t => t.status === 'finalizada').length;
    const totalFreight = (trips || []).reduce((s, t) => s + (Number(t.valor_total_frete) || 0), 0);

    // Stock stats
    const totalStockValue = (stockRecords || []).reduce((s, r) => s + (Number(r.valor_total) || 0), 0);
    const pendingPayments = (stockRecords || []).filter(r => !r.pago);
    const pendingAmount = pendingPayments.reduce((s, r) => s + (Number(r.valor_total) || 0), 0);
    const totalSacas = (stockRecords || []).reduce((s, r) => s + (Number(r.quantidade_sacas) || 0), 0);

    return {
      activeTrucks: trucks.filter(t => t.placa).length,
      totalDrivers: (drivers || []).length,
      totalClients: (clients || []).length,
      totalSuppliers: (suppliers || []).length,
      totalCost: totalFuelCost + totalMaintenanceCost,
      totalKm,
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
    };
  }, [trucks, drivers, clients, suppliers, trips, stockRecords, fuelRecords, maintenanceRecords]);

  const monthlySpendingData = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = date.getMonth();
      const year = date.getFullYear();
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short' });

      const fuelCost = fuelRecords
        .filter(r => { const d = new Date(r.created_at); return d.getMonth() === month && d.getFullYear() === year; })
        .reduce((s, r) => s + (Number(r.valor_total) || 0), 0);
      const maintenanceCost = maintenanceRecords
        .filter(r => { const d = new Date(r.data_manutencao || r.created_at); return d.getMonth() === month && d.getFullYear() === year; })
        .reduce((s, r) => s + (Number(r.valor_total) || 0), 0);

      months.push({ month: monthName.charAt(0).toUpperCase() + monthName.slice(1), combustivel: fuelCost, manutencao: maintenanceCost, total: fuelCost + maintenanceCost });
    }
    return months;
  }, [fuelRecords, maintenanceRecords]);

  const topTrucksData = useMemo(() => {
    const spending = {};
    fuelRecords.forEach(r => { spending[r.caminhao_id] = (spending[r.caminhao_id] || 0) + (Number(r.valor_total) || 0); });
    maintenanceRecords.forEach(r => { spending[r.caminhao_id] = (spending[r.caminhao_id] || 0) + (Number(r.valor_total) || 0); });
    return Object.entries(spending)
      .map(([id, gasto]) => ({ truck: trucks.find(t => t.id === Number(id))?.placa || `ID:${id}`, gasto }))
      .sort((a, b) => b.gasto - a.gasto)
      .slice(0, 5);
  }, [trucks, fuelRecords, maintenanceRecords]);

  const costDistributionData = [
    { name: 'Combustível', value: stats.fuelCost, color: CHART_COLORS.accent },
    { name: 'Manutenção', value: stats.maintenanceCost, color: CHART_COLORS.secondary }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-text)]">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Visão geral da frota e operações do mês atual
        </p>
      </div>

      {/* Pending Payments Alert */}
      {stats.pendingPaymentsCount > 0 && (
        <div
          className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 cursor-pointer hover:bg-red-500/15 transition-colors"
          onClick={() => onNavigate('stock')}
        >
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-400">
              {stats.pendingPaymentsCount} pagamento{stats.pendingPaymentsCount > 1 ? 's' : ''} pendente{stats.pendingPaymentsCount > 1 ? 's' : ''} no estoque
            </p>
            <p className="text-xs text-red-400/70">
              Total: {formatCurrency(stats.pendingAmount)}
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-red-400" />
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Caminhões Ativos"
          value={stats.activeTrucks}
          icon={Truck}
          color={CHART_COLORS.accent}
          subtitle="Total na frota"
          onClick={() => onNavigate('trucks')}
        />
        <StatCard
          title="Motoristas"
          value={stats.totalDrivers}
          icon={Users}
          color={CHART_COLORS.secondary}
          subtitle="Equipe cadastrada"
          onClick={() => onNavigate('drivers')}
        />
        <StatCard
          title="Gasto Mensal"
          value={formatCurrency(stats.totalCost)}
          icon={DollarSign}
          color={CHART_COLORS.green}
          subtitle={`${formatCurrency(stats.fuelCost)} comb. + ${formatCurrency(stats.maintenanceCost)} man.`}
          onClick={() => onNavigate('reports')}
        />
        <StatCard
          title="KM Rodado"
          value={formatNumber(stats.totalKm, 0)}
          icon={Gauge}
          color={CHART_COLORS.orange}
          subtitle="Este mês"
          onClick={() => onNavigate('fuel')}
        />
      </div>

      {/* Operations Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Clientes"
          value={stats.totalClients}
          icon={Building2}
          color="#06B6D4"
          subtitle="Cadastrados"
          onClick={() => onNavigate('clients')}
        />
        <StatCard
          title="Fornecedores"
          value={stats.totalSuppliers}
          icon={Factory}
          color="#F97316"
          subtitle="Cadastrados"
          onClick={() => onNavigate('suppliers')}
        />
        <StatCard
          title="Viagens"
          value={stats.totalTrips}
          icon={Route}
          color={CHART_COLORS.green}
          subtitle={`${stats.activeTrips} em andamento · ${stats.completedTrips} finalizadas`}
          onClick={() => onNavigate('trips')}
        />
        <StatCard
          title="Estoque"
          value={`${formatNumber(stats.totalSacas, 0)} sacas`}
          icon={Warehouse}
          color={CHART_COLORS.red}
          subtitle={`${formatCurrency(stats.totalStockValue)} investido`}
          onClick={() => onNavigate('stock')}
        />
      </div>

      {/* Trips & Freight Summary */}
      {stats.totalTrips > 0 && (
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
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Line Chart */}
        <Card className="transition-all duration-200" onClick={() => onNavigate('reports')}>
          <CardContent className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-[var(--color-text)]">
                  Gastos — Últimos 6 meses
                </h3>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">Evolução dos custos operacionais</p>
              </div>
              <ArrowRight className="h-4 w-4 text-[var(--color-text-secondary)] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={monthlySpendingData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="month" stroke={axisColor} style={{ fontSize: '11px', fontFamily: '"JetBrains Mono"' }} />
                <YAxis stroke={axisColor} style={{ fontSize: '11px', fontFamily: '"JetBrains Mono"' }} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={tooltipStyle} formatter={v => formatCurrency(v)} />
                <Legend wrapperStyle={{ paddingTop: '16px', fontFamily: '"Inter"', fontSize: '12px' }} iconType="plainline" />
                <Line type="monotone" dataKey="combustivel" name="Combustível" stroke={CHART_COLORS.accent} strokeWidth={2} dot={{ fill: CHART_COLORS.accent, r: 3, strokeWidth: 0 }} activeDot={{ r: 5, stroke: CHART_COLORS.accent, strokeWidth: 2, fill: isDark ? '#0a0a0c' : '#fff' }} />
                <Line type="monotone" dataKey="manutencao" name="Manutenção" stroke={CHART_COLORS.secondary} strokeWidth={2} dot={{ fill: CHART_COLORS.secondary, r: 3, strokeWidth: 0 }} activeDot={{ r: 5, stroke: CHART_COLORS.secondary, strokeWidth: 2, fill: isDark ? '#0a0a0c' : '#fff' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card className="transition-all duration-200">
          <CardContent className="p-6">
            <div className="mb-6">
              <h3 className="text-base font-semibold text-[var(--color-text)]">
                Distribuição de Custos
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">Combustível vs Manutenção</p>
            </div>
            <ResponsiveContainer width="100%" height={280}>
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
      </div>

      {/* Bar Chart */}
      <Card className="transition-all duration-200" onClick={() => onNavigate('trucks')}>
        <CardContent className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-[var(--color-text)]">
                Top 5 — Custo por Veículo
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">Veículos com maior custo operacional</p>
            </div>
            <ArrowRight className="h-4 w-4 text-[var(--color-text-secondary)]" />
          </div>
          <ResponsiveContainer width="100%" height={320}>
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
        </CardContent>
      </Card>
    </div>
  );
}
