import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { EmptyState } from '../components/ui/EmptyState';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { fuelService } from '../services/fuel';
import { formatCurrency, formatNumber, formatDate } from '../lib/utils';
import {
  Route, Fuel, Truck, MapPin, ArrowRight, Calendar, Package,
  DollarSign, CheckCircle, Clock, TrendingUp, Gauge, Droplets
} from 'lucide-react';

export function DriverDashboardPage({ trucks, drivers, trips, fuelRecords, onRefetch }) {
  const { user } = useAuth();
  const { addToast } = useToast();

  // Find this driver's linked motorista record
  const myDriver = drivers.find(d => d.id === user?.motorista_id);
  const myName = myDriver?.nome || user?.nome || 'Motorista';

  // Filter data for this driver
  const myTrips = useMemo(() =>
    (trips || []).filter(t => t.motorista_id === user?.motorista_id).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
    [trips, user?.motorista_id]
  );

  const myFuel = useMemo(() =>
    (fuelRecords || []).filter(r => r.motorista_id === user?.motorista_id).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
    [fuelRecords, user?.motorista_id]
  );

  const activeTrips = myTrips.filter(t => t.status === 'cadastrada');
  const completedTrips = myTrips.filter(t => t.status === 'finalizada');

  // Stats
  const totalLitros = myFuel.reduce((s, r) => s + (Number(r.litros) || 0), 0);
  const totalGasto = myFuel.reduce((s, r) => s + (Number(r.valor_total) || 0), 0);
  const totalFrete = completedTrips.reduce((s, t) => s + (Number(t.valor_total_frete) || 0), 0);
  const totalCustos = completedTrips.reduce((s, t) => s + (Number(t.custo_combustivel) || 0) + (Number(t.custo_pedagio) || 0) + (Number(t.custo_manutencao) || 0) + (Number(t.custo_outros) || 0), 0);
  const lucroTotal = totalFrete - totalCustos;
  const totalKmViagens = myTrips.reduce((s, t) => s + (Number(t.distancia_km) || 0), 0);
  const kmPerLiter = totalLitros > 0 ? totalKmViagens / totalLitros : 0;

  // Driver ranking
  const driverRanking = useMemo(() => {
    const rankings = drivers.map(d => {
      const dTrips = trips.filter(t => t.motorista_id === d.id && t.status === 'finalizada');
      const revenue = dTrips.reduce((s, t) => s + (Number(t.valor_total_frete) || 0), 0);
      const costs = dTrips.reduce((s, t) => s + (Number(t.custo_combustivel) || 0) + (Number(t.custo_pedagio) || 0) + (Number(t.custo_manutencao) || 0) + (Number(t.custo_outros) || 0), 0);
      return { id: d.id, nome: d.nome, trips: dTrips.length, revenue, profit: revenue - costs };
    }).filter(d => d.trips > 0).sort((a, b) => b.profit - a.profit);
    const myPos = rankings.findIndex(r => r.id === user?.motorista_id);
    return { position: myPos + 1, total: rankings.length, rankings };
  }, [drivers, trips, user?.motorista_id]);

  // Quick fuel form
  const [showFuelForm, setShowFuelForm] = useState(false);
  const [fuelForm, setFuelForm] = useState({ caminhao_id: '', litros: '', valor_total: '', km_registro: '', posto: '' });
  const [savingFuel, setSavingFuel] = useState(false);

  const handleFuelSubmit = async (e) => {
    e.preventDefault();
    if (!fuelForm.caminhao_id || !fuelForm.litros || !fuelForm.valor_total || !fuelForm.km_registro) {
      addToast('Preencha todos os campos obrigatórios', 'error');
      return;
    }
    setSavingFuel(true);
    try {
      await fuelService.create({
        caminhao_id: Number(fuelForm.caminhao_id),
        motorista_id: user?.motorista_id,
        litros: Number(fuelForm.litros),
        valor_total: Number(fuelForm.valor_total),
        km_registro: Number(fuelForm.km_registro),
        posto: fuelForm.posto || null,
      });
      addToast('Abastecimento registrado!', 'success');
      setFuelForm({ caminhao_id: '', litros: '', valor_total: '', km_registro: '', posto: '' });
      setShowFuelForm(false);
      onRefetch?.();
    } catch (err) {
      addToast(err.message || 'Erro ao registrar', 'error');
    } finally {
      setSavingFuel(false);
    }
  };

  const precoLitro = Number(fuelForm.valor_total) && Number(fuelForm.litros)
    ? (Number(fuelForm.valor_total) / Number(fuelForm.litros)).toFixed(3)
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-[var(--color-text)]">
          Olá, {myName.split(' ')[0]}!
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Aqui estão suas viagens e abastecimentos
        </p>
      </div>

      {/* Stats Cards - Row 1 */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Route className="mx-auto h-5 w-5 text-blue-400 mb-1" />
            <p className="text-2xl font-bold text-[var(--color-text)]">{activeTrips.length}</p>
            <p className="text-xs text-[var(--color-text-secondary)]">Viagens Ativas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="mx-auto h-5 w-5 text-emerald-400 mb-1" />
            <p className="text-2xl font-bold text-[var(--color-text)]">{completedTrips.length}</p>
            <p className="text-xs text-[var(--color-text-secondary)]">Finalizadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Gauge className="mx-auto h-5 w-5 text-amber-400 mb-1" />
            <p className="text-2xl font-bold text-[var(--color-text)]">{formatNumber(kmPerLiter, 1)}</p>
            <p className="text-xs text-[var(--color-text-secondary)]">km/litro</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <MapPin className="mx-auto h-5 w-5 text-purple-400 mb-1" />
            <p className="text-2xl font-bold text-[var(--color-text)]">{formatNumber(totalKmViagens, 0)}</p>
            <p className="text-xs text-[var(--color-text-secondary)]">km Rodados</p>
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards - Row 2 */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign className="mx-auto h-5 w-5 text-emerald-400 mb-1" />
            <p className="text-2xl font-bold text-[var(--color-text)]">{formatCurrency(totalFrete)}</p>
            <p className="text-xs text-[var(--color-text-secondary)]">Frete Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Droplets className="mx-auto h-5 w-5 text-blue-400 mb-1" />
            <p className="text-2xl font-bold text-[var(--color-text)]">{formatCurrency(totalGasto)}</p>
            <p className="text-xs text-[var(--color-text-secondary)]">Gasto Combustível</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className={`mx-auto h-5 w-5 mb-1 ${lucroTotal >= 0 ? 'text-emerald-400' : 'text-red-400'}`} />
            <p className={`text-2xl font-bold ${lucroTotal >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{formatCurrency(lucroTotal)}</p>
            <p className="text-xs text-[var(--color-text-secondary)]">Lucro Líquido</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Fuel className="mx-auto h-5 w-5 text-amber-400 mb-1" />
            <p className="text-2xl font-bold text-[var(--color-text)]">{formatNumber(totalLitros, 0)}L</p>
            <p className="text-xs text-[var(--color-text-secondary)]">Total Litros</p>
          </CardContent>
        </Card>
      </div>

      {/* Ranking */}
      {driverRanking.total > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-5 w-5 text-amber-400" />
              Ranking de Motoristas
            </CardTitle>
            <CardDescription>Por lucro líquido (frete - custos)</CardDescription>
          </CardHeader>
          <CardContent>
            {driverRanking.position > 0 && (
              <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <p className="text-sm text-[var(--color-text-secondary)]">Sua posição</p>
                <p className="text-2xl font-bold text-amber-400">
                  {driverRanking.position}º <span className="text-sm font-normal text-[var(--color-text-secondary)]">de {driverRanking.total} motoristas</span>
                </p>
              </div>
            )}
            <div className="space-y-2">
              {driverRanking.rankings.slice(0, 5).map((r, i) => (
                <div key={r.id} className={`flex items-center justify-between p-2 rounded-lg ${r.id === user?.motorista_id ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-[var(--color-bg-elevated)]'}`}>
                  <div className="flex items-center gap-3">
                    <span className={`text-lg font-bold w-6 text-center ${i === 0 ? 'text-amber-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-orange-400' : 'text-[var(--color-text-secondary)]'}`}>
                      {i + 1}º
                    </span>
                    <div>
                      <p className="text-sm font-medium text-[var(--color-text)]">{r.nome?.split(' ')[0]}</p>
                      <p className="text-xs text-[var(--color-text-secondary)]">{r.trips} viagens</p>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold ${r.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatCurrency(r.profit)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Fuel Button */}
      <Button variant="primary" className="w-full sm:w-auto" onClick={() => setShowFuelForm(!showFuelForm)}>
        <Fuel className="mr-2 h-4 w-4" />
        {showFuelForm ? 'Cancelar' : 'Registrar Abastecimento'}
      </Button>

      {/* Quick Fuel Form */}
      {showFuelForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Droplets className="h-5 w-5 text-blue-400" />
              Novo Abastecimento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFuelSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Select label="Caminhão *" value={fuelForm.caminhao_id} onChange={(e) => setFuelForm(p => ({ ...p, caminhao_id: e.target.value }))} required>
                  <option value="">Selecione</option>
                  {trucks.map(t => <option key={t.id} value={t.id}>{t.placa} - {t.modelo}</option>)}
                </Select>
                <Input label="KM atual *" type="number" placeholder="Ex: 150000" value={fuelForm.km_registro} onChange={(e) => setFuelForm(p => ({ ...p, km_registro: e.target.value }))} required />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Input label="Litros *" type="number" step="0.01" placeholder="Ex: 200" value={fuelForm.litros} onChange={(e) => setFuelForm(p => ({ ...p, litros: e.target.value }))} required />
                <Input label="Valor Total (R$) *" type="number" step="0.01" placeholder="Ex: 1200.00" value={fuelForm.valor_total} onChange={(e) => setFuelForm(p => ({ ...p, valor_total: e.target.value }))} required />
                <Input label="Posto (opcional)" placeholder="Nome do posto" value={fuelForm.posto} onChange={(e) => setFuelForm(p => ({ ...p, posto: e.target.value }))} />
              </div>
              {precoLitro && (
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Preço por litro: <span className="font-semibold text-[var(--color-text)]">R$ {precoLitro}</span>
                </p>
              )}
              <Button type="submit" variant="primary" disabled={savingFuel} className="w-full">
                {savingFuel ? 'Registrando...' : 'Registrar Abastecimento'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Active Trips */}
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-text)] mb-3">
          <Clock className="inline mr-2 h-5 w-5 text-amber-400" />
          Viagens Ativas ({activeTrips.length})
        </h2>
        {activeTrips.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <EmptyState icon={Route} title="Nenhuma viagem ativa" description="Suas viagens atribuídas aparecerão aqui" />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {activeTrips.map(trip => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        )}
      </div>

      {/* Recent Completed */}
      {completedTrips.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text)] mb-3">
            <CheckCircle className="inline mr-2 h-5 w-5 text-emerald-400" />
            Últimas Finalizadas
          </h2>
          <div className="space-y-3">
            {completedTrips.slice(0, 5).map(trip => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        </div>
      )}

      {/* Recent Fuel */}
      {myFuel.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text)] mb-3">
            <Fuel className="inline mr-2 h-5 w-5 text-blue-400" />
            Últimos Abastecimentos
          </h2>
          <div className="space-y-2">
            {myFuel.slice(0, 5).map(record => (
              <Card key={record.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text)]">
                      {formatNumber(record.litros, 1)}L — {formatCurrency(Number(record.valor_total))}
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      {record.posto || 'Posto'} • {formatDate(record.created_at)} • {formatNumber(record.km_registro, 0)} km
                    </p>
                  </div>
                  <Badge variant="default">
                    R$ {(Number(record.valor_total) / Number(record.litros)).toFixed(2)}/L
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TripCard({ trip }) {
  const isActive = trip.status === 'cadastrada';
  const custoTotal = (Number(trip.custo_combustivel) || 0) + (Number(trip.custo_pedagio) || 0) +
    (Number(trip.custo_manutencao) || 0) + (Number(trip.custo_outros) || 0);

  return (
    <Card className={isActive ? 'border-amber-500/30' : ''}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={isActive ? 'warning' : 'success'}>
                {isActive ? 'Ativa' : 'Finalizada'}
              </Badge>
              <span className="text-xs text-[var(--color-text-secondary)]">
                <Calendar className="mr-1 inline h-3 w-3" />
                {formatDate(trip.data_viagem || trip.created_at)}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-amber-500 shrink-0" />
              <span className="font-medium truncate">{trip.fornecedores?.nome}</span>
              <ArrowRight className="h-4 w-4 text-[var(--color-text-secondary)] shrink-0" />
              <MapPin className="h-4 w-4 text-blue-500 shrink-0" />
              <span className="font-medium truncate">{trip.clientes?.nome}</span>
            </div>

            <div className="mt-2 flex flex-wrap gap-3 text-xs text-[var(--color-text-secondary)]">
              <span><Truck className="inline h-3 w-3 mr-1" />{trip.caminhoes?.placa}</span>
              <span><Package className="inline h-3 w-3 mr-1" />{trip.produto} — {trip.quantidade_sacas} sacas</span>
              <span className="text-emerald-400 font-medium">
                <DollarSign className="inline h-3 w-3 mr-0.5" />
                Frete: {formatCurrency(Number(trip.valor_total_frete))}
              </span>
            </div>

            {trip.status === 'finalizada' && custoTotal > 0 && (
              <div className="mt-1.5 text-xs">
                <span className="text-red-400">Custos: {formatCurrency(custoTotal)}</span>
                {' • '}
                <span className={Number(trip.valor_total_frete) - custoTotal >= 0 ? 'text-emerald-400 font-medium' : 'text-red-400 font-medium'}>
                  Lucro: {formatCurrency(Number(trip.valor_total_frete) - custoTotal)}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
