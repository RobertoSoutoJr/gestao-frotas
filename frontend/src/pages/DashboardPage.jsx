import { useMemo } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Truck, Users, Gauge, DollarSign, Fuel, Wrench } from 'lucide-react';
import { formatCurrency, formatNumber } from '../lib/utils';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

function StatCard({ title, value, icon: Icon, color, subtitle }) {
  return (
    <Card className="relative overflow-hidden group hover:-translate-y-0.5 transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5 flex-1">
            <p className="text-xs font-medium text-[#8A8F98] uppercase tracking-wider">
              {title}
            </p>
            <p className="text-2xl font-bold text-[#EDEDEF]">
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-[#8A8F98]">{subtitle}</p>
            )}
          </div>
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${color}18` }}
          >
            <Icon className="h-5 w-5" style={{ color }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const CHART_COLORS = {
  accent:    '#5E6AD2',
  secondary: '#8B5CF6',
  green:     '#10B981',
  orange:    '#F59E0B',
};

const tooltipStyle = {
  backgroundColor: 'rgba(10,10,12,0.95)',
  border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: '12px',
  fontFamily: '"Inter", sans-serif',
  color: '#EDEDEF',
};

export function DashboardPage({ trucks, fuelRecords, maintenanceRecords }) {
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

    return {
      activeTrucks: trucks.filter(t => t.placa).length,
      totalCost: totalFuelCost + totalMaintenanceCost,
      totalKm,
      fuelCost: totalFuelCost,
      maintenanceCost: totalMaintenanceCost
    };
  }, [trucks, fuelRecords, maintenanceRecords]);

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
        <h1 className="text-2xl font-semibold text-[#EDEDEF]">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-[#8A8F98]">
          Visão geral da frota e operações do mês atual
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Caminhões Ativos" value={stats.activeTrucks} icon={Truck} color={CHART_COLORS.accent} subtitle="Total na frota" />
        <StatCard title="Motoristas" value={trucks.length > 0 ? Math.ceil(stats.activeTrucks * 1.5) : 0} icon={Users} color={CHART_COLORS.secondary} subtitle="Equipe disponível" />
        <StatCard title="Gasto Mensal" value={formatCurrency(stats.totalCost)} icon={DollarSign} color={CHART_COLORS.green} subtitle={`${formatCurrency(stats.fuelCost)} + ${formatCurrency(stats.maintenanceCost)}`} />
        <StatCard title="KM Rodado" value={formatNumber(stats.totalKm, 0)} icon={Gauge} color={CHART_COLORS.orange} subtitle="Este mês" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Line Chart */}
        <Card className="transition-all duration-200">
          <CardContent className="p-6">
            <div className="mb-6">
              <h3 className="text-base font-semibold text-[#EDEDEF]">
                Gastos — Últimos 6 meses
              </h3>
              <p className="text-xs text-[#8A8F98] mt-1">Evolução dos custos operacionais</p>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={monthlySpendingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" opacity={1} />
                <XAxis dataKey="month" stroke="#8A8F98" style={{ fontSize: '11px', fontFamily: '"JetBrains Mono"' }} />
                <YAxis stroke="#8A8F98" style={{ fontSize: '11px', fontFamily: '"JetBrains Mono"' }} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={tooltipStyle} formatter={v => formatCurrency(v)} />
                <Legend wrapperStyle={{ paddingTop: '16px', fontFamily: '"Inter"', fontSize: '12px' }} iconType="plainline" />
                <Line type="monotone" dataKey="combustivel" name="Combustível" stroke={CHART_COLORS.accent} strokeWidth={2} dot={{ fill: CHART_COLORS.accent, r: 3, strokeWidth: 0 }} activeDot={{ r: 5, stroke: CHART_COLORS.accent, strokeWidth: 2, fill: '#0a0a0c' }} />
                <Line type="monotone" dataKey="manutencao" name="Manutenção" stroke={CHART_COLORS.secondary} strokeWidth={2} dot={{ fill: CHART_COLORS.secondary, r: 3, strokeWidth: 0 }} activeDot={{ r: 5, stroke: CHART_COLORS.secondary, strokeWidth: 2, fill: '#0a0a0c' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card className="transition-all duration-200">
          <CardContent className="p-6">
            <div className="mb-6">
              <h3 className="text-base font-semibold text-[#EDEDEF]">
                Distribuição de Custos
              </h3>
              <p className="text-xs text-[#8A8F98] mt-1">Combustível vs Manutenção</p>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={costDistributionData} cx="50%" cy="50%" labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={90} fill="#8884d8" dataKey="value" stroke="#0a0a0c" strokeWidth={2}>
                  {costDistributionData.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={v => formatCurrency(v)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] p-3">
                <Fuel className="h-4 w-4 text-[#5E6AD2]" />
                <div>
                  <p className="text-xs text-[#8A8F98]">Combustível</p>
                  <p className="text-sm font-semibold text-[#EDEDEF]">{formatCurrency(stats.fuelCost)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] p-3">
                <Wrench className="h-4 w-4 text-[#8B5CF6]" />
                <div>
                  <p className="text-xs text-[#8A8F98]">Manutenção</p>
                  <p className="text-sm font-semibold text-[#EDEDEF]">{formatCurrency(stats.maintenanceCost)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bar Chart */}
      <Card className="transition-all duration-200">
        <CardContent className="p-6">
          <div className="mb-6">
            <h3 className="text-base font-semibold text-[#EDEDEF]">
              Top 5 — Custo por Veículo
            </h3>
            <p className="text-xs text-[#8A8F98] mt-1">Veículos com maior custo operacional</p>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={topTrucksData}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_COLORS.accent} stopOpacity={1} />
                  <stop offset="100%" stopColor={CHART_COLORS.secondary} stopOpacity={1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" opacity={1} />
              <XAxis dataKey="truck" stroke="#8A8F98" style={{ fontSize: '11px', fontFamily: '"JetBrains Mono"' }} />
              <YAxis stroke="#8A8F98" style={{ fontSize: '11px', fontFamily: '"JetBrains Mono"' }} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={tooltipStyle} formatter={v => formatCurrency(v)} cursor={{ fill: 'rgba(94,106,210,0.05)' }} />
              <Bar dataKey="gasto" name="Gasto Total" fill="url(#barGradient)" radius={[4, 4, 0, 0]} maxBarSize={60} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
