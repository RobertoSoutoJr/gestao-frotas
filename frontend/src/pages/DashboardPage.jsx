import { useMemo } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Truck, Users, Gauge, DollarSign, Fuel, Wrench } from 'lucide-react';
import { formatCurrency, formatNumber } from '../lib/utils';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

function StatCard({ title, value, icon: Icon, color, glowColor, subtitle }) {
  return (
    <Card className="relative overflow-hidden group hover:shadow-[0_0_25px_rgba(0,255,255,0.15)] hover:-translate-y-1 transition-all duration-200">
      <CardContent className="p-6 relative z-10">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <p className="font-mono text-xs uppercase tracking-wider text-[#E0E0E0]/50">
              &gt; {title}
            </p>
            <p className="font-[Orbitron] text-3xl font-black" style={{ color }}>
              {value}
            </p>
            {subtitle && (
              <p className="font-mono text-xs text-[#E0E0E0]/40">{subtitle}</p>
            )}
          </div>
          <div
            className="flex h-14 w-14 items-center justify-center border-2 rotate-45 transition-transform duration-200 group-hover:rotate-[135deg]"
            style={{
              borderColor: color,
              backgroundColor: `${color}15`,
              boxShadow: `0 0 15px ${glowColor}`
            }}
          >
            <Icon className="h-6 w-6 -rotate-45 group-hover:-rotate-[135deg] transition-transform duration-200" style={{ color }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const CHART_COLORS = {
  magenta: '#FF00FF',
  cyan: '#00FFFF',
  orange: '#FF9900',
  green: '#00FF88',
};

const tooltipStyle = {
  backgroundColor: 'rgba(26, 16, 60, 0.95)',
  border: '1px solid #FF00FF',
  borderRadius: '0px',
  fontFamily: '"Share Tech Mono", monospace',
  color: '#E0E0E0',
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
    { name: 'Combustível', value: stats.fuelCost, color: CHART_COLORS.cyan },
    { name: 'Manutenção', value: stats.maintenanceCost, color: CHART_COLORS.magenta }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-[Orbitron] text-3xl font-black uppercase tracking-wider text-[#E0E0E0] text-glow-white">
          Dashboard
        </h1>
        <p className="mt-2 font-mono text-sm text-[#E0E0E0]/50">
          &gt; Visão geral da frota e operações
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Caminhões Ativos" value={stats.activeTrucks} icon={Truck} color="#00FFFF" glowColor="rgba(0,255,255,0.3)" subtitle="Total na frota" />
        <StatCard title="Motoristas" value={trucks.length > 0 ? Math.ceil(stats.activeTrucks * 1.5) : 0} icon={Users} color="#FF00FF" glowColor="rgba(255,0,255,0.3)" subtitle="Equipe disponível" />
        <StatCard title="Gasto Mensal" value={formatCurrency(stats.totalCost)} icon={DollarSign} color="#00FF88" glowColor="rgba(0,255,136,0.3)" subtitle={`${formatCurrency(stats.fuelCost)} + ${formatCurrency(stats.maintenanceCost)}`} />
        <StatCard title="KM Rodado" value={formatNumber(stats.totalKm, 0)} icon={Gauge} color="#FF9900" glowColor="rgba(255,153,0,0.3)" subtitle="Este mês" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Line Chart */}
        <Card className="hover:shadow-[0_0_20px_rgba(0,255,255,0.1)] transition-all duration-200">
          <CardContent className="p-6">
            <div className="mb-6">
              <h3 className="font-[Orbitron] text-lg font-semibold uppercase tracking-wider text-[#00FFFF] drop-shadow-[0_0_5px_rgba(0,255,255,0.8)]">
                Gastos — 6 Meses
              </h3>
              <p className="font-mono text-xs text-[#E0E0E0]/40 mt-1">&gt; Evolução dos custos operacionais</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlySpendingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2D1B4E" opacity={0.5} />
                <XAxis dataKey="month" stroke="#E0E0E0" style={{ fontSize: '11px', fontFamily: '"Share Tech Mono"' }} />
                <YAxis stroke="#E0E0E0" style={{ fontSize: '11px', fontFamily: '"Share Tech Mono"' }} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={tooltipStyle} formatter={v => formatCurrency(v)} />
                <Legend wrapperStyle={{ paddingTop: '20px', fontFamily: '"Share Tech Mono"' }} iconType="plainline" />
                <Line type="monotone" dataKey="combustivel" name="Combustível" stroke={CHART_COLORS.cyan} strokeWidth={3} dot={{ fill: CHART_COLORS.cyan, r: 4, strokeWidth: 0 }} activeDot={{ r: 6, stroke: CHART_COLORS.cyan, strokeWidth: 2, fill: '#090014' }} />
                <Line type="monotone" dataKey="manutencao" name="Manutenção" stroke={CHART_COLORS.magenta} strokeWidth={3} dot={{ fill: CHART_COLORS.magenta, r: 4, strokeWidth: 0 }} activeDot={{ r: 6, stroke: CHART_COLORS.magenta, strokeWidth: 2, fill: '#090014' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card className="hover:shadow-[0_0_20px_rgba(255,0,255,0.1)] transition-all duration-200">
          <CardContent className="p-6">
            <div className="mb-6">
              <h3 className="font-[Orbitron] text-lg font-semibold uppercase tracking-wider text-[#00FFFF] drop-shadow-[0_0_5px_rgba(0,255,255,0.8)]">
                Distribuição
              </h3>
              <p className="font-mono text-xs text-[#E0E0E0]/40 mt-1">&gt; Combustível vs Manutenção</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={costDistributionData} cx="50%" cy="50%" labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100} fill="#8884d8" dataKey="value" stroke="#090014" strokeWidth={2}>
                  {costDistributionData.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={v => formatCurrency(v)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 border border-[#00FFFF]/30 bg-[#00FFFF]/5 p-3">
                <Fuel className="h-5 w-5 text-[#00FFFF]" />
                <div>
                  <p className="font-mono text-xs text-[#E0E0E0]/50">Combustível</p>
                  <p className="font-[Orbitron] text-sm font-semibold text-[#00FFFF]">{formatCurrency(stats.fuelCost)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 border border-[#FF00FF]/30 bg-[#FF00FF]/5 p-3">
                <Wrench className="h-5 w-5 text-[#FF00FF]" />
                <div>
                  <p className="font-mono text-xs text-[#E0E0E0]/50">Manutenção</p>
                  <p className="font-[Orbitron] text-sm font-semibold text-[#FF00FF]">{formatCurrency(stats.maintenanceCost)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bar Chart */}
      <Card className="hover:shadow-[0_0_20px_rgba(255,153,0,0.1)] transition-all duration-200">
        <CardContent className="p-6">
          <div className="mb-6">
            <h3 className="font-[Orbitron] text-lg font-semibold uppercase tracking-wider text-[#00FFFF] drop-shadow-[0_0_5px_rgba(0,255,255,0.8)]">
              Top 5 — Custo por Veículo
            </h3>
            <p className="font-mono text-xs text-[#E0E0E0]/40 mt-1">&gt; Veículos com maior custo operacional</p>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={topTrucksData}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_COLORS.magenta} stopOpacity={1} />
                  <stop offset="100%" stopColor={CHART_COLORS.cyan} stopOpacity={1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2D1B4E" opacity={0.5} />
              <XAxis dataKey="truck" stroke="#E0E0E0" style={{ fontSize: '11px', fontFamily: '"Share Tech Mono"' }} />
              <YAxis stroke="#E0E0E0" style={{ fontSize: '11px', fontFamily: '"Share Tech Mono"' }} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={tooltipStyle} formatter={v => formatCurrency(v)} cursor={{ fill: 'rgba(255,0,255,0.05)' }} />
              <Bar dataKey="gasto" name="Gasto Total" fill="url(#barGradient)" radius={[0, 0, 0, 0]} maxBarSize={60} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
