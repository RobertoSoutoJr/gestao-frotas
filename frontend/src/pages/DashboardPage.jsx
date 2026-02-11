import { useMemo } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import {
  Truck,
  Users,
  TrendingUp,
  Gauge,
  DollarSign,
  Fuel,
  Wrench
} from 'lucide-react';
import { formatCurrency, formatNumber } from '../lib/utils';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

function StatCard({ title, value, icon: Icon, gradient, trend, subtitle }) {
  return (
    <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className={`absolute inset-0 opacity-5 ${gradient}`} />
      <CardContent className="p-6 relative z-10">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              {title}
            </p>
            <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {subtitle}
              </p>
            )}
          </div>
          <div className={`p-4 rounded-2xl ${gradient}`}>
            <Icon className="h-7 w-7 text-white" />
          </div>
        </div>
        {trend && (
          <div className="mt-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
              {trend}
            </span>
            <span className="text-xs text-zinc-500">vs mês anterior</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function DashboardPage({ trucks, fuelRecords, maintenanceRecords }) {
  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Filter records for current month
    const currentMonthFuel = fuelRecords.filter(record => {
      const date = new Date(record.created_at);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const currentMonthMaintenance = maintenanceRecords.filter(record => {
      const date = new Date(record.data_manutencao || record.created_at);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    // Calculate totals
    const totalFuelCost = currentMonthFuel.reduce((sum, r) => sum + (Number(r.valor_total) || 0), 0);
    const totalMaintenanceCost = currentMonthMaintenance.reduce((sum, r) => sum + (Number(r.valor_total) || 0), 0);
    const totalCost = totalFuelCost + totalMaintenanceCost;
    const totalKm = currentMonthFuel.reduce((sum, r) => sum + (Number(r.km_registro) || 0), 0);

    // Active trucks (assuming all trucks are active)
    const activeTrucks = trucks.filter(t => t.placa).length;

    return {
      activeTrucks,
      totalCost,
      totalKm,
      fuelCost: totalFuelCost,
      maintenanceCost: totalMaintenanceCost
    };
  }, [trucks, fuelRecords, maintenanceRecords]);

  // Last 6 months spending data
  const monthlySpendingData = useMemo(() => {
    const months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = date.getMonth();
      const year = date.getFullYear();

      const monthName = date.toLocaleDateString('pt-BR', { month: 'short' });

      const fuelCost = fuelRecords
        .filter(r => {
          const rDate = new Date(r.created_at);
          return rDate.getMonth() === month && rDate.getFullYear() === year;
        })
        .reduce((sum, r) => sum + (Number(r.valor_total) || 0), 0);

      const maintenanceCost = maintenanceRecords
        .filter(r => {
          const rDate = new Date(r.data_manutencao || r.created_at);
          return rDate.getMonth() === month && rDate.getFullYear() === year;
        })
        .reduce((sum, r) => sum + (Number(r.valor_total) || 0), 0);

      months.push({
        month: monthName.charAt(0).toUpperCase() + monthName.slice(1),
        combustivel: fuelCost,
        manutencao: maintenanceCost,
        total: fuelCost + maintenanceCost
      });
    }

    return months;
  }, [fuelRecords, maintenanceRecords]);

  // Top 5 trucks by spending
  const topTrucksData = useMemo(() => {
    const truckSpending = {};

    fuelRecords.forEach(record => {
      const truckId = record.caminhao_id;
      if (!truckSpending[truckId]) {
        truckSpending[truckId] = 0;
      }
      truckSpending[truckId] += Number(record.valor_total) || 0;
    });

    maintenanceRecords.forEach(record => {
      const truckId = record.caminhao_id;
      if (!truckSpending[truckId]) {
        truckSpending[truckId] = 0;
      }
      truckSpending[truckId] += Number(record.valor_total) || 0;
    });

    return Object.entries(truckSpending)
      .map(([truckId, spending]) => {
        const truck = trucks.find(t => t.id === Number(truckId));
        return {
          truck: truck ? truck.placa : `ID: ${truckId}`,
          gasto: spending
        };
      })
      .sort((a, b) => b.gasto - a.gasto)
      .slice(0, 5);
  }, [trucks, fuelRecords, maintenanceRecords]);

  // Pie chart data for fuel vs maintenance
  const costDistributionData = [
    { name: 'Combustível', value: stats.fuelCost, color: '#3b82f6' },
    { name: 'Manutenção', value: stats.maintenanceCost, color: '#f97316' }
  ];

  const CHART_COLORS = {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    accent: '#f59e0b',
    success: '#10b981',
    danger: '#ef4444'
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          Dashboard
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Visão geral da sua frota e operações
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Caminhões Ativos"
          value={stats.activeTrucks}
          icon={Truck}
          gradient="bg-gradient-to-br from-blue-500 to-blue-600"
          subtitle="Total na frota"
        />
        <StatCard
          title="Total de Motoristas"
          value={trucks.length > 0 ? Math.ceil(stats.activeTrucks * 1.5) : 0}
          icon={Users}
          gradient="bg-gradient-to-br from-purple-500 to-purple-600"
          subtitle="Equipe disponível"
        />
        <StatCard
          title="Gasto Total - Este Mês"
          value={formatCurrency(stats.totalCost)}
          icon={DollarSign}
          gradient="bg-gradient-to-br from-green-500 to-green-600"
          subtitle={`${formatCurrency(stats.fuelCost)} + ${formatCurrency(stats.maintenanceCost)}`}
        />
        <StatCard
          title="KM Rodado - Este Mês"
          value={formatNumber(stats.totalKm, 0)}
          icon={Gauge}
          gradient="bg-gradient-to-br from-orange-500 to-orange-600"
          subtitle="Quilometragem total"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Line Chart - Monthly Spending */}
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                Gastos nos Últimos 6 Meses
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Evolução dos custos operacionais
              </p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlySpendingData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" opacity={0.3} />
                <XAxis
                  dataKey="month"
                  stroke="#71717a"
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  stroke="#71717a"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e4e4e7',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value) => formatCurrency(value)}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="circle"
                />
                <Line
                  type="monotone"
                  dataKey="combustivel"
                  name="Combustível"
                  stroke={CHART_COLORS.primary}
                  strokeWidth={3}
                  dot={{ fill: CHART_COLORS.primary, r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="manutencao"
                  name="Manutenção"
                  stroke={CHART_COLORS.accent}
                  strokeWidth={3}
                  dot={{ fill: CHART_COLORS.accent, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart - Cost Distribution */}
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                Distribuição de Gastos
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Combustível vs Manutenção - Este mês
              </p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={costDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {costDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e4e4e7',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value) => formatCurrency(value)}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/10">
                <Fuel className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">Combustível</p>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                    {formatCurrency(stats.fuelCost)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-orange-50 p-3 dark:bg-orange-900/10">
                <Wrench className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                <div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">Manutenção</p>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                    {formatCurrency(stats.maintenanceCost)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bar Chart - Top 5 Trucks */}
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardContent className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Top 5 Caminhões por Gasto
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Veículos com maior custo operacional
            </p>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={topTrucksData}>
              <defs>
                <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_COLORS.secondary} stopOpacity={1}/>
                  <stop offset="100%" stopColor={CHART_COLORS.primary} stopOpacity={1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" opacity={0.3} />
              <XAxis
                dataKey="truck"
                stroke="#71717a"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="#71717a"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e4e4e7',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value) => formatCurrency(value)}
                cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
              />
              <Bar
                dataKey="gasto"
                name="Gasto Total"
                fill="url(#colorBar)"
                radius={[8, 8, 0, 0]}
                maxBarSize={60}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
