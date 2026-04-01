import { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Input } from '../components/ui/Input';
import { EmptyState } from '../components/ui/EmptyState';
import { useSectionPrefs, SectionCustomizerButton, SectionCustomizerModal } from '../components/ui/SectionCustomizer';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, Fuel as FuelIcon, Wrench, BarChart3, Filter, X, Truck, PieChart as PieChartIcon, LineChart as LineChartIcon, Receipt, Gauge, Route, Award, Users, Download, FileSpreadsheet, FileText, Building2, Trophy } from 'lucide-react';
import { formatCurrency, formatNumber, formatDate } from '../lib/utils';
import { useTheme } from '../contexts/ThemeContext';
import {
  exportDREtoPDF, exportTruckReportToPDF, exportDriverReportToPDF,
  exportFuelTableToPDF, exportMaintenanceTableToPDF, exportFullReportToPDF,
  exportDREtoExcel, exportTruckReportToExcel, exportDriverReportToExcel,
  exportFuelTableToExcel, exportMaintenanceTableToExcel, exportFullReportToExcel,
} from '../lib/exportUtils';

const COLORS = ['#5E6AD2', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const REPORT_SECTIONS = [
  { id: 'filters', label: 'Filtros', description: 'Filtrar por caminhão e período', icon: Filter },
  { id: 'dre', label: 'DRE Simplificado', description: 'Demonstrativo de resultado: receita, despesas e lucro', icon: Receipt },
  { id: 'summary_cards', label: 'Cards de Resumo', description: 'Total gasto, combustível, manutenção, litros', icon: DollarSign },
  { id: 'maintenance_table', label: 'Manutenções Detalhadas', description: 'Tabela com todos os registros de manutenção', icon: Wrench },
  { id: 'fuel_table', label: 'Abastecimentos Detalhados', description: 'Tabela com todos os registros de abastecimento', icon: FuelIcon },
  { id: 'chart_costs', label: 'Custos por Caminhão', description: 'Gráfico de barras comparativo', icon: BarChart3 },
  { id: 'chart_distribution', label: 'Distribuição de Gastos', description: 'Gráfico de pizza', icon: PieChartIcon },
  { id: 'chart_monthly', label: 'Evolução Mensal', description: 'Gráfico de linha temporal', icon: LineChartIcon },
  { id: 'truck_detail', label: 'Detalhamento por Caminhão', description: 'Cards individuais com resumo de cada veículo', icon: Truck },
  { id: 'driver_detail', label: 'Detalhamento por Motorista', description: 'Performance, km, produtividade por motorista', icon: Users },
  { id: 'client_profitability', label: 'Rentabilidade por Cliente', description: 'Ranking de clientes por margem e faturamento', icon: Building2 },
  { id: 'profitability_ranking', label: 'Ranking Geral', description: 'Top caminhões, motoristas e clientes por lucro', icon: Trophy },
];

const DEFAULT_ORDER = ['filters', 'dre', 'client_profitability', 'profitability_ranking', 'summary_cards', 'maintenance_table', 'fuel_table', 'chart_costs', 'chart_distribution', 'chart_monthly', 'truck_detail', 'driver_detail'];
const DEFAULT_VISIBILITY = {
  filters: true,
  dre: true,
  summary_cards: true,
  maintenance_table: true,
  fuel_table: true,
  chart_costs: true,
  chart_distribution: true,
  chart_monthly: true,
  truck_detail: true,
  driver_detail: true,
  client_profitability: true,
  profitability_ranking: true,
};

export function ReportsPage({ trucks, drivers, clients, fuelRecords, maintenanceRecords, trips }) {
  const { isDark } = useTheme();
  const [showCustomize, setShowCustomize] = useState(false);

  const { prefs, isVisible, getOrder, moveUp, moveDown, toggleVisibility, reset } = useSectionPrefs(
    'reports_prefs', DEFAULT_ORDER, DEFAULT_VISIBILITY
  );

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
  const [selectedTruck, setSelectedTruck] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Aplicar filtros
  const filteredData = useMemo(() => {
    let filteredFuel = fuelRecords;
    let filteredMaintenance = maintenanceRecords;

    if (selectedTruck !== 'all') {
      const truckId = Number(selectedTruck);
      filteredFuel = filteredFuel.filter(r => r.caminhao_id === truckId);
      filteredMaintenance = filteredMaintenance.filter(r => r.caminhao_id === truckId);
    }

    if (startDate) {
      filteredFuel = filteredFuel.filter(r => new Date(r.created_at) >= new Date(startDate));
      filteredMaintenance = filteredMaintenance.filter(r => new Date(r.data_manutencao) >= new Date(startDate));
    }

    if (endDate) {
      filteredFuel = filteredFuel.filter(r => new Date(r.created_at) <= new Date(endDate));
      filteredMaintenance = filteredMaintenance.filter(r => new Date(r.data_manutencao) <= new Date(endDate));
    }

    return { filteredFuel, filteredMaintenance };
  }, [fuelRecords, maintenanceRecords, selectedTruck, startDate, endDate]);

  const stats = useMemo(() => {
    const trucksToShow = selectedTruck === 'all'
      ? trucks
      : trucks.filter(t => t.id === Number(selectedTruck));

    const finalized = (trips || []).filter(t => t.status === 'finalizada');

    return trucksToShow.map(truck => {
      const fuelData = filteredData.filteredFuel.filter(r => r.caminhao_id === truck.id);
      const maintenanceData = filteredData.filteredMaintenance.filter(r => r.caminhao_id === truck.id);

      const totalFuel = fuelData.reduce((sum, r) => sum + Number(r.valor_total || 0), 0);
      const totalMaintenance = maintenanceData.reduce((sum, r) => sum + Number(r.valor_total || 0), 0);
      const totalLiters = fuelData.reduce((sum, r) => sum + Number(r.litros || 0), 0);
      const totalKm = fuelData.reduce((sum, r) => sum + (Number(r.km_registro) || 0), 0);
      const kmPerLiter = totalLiters > 0 ? totalKm / totalLiters : 0;
      const totalSpent = totalFuel + totalMaintenance;
      const costPerKm = totalKm > 0 ? totalSpent / totalKm : 0;

      // Trip data for this truck
      const truckTrips = finalized.filter(t => t.caminhao_id === truck.id);
      const tripReceita = truckTrips.reduce((s, t) => s + (Number(t.valor_total_frete) || 0), 0);
      const tripCustos = truckTrips.reduce((s, t) =>
        s + (Number(t.custo_combustivel) || 0) + (Number(t.custo_pedagio) || 0) +
        (Number(t.custo_manutencao) || 0) + (Number(t.custo_outros) || 0), 0);
      const tripLucro = tripReceita - tripCustos;
      const tripMargem = tripReceita > 0 ? (tripLucro / tripReceita) * 100 : 0;

      return {
        truck,
        totalFuel,
        totalMaintenance,
        totalSpent,
        totalLiters,
        totalKm,
        kmPerLiter,
        costPerKm,
        fuelRecordsCount: fuelData.length,
        maintenanceCount: maintenanceData.length,
        tripsCount: truckTrips.length,
        tripReceita,
        tripCustos,
        tripLucro,
        tripMargem
      };
    });
  }, [trucks, filteredData, selectedTruck, trips]);

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

  const monthlyData = useMemo(() => {
    const months = {};

    filteredData.filteredFuel.forEach(record => {
      const date = new Date(record.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!months[monthKey]) months[monthKey] = { combustivel: 0, manutencao: 0 };
      months[monthKey].combustivel += Number(record.valor_total || 0);
    });

    filteredData.filteredMaintenance.forEach(record => {
      const date = new Date(record.data_manutencao);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!months[monthKey]) months[monthKey] = { combustivel: 0, manutencao: 0 };
      months[monthKey].manutencao += Number(record.valor_total || 0);
    });

    return Object.keys(months).sort().map(key => ({
      mes: key,
      Combustível: Number(months[key].combustivel.toFixed(2)),
      Manutenção: Number(months[key].manutencao.toFixed(2))
    }));
  }, [filteredData]);

  // DRE data — filtered by date range
  const dreData = useMemo(() => {
    let filteredTrips = (trips || []).filter(t => t.status === 'finalizada');

    if (startDate) filteredTrips = filteredTrips.filter(t => new Date(t.data_finalizacao || t.created_at) >= new Date(startDate));
    if (endDate) filteredTrips = filteredTrips.filter(t => new Date(t.data_finalizacao || t.created_at) <= new Date(endDate));

    const receita = filteredTrips.reduce((s, t) => s + (Number(t.valor_total_frete) || 0), 0);

    const custoCombustivel = filteredTrips.reduce((s, t) => s + (Number(t.custo_combustivel) || 0), 0);
    const custoPedagio = filteredTrips.reduce((s, t) => s + (Number(t.custo_pedagio) || 0), 0);
    const custoManutencao = filteredTrips.reduce((s, t) => s + (Number(t.custo_manutencao) || 0), 0);
    const custoOutros = filteredTrips.reduce((s, t) => s + (Number(t.custo_outros) || 0), 0);
    const despesasViagens = custoCombustivel + custoPedagio + custoManutencao + custoOutros;

    // General expenses (fuel + maintenance not directly tied to trips)
    const despesasCombGeral = filteredData.filteredFuel.reduce((s, r) => s + (Number(r.valor_total) || 0), 0);
    const despesasManGeral = filteredData.filteredMaintenance.reduce((s, r) => s + (Number(r.valor_total) || 0), 0);
    const despesasGerais = despesasCombGeral + despesasManGeral;

    const despesasTotal = despesasViagens + despesasGerais;
    const lucro = receita - despesasTotal;
    const margem = receita > 0 ? (lucro / receita) * 100 : 0;

    // Monthly evolution (receita vs despesa)
    const months = {};
    filteredTrips.forEach(t => {
      const d = new Date(t.data_finalizacao || t.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!months[key]) months[key] = { receita: 0, despesas: 0 };
      months[key].receita += Number(t.valor_total_frete) || 0;
      months[key].despesas += (Number(t.custo_combustivel) || 0) + (Number(t.custo_pedagio) || 0) +
        (Number(t.custo_manutencao) || 0) + (Number(t.custo_outros) || 0);
    });
    filteredData.filteredFuel.forEach(r => {
      const d = new Date(r.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!months[key]) months[key] = { receita: 0, despesas: 0 };
      months[key].despesas += Number(r.valor_total) || 0;
    });
    filteredData.filteredMaintenance.forEach(r => {
      const d = new Date(r.data_manutencao);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!months[key]) months[key] = { receita: 0, despesas: 0 };
      months[key].despesas += Number(r.valor_total) || 0;
    });
    const monthlyDre = Object.keys(months).sort().map(key => ({
      mes: key,
      Receita: Number(months[key].receita.toFixed(2)),
      Despesas: Number(months[key].despesas.toFixed(2)),
      Lucro: Number((months[key].receita - months[key].despesas).toFixed(2))
    }));

    return {
      receita, custoCombustivel, custoPedagio, custoManutencao, custoOutros,
      despesasViagens, despesasCombGeral, despesasManGeral, despesasGerais,
      despesasTotal, lucro, margem, monthlyDre, totalViagens: filteredTrips.length
    };
  }, [trips, filteredData, startDate, endDate]);

  const driverStats = useMemo(() => {
    const driversToShow = drivers || [];
    const finalized = (trips || []).filter(t => t.status === 'finalizada');

    return driversToShow.map(driver => {
      const driverTrips = finalized.filter(t => t.motorista_id === driver.id);
      const driverFuel = (fuelRecords || []).filter(r => r.motorista_id === driver.id);

      const viagens = driverTrips.length;
      const totalKm = driverTrips.reduce((s, t) => s + (Number(t.km_total) || 0), 0);
      const receita = driverTrips.reduce((s, t) => s + (Number(t.valor_total_frete) || 0), 0);
      const custos = driverTrips.reduce((s, t) =>
        s + (Number(t.custo_combustivel) || 0) + (Number(t.custo_pedagio) || 0) +
        (Number(t.custo_manutencao) || 0) + (Number(t.custo_outros) || 0), 0);
      const lucro = receita - custos;
      const margem = receita > 0 ? (lucro / receita) * 100 : 0;
      const litros = driverFuel.reduce((s, r) => s + (Number(r.litros) || 0), 0);
      const kmPerLiter = litros > 0 ? totalKm / litros : 0;
      const avgKmPerTrip = viagens > 0 ? totalKm / viagens : 0;

      return { driver, viagens, totalKm, receita, custos, lucro, margem, litros, kmPerLiter, avgKmPerTrip };
    }).filter(s => s.viagens > 0 || s.litros > 0);
  }, [drivers, trips, fuelRecords]);

  // Client profitability
  const clientStats = useMemo(() => {
    const clientList = clients || [];
    const finalized = (trips || []).filter(t => t.status === 'finalizada');
    if (startDate || endDate) {
      // apply date filters
    }
    let filtered = finalized;
    if (startDate) filtered = filtered.filter(t => new Date(t.data_finalizacao || t.created_at) >= new Date(startDate));
    if (endDate) filtered = filtered.filter(t => new Date(t.data_finalizacao || t.created_at) <= new Date(endDate));

    return clientList.map(client => {
      const clientTrips = filtered.filter(t => t.cliente_id === client.id);
      const viagens = clientTrips.length;
      const receita = clientTrips.reduce((s, t) => s + (Number(t.valor_total_frete) || 0), 0);
      const custos = clientTrips.reduce((s, t) =>
        s + (Number(t.custo_combustivel) || 0) + (Number(t.custo_pedagio) || 0) +
        (Number(t.custo_manutencao) || 0) + (Number(t.custo_outros) || 0), 0);
      const lucro = receita - custos;
      const margem = receita > 0 ? (lucro / receita) * 100 : 0;
      const sacas = clientTrips.reduce((s, t) => s + (Number(t.quantidade_sacas) || 0), 0);

      return { client, viagens, receita, custos, lucro, margem, sacas };
    }).filter(s => s.viagens > 0).sort((a, b) => b.lucro - a.lucro);
  }, [clients, trips, startDate, endDate]);

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

  // Section renderers
  const sectionRenderers = {
    filters: () => (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filtros
              </CardTitle>
              <CardDescription>Filtre os dados por caminhão e período</CardDescription>
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
            <Select label="Caminhão" value={selectedTruck} onChange={(e) => setSelectedTruck(e.target.value)}>
              <option value="all">Todos os Caminhões</option>
              {trucks.map(truck => (
                <option key={truck.id} value={truck.id}>{truck.placa} - {truck.modelo}</option>
              ))}
            </Select>
            <Input label="Data Inicial" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <Input label="Data Final" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </CardContent>
      </Card>
    ),

    dre: () => {
      const d = dreData;
      const dreLines = [
        { label: 'RECEITAS', value: null, isHeader: true },
        { label: 'Frete de viagens', value: d.receita, color: 'text-emerald-400', indent: true, detail: `${d.totalViagens} viagen${d.totalViagens !== 1 ? 's' : ''} finalizadas` },
        { label: 'DESPESAS OPERACIONAIS (VIAGENS)', value: null, isHeader: true },
        { label: 'Combustivel', value: -d.custoCombustivel, color: 'text-red-400', indent: true },
        { label: 'Pedagio', value: -d.custoPedagio, color: 'text-red-400', indent: true },
        { label: 'Manutencao', value: -d.custoManutencao, color: 'text-red-400', indent: true },
        { label: 'Outros', value: -d.custoOutros, color: 'text-red-400', indent: true },
        { label: 'Subtotal viagens', value: -d.despesasViagens, color: 'text-red-400', isBold: true, indent: true },
        { label: 'DESPESAS GERAIS (FROTA)', value: null, isHeader: true },
        { label: 'Abastecimentos', value: -d.despesasCombGeral, color: 'text-amber-400', indent: true },
        { label: 'Manutencoes', value: -d.despesasManGeral, color: 'text-red-400', indent: true },
        { label: 'Subtotal frota', value: -d.despesasGerais, color: 'text-red-400', isBold: true, indent: true },
        { label: 'RESULTADO', value: null, isHeader: true, isResult: true },
        { label: 'Lucro / Prejuizo', value: d.lucro, color: d.lucro >= 0 ? 'text-emerald-400' : 'text-red-400', isBold: true, isResult: true },
      ];

      return (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                DRE Simplificado
              </CardTitle>
              <CardDescription>
                Demonstrativo de resultado {startDate || endDate ? 'no periodo filtrado' : 'geral'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Result summary cards */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-6">
                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-emerald-400/70">Receita</p>
                  <p className="text-lg font-bold text-emerald-400">{formatCurrency(d.receita)}</p>
                </div>
                <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-red-400/70">Despesas</p>
                  <p className="text-lg font-bold text-red-400">{formatCurrency(d.despesasTotal)}</p>
                </div>
                <div className={`rounded-xl border p-3 text-center ${d.lucro >= 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                  <p className={`text-[10px] uppercase tracking-wider ${d.lucro >= 0 ? 'text-emerald-400/70' : 'text-red-400/70'}`}>Resultado</p>
                  <p className={`text-lg font-bold ${d.lucro >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{formatCurrency(d.lucro)}</p>
                </div>
                <div className={`rounded-xl border p-3 text-center ${d.margem >= 0 ? 'bg-blue-500/10 border-blue-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                  <p className="text-[10px] uppercase tracking-wider text-blue-400/70">Margem</p>
                  <p className={`text-lg font-bold ${d.margem >= 0 ? 'text-blue-400' : 'text-red-400'}`}>{d.margem.toFixed(1)}%</p>
                </div>
              </div>

              {/* DRE table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <tbody>
                    {dreLines.map((line, i) => {
                      if (line.isHeader) {
                        return (
                          <tr key={i} className={`${line.isResult ? 'border-t-2 border-[var(--color-border)]' : 'border-t border-[var(--color-border)]'}`}>
                            <td colSpan={2} className={`px-3 py-2.5 text-xs font-bold uppercase tracking-wider ${line.isResult ? 'text-[var(--color-text)]' : 'text-[var(--color-text-secondary)]'}`}>
                              {line.label}
                            </td>
                          </tr>
                        );
                      }
                      return (
                        <tr key={i} className={`${line.isResult ? 'bg-[var(--color-surface)]' : ''}`}>
                          <td className={`px-3 py-2 ${line.indent ? 'pl-6' : ''} ${line.isBold ? 'font-semibold text-[var(--color-text)]' : 'text-[var(--color-text-secondary)]'}`}>
                            {line.label}
                            {line.detail && <span className="ml-2 text-xs text-[var(--color-text-secondary)]">({line.detail})</span>}
                          </td>
                          <td className={`px-3 py-2 text-right tabular-nums ${line.isBold ? 'font-bold' : 'font-medium'} ${line.color || 'text-[var(--color-text)]'} ${line.isResult ? 'text-lg' : ''}`}>
                            {line.value !== null ? formatCurrency(Math.abs(line.value)) : ''}
                            {line.value !== null && line.value < 0 && !line.isResult ? ' (-)' : ''}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Monthly DRE chart */}
          {d.monthlyDre.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Evolucao Receita vs Despesas</CardTitle>
                <CardDescription>Resultado mensal ao longo do tempo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] sm:h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={d.monthlyDre}>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                      <XAxis dataKey="mes" stroke={axisColor} style={{ fontSize: '11px' }} />
                      <YAxis stroke={axisColor} style={{ fontSize: '11px' }} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
                      <Tooltip contentStyle={tooltipStyle} formatter={v => formatCurrency(v)} />
                      <Legend wrapperStyle={{ fontSize: '12px', fontFamily: '"Inter"' }} />
                      <Bar dataKey="Receita" fill="#10B981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Despesas" fill="#EF4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      );
    },

    summary_cards: () => (
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-[var(--color-text-secondary)]">Total Gasto</p>
                <p className="mt-1 sm:mt-1.5 text-lg sm:text-2xl font-bold text-[var(--color-text)]">{formatCurrency(overallStats.totalSpent)}</p>
              </div>
              <div className="rounded-xl bg-[var(--color-accent)]/10 p-2 sm:p-3">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-[var(--color-accent)]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-[var(--color-text-secondary)]">Combustível</p>
                <p className="mt-1 sm:mt-1.5 text-lg sm:text-2xl font-bold text-[var(--color-text)]">{formatCurrency(overallStats.totalFuel)}</p>
              </div>
              <div className="rounded-xl bg-amber-500/10 p-2 sm:p-3">
                <FuelIcon className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-[var(--color-text-secondary)]">Manutenção</p>
                <p className="mt-1 sm:mt-1.5 text-lg sm:text-2xl font-bold text-[var(--color-text)]">{formatCurrency(overallStats.totalMaintenance)}</p>
              </div>
              <div className="rounded-xl bg-red-500/10 p-2 sm:p-3">
                <Wrench className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-[var(--color-text-secondary)]">Total de Litros</p>
                <p className="mt-1 sm:mt-1.5 text-lg sm:text-2xl font-bold text-[var(--color-text)]">{formatNumber(overallStats.totalLiters, 0)}</p>
              </div>
              <div className="rounded-xl bg-emerald-500/10 p-2 sm:p-3">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    ),

    maintenance_table: () => (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-red-400" />
            Manutenções Detalhadas ({filteredData.filteredMaintenance.length})
          </CardTitle>
          <CardDescription>Registros individuais de manutenção</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredData.filteredMaintenance.length === 0 ? (
            <p className="py-4 text-center text-sm text-[var(--color-text-secondary)]">Nenhuma manutenção encontrada no período</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)]">
                    {selectedTruck === 'all' && <th className="px-3 py-2 text-left font-medium text-[var(--color-text-secondary)]">Caminhão</th>}
                    <th className="px-3 py-2 text-left font-medium text-[var(--color-text-secondary)]">Data</th>
                    <th className="px-3 py-2 text-left font-medium text-[var(--color-text-secondary)]">Tipo</th>
                    <th className="px-3 py-2 text-left font-medium text-[var(--color-text-secondary)]">Descrição</th>
                    <th className="px-3 py-2 text-left font-medium text-[var(--color-text-secondary)]">Oficina</th>
                    <th className="px-3 py-2 text-right font-medium text-[var(--color-text-secondary)]">Custo</th>
                    <th className="px-3 py-2 text-right font-medium text-[var(--color-text-secondary)]">KM</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.filteredMaintenance
                    .sort((a, b) => new Date(b.data_manutencao) - new Date(a.data_manutencao))
                    .map(record => {
                    const truckInfo = trucks.find(t => t.id === record.caminhao_id);
                    return (
                      <tr key={record.id} className="border-b border-[var(--color-border)]/50 hover:bg-[var(--color-surface)]">
                        {selectedTruck === 'all' && <td className="px-3 py-2 font-medium text-[var(--color-text)]">{truckInfo?.placa || '-'}</td>}
                        <td className="px-3 py-2 text-[var(--color-text)]">{formatDate(record.data_manutencao)}</td>
                        <td className="px-3 py-2">
                          <Badge variant={record.tipo_manutencao === 'Preventiva' ? 'success' : 'warning'}>
                            {record.tipo_manutencao || '-'}
                          </Badge>
                        </td>
                        <td className="px-3 py-2 text-[var(--color-text)]">{record.descricao || '-'}</td>
                        <td className="px-3 py-2 text-[var(--color-text-secondary)]">{record.oficina || '-'}</td>
                        <td className="px-3 py-2 text-right font-medium text-red-500">{formatCurrency(record.valor_total)}</td>
                        <td className="px-3 py-2 text-right text-[var(--color-text-secondary)]">{record.km_manutencao ? formatNumber(record.km_manutencao, 0) : '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-[var(--color-border)]">
                    <td colSpan={selectedTruck === 'all' ? 5 : 4} className="px-3 py-2 font-semibold text-[var(--color-text)]">Total</td>
                    <td className="px-3 py-2 text-right font-bold text-red-500">
                      {formatCurrency(filteredData.filteredMaintenance.reduce((s, r) => s + Number(r.valor_total || r.custo || 0), 0))}
                    </td>
                    <td className="px-3 py-2"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    ),

    fuel_table: () => (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FuelIcon className="h-5 w-5 text-amber-400" />
            Abastecimentos Detalhados ({filteredData.filteredFuel.length})
          </CardTitle>
          <CardDescription>Registros individuais de abastecimento</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredData.filteredFuel.length === 0 ? (
            <p className="py-4 text-center text-sm text-[var(--color-text-secondary)]">Nenhum abastecimento encontrado no período</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)]">
                    {selectedTruck === 'all' && <th className="px-3 py-2 text-left font-medium text-[var(--color-text-secondary)]">Caminhão</th>}
                    <th className="px-3 py-2 text-left font-medium text-[var(--color-text-secondary)]">Data</th>
                    <th className="px-3 py-2 text-left font-medium text-[var(--color-text-secondary)]">Posto</th>
                    <th className="px-3 py-2 text-right font-medium text-[var(--color-text-secondary)]">Litros</th>
                    <th className="px-3 py-2 text-right font-medium text-[var(--color-text-secondary)]">Preço/L</th>
                    <th className="px-3 py-2 text-right font-medium text-[var(--color-text-secondary)]">Total</th>
                    <th className="px-3 py-2 text-right font-medium text-[var(--color-text-secondary)]">KM</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.filteredFuel
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                    .map(record => {
                    const truckInfo = trucks.find(t => t.id === record.caminhao_id);
                    return (
                      <tr key={record.id} className="border-b border-[var(--color-border)]/50 hover:bg-[var(--color-surface)]">
                        {selectedTruck === 'all' && <td className="px-3 py-2 font-medium text-[var(--color-text)]">{truckInfo?.placa || '-'}</td>}
                        <td className="px-3 py-2 text-[var(--color-text)]">{formatDate(record.created_at)}</td>
                        <td className="px-3 py-2 text-[var(--color-text)]">{record.posto || '-'}</td>
                        <td className="px-3 py-2 text-right text-[var(--color-text)]">{formatNumber(record.litros, 2)}</td>
                        <td className="px-3 py-2 text-right text-[var(--color-text)]">{record.litros > 0 ? formatCurrency(Number(record.valor_total) / Number(record.litros)) : '-'}</td>
                        <td className="px-3 py-2 text-right font-medium text-amber-500">{formatCurrency(record.valor_total)}</td>
                        <td className="px-3 py-2 text-right text-[var(--color-text-secondary)]">{record.km_registro ? formatNumber(record.km_registro, 0) : '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-[var(--color-border)]">
                    <td colSpan={selectedTruck === 'all' ? 3 : 2} className="px-3 py-2 font-semibold text-[var(--color-text)]">Total</td>
                    <td className="px-3 py-2 text-right font-semibold text-[var(--color-text)]">
                      {formatNumber(filteredData.filteredFuel.reduce((s, r) => s + Number(r.litros || 0), 0), 2)}
                    </td>
                    <td className="px-3 py-2"></td>
                    <td className="px-3 py-2 text-right font-bold text-amber-500">
                      {formatCurrency(filteredData.filteredFuel.reduce((s, r) => s + Number(r.valor_total || 0), 0))}
                    </td>
                    <td className="px-3 py-2"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    ),

    chart_costs: () => (
      <Card>
        <CardHeader>
          <CardTitle>Custos por Caminhão</CardTitle>
          <CardDescription>Comparação de gastos com combustível e manutenção</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] sm:h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="name" stroke={axisColor} style={{ fontSize: '11px' }} />
                <YAxis stroke={axisColor} style={{ fontSize: '11px' }} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value) => formatCurrency(value)} />
                <Legend wrapperStyle={{ fontSize: '12px', fontFamily: '"Inter"' }} />
                <Bar dataKey="Combustível" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Manutenção" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    ),

    chart_distribution: () => (
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Gastos</CardTitle>
          <CardDescription>Total de gastos por caminhão</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80} fill="#8884d8" dataKey="value">
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    ),

    chart_monthly: () => {
      if (monthlyData.length === 0) return null;
      return (
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Evolução Mensal</CardTitle>
            <CardDescription>Gastos mensais com combustível e manutenção</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="mes" stroke={axisColor} style={{ fontSize: '11px' }} />
                <YAxis stroke={axisColor} style={{ fontSize: '11px' }} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value) => formatCurrency(value)} />
                <Legend wrapperStyle={{ fontSize: '12px', fontFamily: '"Inter"' }} />
                <Line type="monotone" dataKey="Combustível" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Manutenção" stroke="#EF4444" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      );
    },

    truck_detail: () => {
      const ranking = [...stats]
        .filter(s => s.totalKm > 0 || s.tripsCount > 0)
        .sort((a, b) => b.kmPerLiter - a.kmPerLiter);

      return (
        <div className="space-y-6">
          {/* Efficiency Ranking */}
          {ranking.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-400" />
                  Ranking de Eficiencia
                </CardTitle>
                <CardDescription>Caminhoes ordenados por consumo (km/l)</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--color-border)] text-[var(--color-text-secondary)]">
                        <th className="px-4 py-3 text-left font-medium">#</th>
                        <th className="px-4 py-3 text-left font-medium">Caminhao</th>
                        <th className="px-4 py-3 text-right font-medium">km/l</th>
                        <th className="px-4 py-3 text-right font-medium">Custo/km</th>
                        <th className="px-4 py-3 text-right font-medium hidden sm:table-cell">Viagens</th>
                        <th className="px-4 py-3 text-right font-medium hidden sm:table-cell">Receita</th>
                        <th className="px-4 py-3 text-right font-medium">Lucro</th>
                        <th className="px-4 py-3 text-right font-medium hidden sm:table-cell">Margem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ranking.map((s, i) => (
                        <tr key={s.truck.id} className="border-b border-[var(--color-border)] last:border-0">
                          <td className="px-4 py-3 font-medium text-[var(--color-text-secondary)]">
                            {i === 0 ? <span className="text-amber-400 font-bold">1</span> : i + 1}
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-medium text-[var(--color-text)]">{s.truck.placa}</span>
                            <span className="ml-2 text-xs text-[var(--color-text-secondary)]">{s.truck.modelo}</span>
                          </td>
                          <td className="px-4 py-3 text-right tabular-nums font-semibold text-[var(--color-text)]">
                            {s.kmPerLiter > 0 ? formatNumber(s.kmPerLiter, 2) : '-'}
                          </td>
                          <td className="px-4 py-3 text-right tabular-nums text-[var(--color-text)]">
                            {s.costPerKm > 0 ? formatCurrency(s.costPerKm) : '-'}
                          </td>
                          <td className="px-4 py-3 text-right tabular-nums text-[var(--color-text-secondary)] hidden sm:table-cell">
                            {s.tripsCount}
                          </td>
                          <td className="px-4 py-3 text-right tabular-nums text-[var(--color-text)] hidden sm:table-cell">
                            {s.tripReceita > 0 ? formatCurrency(s.tripReceita) : '-'}
                          </td>
                          <td className={`px-4 py-3 text-right tabular-nums font-semibold ${s.tripLucro >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {s.tripsCount > 0 ? formatCurrency(s.tripLucro) : '-'}
                          </td>
                          <td className={`px-4 py-3 text-right tabular-nums hidden sm:table-cell ${s.tripMargem >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {s.tripsCount > 0 ? `${s.tripMargem.toFixed(1)}%` : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Per-truck detail cards */}
          <h2 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
            Fichas Individuais
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
                    <Badge variant="default">{formatNumber(stat.truck.km_atual || 0, 0)} km</Badge>
                  </div>
                </div>
                <CardContent className="p-6 space-y-4">
                  {/* Efficiency KPIs */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] p-2.5 text-center">
                      <Gauge className="h-3.5 w-3.5 mx-auto text-blue-400 mb-1" />
                      <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-secondary)]">km/l</p>
                      <p className="text-sm font-bold text-[var(--color-text)]">
                        {stat.kmPerLiter > 0 ? formatNumber(stat.kmPerLiter, 2) : '-'}
                      </p>
                    </div>
                    <div className="rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] p-2.5 text-center">
                      <DollarSign className="h-3.5 w-3.5 mx-auto text-amber-400 mb-1" />
                      <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-secondary)]">Custo/km</p>
                      <p className="text-sm font-bold text-[var(--color-text)]">
                        {stat.costPerKm > 0 ? `R$${stat.costPerKm.toFixed(2)}` : '-'}
                      </p>
                    </div>
                    <div className="rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] p-2.5 text-center">
                      <Route className="h-3.5 w-3.5 mx-auto text-purple-400 mb-1" />
                      <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-secondary)]">Viagens</p>
                      <p className="text-sm font-bold text-[var(--color-text)]">{stat.tripsCount}</p>
                    </div>
                  </div>

                  {/* Costs breakdown */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                        <FuelIcon className="h-4 w-4" /> Combustivel ({stat.fuelRecordsCount} reg.)
                      </span>
                      <span className="font-semibold text-amber-400 tabular-nums">{formatCurrency(stat.totalFuel)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                        <Wrench className="h-4 w-4" /> Manutencao ({stat.maintenanceCount} reg.)
                      </span>
                      <span className="font-semibold text-red-400 tabular-nums">{formatCurrency(stat.totalMaintenance)}</span>
                    </div>
                    {stat.totalLiters > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[var(--color-text-secondary)]">Litros consumidos</span>
                        <span className="font-medium text-[var(--color-text)] tabular-nums">{formatNumber(stat.totalLiters, 1)} L</span>
                      </div>
                    )}
                  </div>

                  {/* Total cost */}
                  <div className="border-t border-[var(--color-border)] pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-[var(--color-text)]">Custo Total</span>
                      <span className="text-lg font-bold text-[var(--color-accent)] tabular-nums">{formatCurrency(stat.totalSpent)}</span>
                    </div>
                  </div>

                  {/* Trip profitability */}
                  {stat.tripsCount > 0 && (
                    <div className="rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] p-3 space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">Rentabilidade (viagens)</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[var(--color-text-secondary)]">Receita frete</span>
                        <span className="text-emerald-400 font-medium tabular-nums">{formatCurrency(stat.tripReceita)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[var(--color-text-secondary)]">Custos viagens</span>
                        <span className="text-red-400 font-medium tabular-nums">{formatCurrency(stat.tripCustos)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm border-t border-[var(--color-border)] pt-2">
                        <span className="font-semibold text-[var(--color-text)]">Lucro</span>
                        <span className={`font-bold tabular-nums ${stat.tripLucro >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {formatCurrency(stat.tripLucro)} <span className="text-xs">({stat.tripMargem.toFixed(1)}%)</span>
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      );
    },

    driver_detail: () => {
      if (driverStats.length === 0) return null;

      const ranked = [...driverStats].sort((a, b) => b.viagens - a.viagens);

      return (
        <div className="space-y-6">
          {/* Driver ranking table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-400" />
                Ranking de Motoristas
              </CardTitle>
              <CardDescription>Performance por motorista — ordenado por viagens</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--color-border)] text-[var(--color-text-secondary)]">
                      <th className="px-4 py-3 text-left font-medium">#</th>
                      <th className="px-4 py-3 text-left font-medium">Motorista</th>
                      <th className="px-4 py-3 text-right font-medium">Viagens</th>
                      <th className="px-4 py-3 text-right font-medium hidden sm:table-cell">Km Total</th>
                      <th className="px-4 py-3 text-right font-medium hidden sm:table-cell">Km/Viagem</th>
                      <th className="px-4 py-3 text-right font-medium">Receita</th>
                      <th className="px-4 py-3 text-right font-medium">Lucro</th>
                      <th className="px-4 py-3 text-right font-medium hidden sm:table-cell">Margem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ranked.map((s, i) => (
                      <tr key={s.driver.id} className="border-b border-[var(--color-border)] last:border-0">
                        <td className="px-4 py-3 font-medium text-[var(--color-text-secondary)]">{i + 1}</td>
                        <td className="px-4 py-3 font-medium text-[var(--color-text)]">{s.driver.nome}</td>
                        <td className="px-4 py-3 text-right tabular-nums text-[var(--color-text)]">{s.viagens}</td>
                        <td className="px-4 py-3 text-right tabular-nums text-[var(--color-text-secondary)] hidden sm:table-cell">{formatNumber(s.totalKm, 0)}</td>
                        <td className="px-4 py-3 text-right tabular-nums text-[var(--color-text-secondary)] hidden sm:table-cell">{formatNumber(s.avgKmPerTrip, 0)}</td>
                        <td className="px-4 py-3 text-right tabular-nums text-[var(--color-text)]">{formatCurrency(s.receita)}</td>
                        <td className={`px-4 py-3 text-right tabular-nums font-semibold ${s.lucro >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{formatCurrency(s.lucro)}</td>
                        <td className={`px-4 py-3 text-right tabular-nums hidden sm:table-cell ${s.margem >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{s.margem.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Per-driver detail cards */}
          <h2 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
            Fichas Individuais — Motoristas
          </h2>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {ranked.map(s => (
              <Card key={s.driver.id} className="overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500/20 to-[var(--color-accent)]/10 border-b border-[var(--color-border)] px-6 py-4">
                  <h3 className="text-lg font-bold text-[var(--color-text)]">{s.driver.nome}</h3>
                  {s.driver.telefone && (
                    <p className="text-sm text-[var(--color-text-secondary)]">{s.driver.telefone}</p>
                  )}
                </div>
                <CardContent className="p-6 space-y-4">
                  {/* KPI mini-cards */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] p-2.5 text-center">
                      <Route className="h-3.5 w-3.5 mx-auto text-purple-400 mb-1" />
                      <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-secondary)]">Viagens</p>
                      <p className="text-sm font-bold text-[var(--color-text)]">{s.viagens}</p>
                    </div>
                    <div className="rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] p-2.5 text-center">
                      <Gauge className="h-3.5 w-3.5 mx-auto text-blue-400 mb-1" />
                      <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-secondary)]">Km Total</p>
                      <p className="text-sm font-bold text-[var(--color-text)]">{formatNumber(s.totalKm, 0)}</p>
                    </div>
                    <div className="rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] p-2.5 text-center">
                      <TrendingUp className="h-3.5 w-3.5 mx-auto text-amber-400 mb-1" />
                      <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-secondary)]">Km/Viagem</p>
                      <p className="text-sm font-bold text-[var(--color-text)]">{formatNumber(s.avgKmPerTrip, 0)}</p>
                    </div>
                  </div>

                  {/* Consumption */}
                  {s.litros > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                        <FuelIcon className="h-4 w-4" /> Litros consumidos
                      </span>
                      <span className="font-medium text-[var(--color-text)] tabular-nums">{formatNumber(s.litros, 1)} L</span>
                    </div>
                  )}
                  {s.kmPerLiter > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--color-text-secondary)]">Media km/l</span>
                      <span className="font-medium text-[var(--color-text)] tabular-nums">{formatNumber(s.kmPerLiter, 2)} km/l</span>
                    </div>
                  )}

                  {/* Profitability */}
                  {s.viagens > 0 && (
                    <div className="rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] p-3 space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">Rentabilidade</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[var(--color-text-secondary)]">Receita frete</span>
                        <span className="text-emerald-400 font-medium tabular-nums">{formatCurrency(s.receita)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[var(--color-text-secondary)]">Custos viagens</span>
                        <span className="text-red-400 font-medium tabular-nums">{formatCurrency(s.custos)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm border-t border-[var(--color-border)] pt-2">
                        <span className="font-semibold text-[var(--color-text)]">Lucro</span>
                        <span className={`font-bold tabular-nums ${s.lucro >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {formatCurrency(s.lucro)} <span className="text-xs">({s.margem.toFixed(1)}%)</span>
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      );
    },
    client_profitability: () => {
      if (clientStats.length === 0) return null;
      const chartDataClients = clientStats.slice(0, 10).map(s => ({
        name: s.client.nome.length > 15 ? s.client.nome.slice(0, 15) + '...' : s.client.nome,
        Receita: Number(s.receita.toFixed(2)),
        Custos: Number(s.custos.toFixed(2)),
        Lucro: Number(s.lucro.toFixed(2)),
      }));

      return (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Rentabilidade por Cliente
              </CardTitle>
              <CardDescription>{clientStats.length} cliente(s) com viagens finalizadas</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--color-border)]">
                      <th className="text-left py-2 px-2 text-[var(--color-text-secondary)] font-medium">#</th>
                      <th className="text-left py-2 px-2 text-[var(--color-text-secondary)] font-medium">Cliente</th>
                      <th className="text-right py-2 px-2 text-[var(--color-text-secondary)] font-medium">Viagens</th>
                      <th className="text-right py-2 px-2 text-[var(--color-text-secondary)] font-medium">Sacas</th>
                      <th className="text-right py-2 px-2 text-[var(--color-text-secondary)] font-medium">Receita</th>
                      <th className="text-right py-2 px-2 text-[var(--color-text-secondary)] font-medium">Custos</th>
                      <th className="text-right py-2 px-2 text-[var(--color-text-secondary)] font-medium">Lucro</th>
                      <th className="text-right py-2 px-2 text-[var(--color-text-secondary)] font-medium">Margem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientStats.map((s, i) => (
                      <tr key={s.client.id} className="border-b border-[var(--color-border)]/50 hover:bg-[var(--color-surface-hover)]">
                        <td className="py-2.5 px-2 text-[var(--color-text-secondary)]">{i + 1}</td>
                        <td className="py-2.5 px-2 font-medium text-[var(--color-text)]">{s.client.nome}</td>
                        <td className="py-2.5 px-2 text-right tabular-nums">{s.viagens}</td>
                        <td className="py-2.5 px-2 text-right tabular-nums">{formatNumber(s.sacas)}</td>
                        <td className="py-2.5 px-2 text-right tabular-nums text-emerald-400">{formatCurrency(s.receita)}</td>
                        <td className="py-2.5 px-2 text-right tabular-nums text-red-400">{formatCurrency(s.custos)}</td>
                        <td className={`py-2.5 px-2 text-right tabular-nums font-semibold ${s.lucro >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {formatCurrency(s.lucro)}
                        </td>
                        <td className="py-2.5 px-2 text-right">
                          <Badge variant={s.margem >= 30 ? 'success' : s.margem >= 10 ? 'warning' : 'danger'}>
                            {s.margem.toFixed(1)}%
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Chart */}
          {chartDataClients.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartDataClients} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis dataKey="name" tick={{ fill: axisColor, fontSize: 11 }} />
                    <YAxis tick={{ fill: axisColor, fontSize: 11 }} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatCurrency(v)} />
                    <Legend />
                    <Bar dataKey="Receita" fill="#10B981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Custos" fill="#EF4444" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Lucro" fill="#5E6AD2" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      );
    },

    profitability_ranking: () => {
      const finalized = (trips || []).filter(t => t.status === 'finalizada');
      if (finalized.length === 0) return null;

      // Top trucks by profit
      const truckRanking = stats
        .filter(s => s.tripsCount > 0)
        .sort((a, b) => b.tripLucro - a.tripLucro)
        .slice(0, 5);

      // Top drivers by profit
      const driverRanking = [...driverStats]
        .sort((a, b) => b.lucro - a.lucro)
        .slice(0, 5);

      // Top clients by profit
      const clientRanking = clientStats.slice(0, 5);

      const RankingList = ({ items, getName, getReceita, getLucro, getMargem }) => (
        <div className="space-y-2">
          {items.map((item, i) => {
            const lucro = getLucro(item);
            const margem = getMargem(item);
            return (
              <div key={i} className="flex items-center gap-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] px-4 py-3">
                <span className={`text-lg font-bold ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-amber-600' : 'text-[var(--color-text-secondary)]'}`}>
                  #{i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--color-text)] truncate">{getName(item)}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">Receita: {formatCurrency(getReceita(item))}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-sm font-bold ${lucro >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{formatCurrency(lucro)}</p>
                  <Badge variant={margem >= 30 ? 'success' : margem >= 10 ? 'warning' : 'danger'} className="text-[10px]">
                    {margem.toFixed(1)}%
                  </Badge>
                </div>
              </div>
            );
          })}
          {items.length === 0 && <p className="text-xs text-[var(--color-text-secondary)] text-center py-3">Sem dados</p>}
        </div>
      );

      return (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-400" />
                Ranking de Rentabilidade
              </CardTitle>
              <CardDescription>Top 5 por lucro em cada categoria</CardDescription>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2"><Truck className="h-4 w-4" /> Caminhoes</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <RankingList
                  items={truckRanking}
                  getName={s => `${s.truck.placa} - ${s.truck.modelo || ''}`}
                  getReceita={s => s.tripReceita}
                  getLucro={s => s.tripLucro}
                  getMargem={s => s.tripMargem}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2"><Users className="h-4 w-4" /> Motoristas</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <RankingList
                  items={driverRanking}
                  getName={s => s.driver.nome}
                  getReceita={s => s.receita}
                  getLucro={s => s.lucro}
                  getMargem={s => s.margem}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2"><Building2 className="h-4 w-4" /> Clientes</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <RankingList
                  items={clientRanking}
                  getName={s => s.client.nome}
                  getReceita={s => s.receita}
                  getLucro={s => s.lucro}
                  getMargem={s => s.margem}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      );
    },
  };

  // Charts that should be in a grid together
  const chartIds = ['chart_costs', 'chart_distribution', 'chart_monthly'];

  // Group consecutive chart sections for grid layout
  const renderOrderedSections = () => {
    const order = getOrder();
    const elements = [];
    let chartBuffer = [];

    const flushCharts = () => {
      if (chartBuffer.length > 0) {
        elements.push(
          <div key={`chart-group-${chartBuffer[0]}`} className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {chartBuffer.map(id => {
              const renderer = sectionRenderers[id];
              const content = renderer();
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
        const renderer = sectionRenderers[id];
        if (renderer) {
          const content = renderer();
          if (content) elements.push(<div key={id}>{content}</div>);
        }
      }
    }
    flushCharts();

    return elements;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[var(--color-text)]">Relatórios</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Análise detalhada da frota</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative group">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
            <div className="absolute right-0 top-full mt-1 z-50 hidden group-hover:block min-w-[220px]">
              <Card className="shadow-xl border border-[var(--color-border)]">
                <CardContent className="p-2 space-y-0.5">
                  <p className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-[var(--color-text-secondary)] font-semibold">PDF</p>
                  <button onClick={() => exportDREtoPDF(dreData, startDate || endDate ? `${startDate || '...'} a ${endDate || '...'}` : null)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface)] rounded-lg transition-colors">
                    <FileText className="h-3.5 w-3.5 text-red-400" /> DRE Simplificado
                  </button>
                  <button onClick={() => exportTruckReportToPDF(stats)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface)] rounded-lg transition-colors">
                    <FileText className="h-3.5 w-3.5 text-red-400" /> Relatorio Caminhoes
                  </button>
                  <button onClick={() => exportDriverReportToPDF(driverStats)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface)] rounded-lg transition-colors">
                    <FileText className="h-3.5 w-3.5 text-red-400" /> Relatorio Motoristas
                  </button>
                  <button onClick={() => exportFuelTableToPDF(filteredData.filteredFuel, trucks)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface)] rounded-lg transition-colors">
                    <FileText className="h-3.5 w-3.5 text-red-400" /> Abastecimentos
                  </button>
                  <button onClick={() => exportMaintenanceTableToPDF(filteredData.filteredMaintenance, trucks)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface)] rounded-lg transition-colors">
                    <FileText className="h-3.5 w-3.5 text-red-400" /> Manutencoes
                  </button>
                  <button onClick={() => exportFullReportToPDF(dreData, stats, driverStats, filteredData.filteredFuel, filteredData.filteredMaintenance, trucks, startDate || endDate ? `${startDate || '...'} a ${endDate || '...'}` : '')} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface)] rounded-lg transition-colors font-medium">
                    <FileText className="h-3.5 w-3.5 text-[#5E6AD2]" /> Relatorio Completo (PDF)
                  </button>
                  <div className="border-t border-[var(--color-border)] my-1" />
                  <p className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-[var(--color-text-secondary)] font-semibold">Excel</p>
                  <button onClick={() => exportFullReportToExcel(dreData, stats, driverStats, filteredData.filteredFuel, filteredData.filteredMaintenance, trucks, startDate || endDate ? `${startDate || '...'} a ${endDate || '...'}` : '')} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface)] rounded-lg transition-colors">
                    <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" /> Relatorio Completo
                  </button>
                  <button onClick={() => exportDREtoExcel(dreData, startDate || endDate ? `${startDate || '...'} a ${endDate || '...'}` : null)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface)] rounded-lg transition-colors">
                    <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" /> DRE Simplificado
                  </button>
                  <button onClick={() => exportTruckReportToExcel(stats)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface)] rounded-lg transition-colors">
                    <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" /> Caminhoes
                  </button>
                  <button onClick={() => exportDriverReportToExcel(driverStats)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface)] rounded-lg transition-colors">
                    <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" /> Motoristas
                  </button>
                  <button onClick={() => exportFuelTableToExcel(filteredData.filteredFuel, trucks)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface)] rounded-lg transition-colors">
                    <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" /> Abastecimentos
                  </button>
                  <button onClick={() => exportMaintenanceTableToExcel(filteredData.filteredMaintenance, trucks)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface)] rounded-lg transition-colors">
                    <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" /> Manutencoes
                  </button>
                </CardContent>
              </Card>
            </div>
          </div>
          <SectionCustomizerButton onClick={() => setShowCustomize(true)} />
        </div>
      </div>

      <SectionCustomizerModal
        isOpen={showCustomize}
        onClose={() => setShowCustomize(false)}
        title="Personalizar Relatórios"
        sections={REPORT_SECTIONS}
        prefs={prefs}
        moveUp={moveUp}
        moveDown={moveDown}
        toggleVisibility={toggleVisibility}
        reset={reset}
      />

      {renderOrderedSections()}
    </div>
  );
}
