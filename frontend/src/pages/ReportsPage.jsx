import { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Input } from '../components/ui/Input';
import { EmptyState } from '../components/ui/EmptyState';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, Fuel as FuelIcon, Wrench, BarChart3, Filter, X } from 'lucide-react';
import { formatCurrency, formatNumber, formatDate } from '../lib/utils';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function ReportsPage({ trucks, fuelRecords, maintenanceRecords }) {
  const [selectedTruck, setSelectedTruck] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Aplicar filtros
  const filteredData = useMemo(() => {
    let filteredFuel = fuelRecords;
    let filteredMaintenance = maintenanceRecords;

    // Filtro por caminhão
    if (selectedTruck !== 'all') {
      const truckId = Number(selectedTruck);
      filteredFuel = filteredFuel.filter(r => r.caminhao_id === truckId);
      filteredMaintenance = filteredMaintenance.filter(r => r.caminhao_id === truckId);
    }

    // Filtro por data
    if (startDate) {
      filteredFuel = filteredFuel.filter(r => {
        const recordDate = new Date(r.created_at);
        return recordDate >= new Date(startDate);
      });
      filteredMaintenance = filteredMaintenance.filter(r => {
        const recordDate = new Date(r.data_manutencao);
        return recordDate >= new Date(startDate);
      });
    }

    if (endDate) {
      filteredFuel = filteredFuel.filter(r => {
        const recordDate = new Date(r.created_at);
        return recordDate <= new Date(endDate);
      });
      filteredMaintenance = filteredMaintenance.filter(r => {
        const recordDate = new Date(r.data_manutencao);
        return recordDate <= new Date(endDate);
      });
    }

    return { filteredFuel, filteredMaintenance };
  }, [fuelRecords, maintenanceRecords, selectedTruck, startDate, endDate]);

  const stats = useMemo(() => {
    const trucksToShow = selectedTruck === 'all'
      ? trucks
      : trucks.filter(t => t.id === Number(selectedTruck));

    return trucksToShow.map(truck => {
      const fuelData = filteredData.filteredFuel.filter(r => r.caminhao_id === truck.id);
      const maintenanceData = filteredData.filteredMaintenance.filter(r => r.caminhao_id === truck.id);

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
  }, [trucks, filteredData, selectedTruck]);

  const overallStats = useMemo(() => {
    const totalFuel = stats.reduce((sum, s) => sum + s.totalFuel, 0);
    const totalMaintenance = stats.reduce((sum, s) => sum + s.totalMaintenance, 0);
    const totalLiters = stats.reduce((sum, s) => sum + s.totalLiters, 0);
    const trucksCount = stats.length;

    return {
      totalFuel,
      totalMaintenance,
      totalSpent: totalFuel + totalMaintenance,
      totalLiters,
      avgFuelPerTruck: trucksCount > 0 ? totalFuel / trucksCount : 0,
      avgMaintenancePerTruck: trucksCount > 0 ? totalMaintenance / trucksCount : 0
    };
  }, [stats]);

  const chartData = useMemo(() => {
    return stats.map(s => ({
      name: s.truck.placa,
      Combustível: Number(s.totalFuel.toFixed(2)),
      Manutenção: Number(s.totalMaintenance.toFixed(2))
    }));
  }, [stats]);

  const pieData = useMemo(() => {
    return stats.map(s => ({
      name: s.truck.placa,
      value: Number(s.totalSpent.toFixed(2))
    }));
  }, [stats]);

  // Dados de evolução mensal
  const monthlyData = useMemo(() => {
    const months = {};

    filteredData.filteredFuel.forEach(record => {
      const date = new Date(record.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!months[monthKey]) {
        months[monthKey] = { combustivel: 0, manutencao: 0 };
      }
      months[monthKey].combustivel += Number(record.valor_total || 0);
    });

    filteredData.filteredMaintenance.forEach(record => {
      const date = new Date(record.data_manutencao);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!months[monthKey]) {
        months[monthKey] = { combustivel: 0, manutencao: 0 };
      }
      months[monthKey].manutencao += Number(record.valor_total || 0);
    });

    return Object.keys(months).sort().map(key => ({
      mes: key,
      Combustível: Number(months[key].combustivel.toFixed(2)),
      Manutenção: Number(months[key].manutencao.toFixed(2))
    }));
  }, [filteredData]);

  const clearFilters = () => {
    setSelectedTruck('all');
    setStartDate('');
    setEndDate('');
  };

  const hasActiveFilters = selectedTruck !== 'all' || startDate || endDate;

  if (trucks.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <EmptyState
            icon={BarChart3}
            title="Nenhum dado disponível"
            description="Cadastre caminhões e adicione registros de abastecimento/manutenção para ver os relatórios"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros
              </CardTitle>
              <CardDescription>
                Filtre os dados por caminhão e período
              </CardDescription>
            </div>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X className="mr-2 h-4 w-4" />
                Limpar Filtros
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Select
              label="Caminhão"
              value={selectedTruck}
              onChange={(e) => setSelectedTruck(e.target.value)}
            >
              <option value="all">Todos os Caminhões</option>
              {trucks.map(truck => (
                <option key={truck.id} value={truck.id}>
                  {truck.placa} - {truck.modelo}
                </option>
              ))}
            </Select>

            <Input
              label="Data Inicial"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />

            <Input
              label="Data Final"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Total Gasto
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
                  Combustível
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
                  Manutenção
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
                  Total de Litros
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

      {/* Gráficos */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Custos por Caminhão</CardTitle>
            <CardDescription>Comparação de gastos com combustível e manutenção</CardDescription>
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
                <Bar dataKey="Combustível" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Manutenção" fill="#ef4444" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Gastos</CardTitle>
            <CardDescription>Total de gastos por caminhão</CardDescription>
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

        {monthlyData.length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Evolução Mensal</CardTitle>
              <CardDescription>Gastos mensais com combustível e manutenção</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                  <XAxis dataKey="mes" stroke="#71717a" />
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
                  <Line type="monotone" dataKey="Combustível" stroke="#f59e0b" strokeWidth={2} />
                  <Line type="monotone" dataKey="Manutenção" stroke="#ef4444" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Detalhamento por Caminhão */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Detalhamento por Caminhão
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
                    Combustível ({stat.fuelRecordsCount} registros)
                  </span>
                  <span className="font-semibold text-orange-600">
                    {formatCurrency(stat.totalFuel)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <Wrench className="h-4 w-4" />
                    Manutenção ({stat.maintenanceCount} registros)
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
                      Consumo Total
                    </p>
                    <p className="mt-1 font-mono text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      {formatNumber(stat.totalLiters, 2)} litros
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
