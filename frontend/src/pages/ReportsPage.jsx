import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, Fuel as FuelIcon, Wrench, BarChart3 } from 'lucide-react';
import { formatCurrency, formatNumber } from '../lib/utils';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function ReportsPage({ trucks, fuelRecords, maintenanceRecords }) {
  const stats = useMemo(() => {
    return trucks.map(truck => {
      const fuelData = fuelRecords.filter(r => r.caminhao_id === truck.id);
      const maintenanceData = maintenanceRecords.filter(r => r.caminhao_id === truck.id);

      const totalFuel = fuelData.reduce((sum, r) => sum + Number(r.valor_total || 0), 0);
      const totalMaintenance = maintenanceData.reduce((sum, r) => sum + Number(r.valor_total || 0), 0);
      const totalLiters = fuelData.reduce((sum, r) => sum + Number(r.litros || 0), 0);

      return {
        truck,
        totalFuel,
        totalMaintenance,
        totalSpent: totalFuel + totalMaintenance,
        totalLiters,
        fuelRecordsCount: fuelData.length,
        maintenanceCount: maintenanceData.length
      };
    });
  }, [trucks, fuelRecords, maintenanceRecords]);

  const overallStats = useMemo(() => {
    const totalFuel = stats.reduce((sum, s) => sum + s.totalFuel, 0);
    const totalMaintenance = stats.reduce((sum, s) => sum + s.totalMaintenance, 0);
    const totalLiters = stats.reduce((sum, s) => sum + s.totalLiters, 0);

    return {
      totalFuel,
      totalMaintenance,
      totalSpent: totalFuel + totalMaintenance,
      totalLiters,
      avgFuelPerTruck: trucks.length > 0 ? totalFuel / trucks.length : 0,
      avgMaintenancePerTruck: trucks.length > 0 ? totalMaintenance / trucks.length : 0
    };
  }, [stats, trucks.length]);

  const chartData = useMemo(() => {
    return stats.map(s => ({
      name: s.truck.placa,
      Fuel: Number(s.totalFuel.toFixed(2)),
      Maintenance: Number(s.totalMaintenance.toFixed(2))
    }));
  }, [stats]);

  const pieData = useMemo(() => {
    return stats.map(s => ({
      name: s.truck.placa,
      value: Number(s.totalSpent.toFixed(2))
    }));
  }, [stats]);

  if (trucks.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <EmptyState
            icon={BarChart3}
            title="No data available"
            description="Register trucks and add fuel/maintenance records to see reports"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Total Spent
                </p>
                <p className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                  {formatCurrency(overallStats.totalSpent)}
                </p>
              </div>
              <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/20">
                <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Fuel Costs
                </p>
                <p className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                  {formatCurrency(overallStats.totalFuel)}
                </p>
              </div>
              <div className="rounded-full bg-orange-100 p-3 dark:bg-orange-900/20">
                <FuelIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Maintenance
                </p>
                <p className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                  {formatCurrency(overallStats.totalMaintenance)}
                </p>
              </div>
              <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/20">
                <Wrench className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Total Liters
                </p>
                <p className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                  {formatNumber(overallStats.totalLiters, 0)}
                </p>
              </div>
              <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/20">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Costs by Truck</CardTitle>
            <CardDescription>Comparison of fuel and maintenance costs</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis dataKey="name" stroke="#71717a" />
                <YAxis stroke="#71717a" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e4e4e7',
                    borderRadius: '8px'
                  }}
                  formatter={(value) => formatCurrency(value)}
                />
                <Legend />
                <Bar dataKey="Fuel" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Maintenance" fill="#ef4444" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Spending Distribution</CardTitle>
            <CardDescription>Total costs per truck</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Breakdown */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Detailed Breakdown
        </h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {stats.map(stat => (
            <Card key={stat.truck.id} className="overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <div className="flex items-center justify-between text-white">
                  <div>
                    <h3 className="text-lg font-bold">{stat.truck.placa}</h3>
                    <p className="text-sm opacity-90">{stat.truck.modelo}</p>
                  </div>
                  <Badge variant="default" className="bg-white/20 text-white">
                    {formatNumber(stat.truck.km_atual || 0, 0)} km
                  </Badge>
                </div>
              </div>

              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <FuelIcon className="h-4 w-4" />
                    Fuel ({stat.fuelRecordsCount} records)
                  </span>
                  <span className="font-semibold text-orange-600">
                    {formatCurrency(stat.totalFuel)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <Wrench className="h-4 w-4" />
                    Maintenance ({stat.maintenanceCount} records)
                  </span>
                  <span className="font-semibold text-red-600">
                    {formatCurrency(stat.totalMaintenance)}
                  </span>
                </div>

                <div className="border-t border-zinc-200 pt-4 dark:border-zinc-700">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                      Total
                    </span>
                    <span className="text-xl font-bold text-blue-600">
                      {formatCurrency(stat.totalSpent)}
                    </span>
                  </div>
                </div>

                {stat.totalLiters > 0 && (
                  <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Total Fuel Consumption
                    </p>
                    <p className="mt-1 font-mono text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      {formatNumber(stat.totalLiters, 2)} liters
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
