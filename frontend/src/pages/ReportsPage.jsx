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

const COLORS = ['#5E6AD2', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const tooltipStyle = {
  backgroundColor: 'rgba(10,10,12,0.95)',
  border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: '12px',
  fontFamily: '"Inter", sans-serif',
  color: '#EDEDEF',
};

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
                <Filter className="h-4 w-4" />
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
                <p className="text-sm font-medium text-[var(--color-text-secondary)]">
                  Total Gasto
                </p>
                <p className="mt-1.5 text-2xl font-bold text-[var(--color-text)]">
                  {formatCurrency(overallStats.totalSpent)}
                </p>
              </div>
              <div className="rounded-xl bg-[var(--color-accent)]/10 p-3">
                <DollarSign className="h-5 w-5 text-[var(--color-accent)]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--color-text-secondary)]">
                  Combustível
                </p>
                <p className="mt-1.5 text-2xl font-bold text-[var(--color-text)]">
                  {formatCurrency(overallStats.totalFuel)}
                </p>
              </div>
              <div className="rounded-xl bg-amber-500/10 p-3">
                <FuelIcon className="h-5 w-5 text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--color-text-secondary)]">
                  Manutenção
                </p>
                <p className="mt-1.5 text-2xl font-bold text-[var(--color-text)]">
                  {formatCurrency(overallStats.totalMaintenance)}
                </p>
              </div>
              <div className="rounded-xl bg-red-500/10 p-3">
                <Wrench className="h-5 w-5 text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--color-text-secondary)]">
                  Total de Litros
                </p>
                <p className="mt-1.5 text-2xl font-bold text-[var(--color-text)]">
                  {formatNumber(overallStats.totalLiters, 0)}
                </p>
              </div>
              <div className="rounded-xl bg-emerald-500/10 p-3">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
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
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" stroke="#8A8F98" style={{ fontSize: '11px' }} />
                <YAxis stroke="#8A8F98" style={{ fontSize: '11px' }} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value) => formatCurrency(value)}
                />
                <Legend wrapperStyle={{ fontSize: '12px', fontFamily: '"Inter"' }} />
                <Bar dataKey="Combustível" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Manutenção" fill="#EF4444" radius={[4, 4, 0, 0]} />
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
            <ResponsiveContainer width="100%" height={280}>
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
                <Tooltip contentStyle={tooltipStyle} formatter={(value) => formatCurrency(value)} />
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
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="mes" stroke="#8A8F98" style={{ fontSize: '11px' }} />
                  <YAxis stroke="#8A8F98" style={{ fontSize: '11px' }} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value) => formatCurrency(value)}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', fontFamily: '"Inter"' }} />
                  <Line type="monotone" dataKey="Combustível" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="Manutenção" stroke="#EF4444" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Detalhamento por Caminhão */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-[var(--color-text)]">
          Detalhamento por Caminhão
        </h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {stats.map(stat => (
            <Card key={stat.truck.id} className="overflow-hidden">
              <div className="bg-gradient-to-r from-[var(--color-accent)]/20 to-[#8B5CF6]/10 border-b border-[var(--color-border)] px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-[var(--color-text)]">{stat.truck.placa}</h3>
                    <p className="text-sm text-[var(--color-text-secondary)]">{stat.truck.modelo}</p>
                  </div>
                  <Badge variant="default">
                    {formatNumber(stat.truck.km_atual || 0, 0)} km
                  </Badge>
                </div>
              </div>

              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                    <FuelIcon className="h-4 w-4" />
                    Combustível ({stat.fuelRecordsCount} registros)
                  </span>
                  <span className="font-semibold text-amber-400">
                    {formatCurrency(stat.totalFuel)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                    <Wrench className="h-4 w-4" />
                    Manutenção ({stat.maintenanceCount} registros)
                  </span>
                  <span className="font-semibold text-red-400">
                    {formatCurrency(stat.totalMaintenance)}
                  </span>
                </div>

                <div className="border-t border-[var(--color-border)] pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold text-[var(--color-text)]">
                      Total
                    </span>
                    <span className="text-xl font-bold text-[var(--color-accent)]">
                      {formatCurrency(stat.totalSpent)}
                    </span>
                  </div>
                </div>

                {stat.totalLiters > 0 && (
                  <div className="rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] p-3">
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      Consumo Total
                    </p>
                    <p className="mt-1 text-sm font-medium text-[var(--color-text)]">
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
