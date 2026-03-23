import { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { FuelForm } from '../components/forms/FuelForm';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Fuel, Truck, User, Calendar, DollarSign, Droplet, Edit2, Trash2, Search, Filter, TrendingUp, TrendingDown, Plus } from 'lucide-react';
import { formatNumber, formatCurrency, formatDate } from '../lib/utils';
import { fuelService } from '../services/fuel';
import { useToast } from '../hooks/useToast';

function PricePerLiter({ valorTotal, litros }) {
  if (!valorTotal || !litros || litros === 0) return null;
  const pricePerLiter = Number(valorTotal) / Number(litros);
  return (
    <div>
      <p className="text-xs text-[var(--color-text-secondary)]">R$/Litro</p>
      <p className="flex items-center gap-1 font-semibold text-[var(--color-accent)] tabular-nums">
        R$ {pricePerLiter.toFixed(3)}
      </p>
    </div>
  );
}

function FuelSummaryCards({ records }) {
  const summary = useMemo(() => {
    if (!records.length) return null;

    const totalLiters = records.reduce((s, r) => s + (Number(r.litros) || 0), 0);
    const totalCost = records.reduce((s, r) => s + (Number(r.valor_total) || 0), 0);
    const avgPricePerLiter = totalLiters > 0 ? totalCost / totalLiters : 0;

    const prices = records
      .filter(r => r.litros > 0 && r.valor_total > 0)
      .map(r => Number(r.valor_total) / Number(r.litros));

    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;

    return { totalLiters, totalCost, avgPricePerLiter, maxPrice, minPrice, count: records.length };
  }, [records]);

  if (!summary) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-6">
      <Card className="!rounded-xl">
        <CardContent className="p-4 !pt-4">
          <p className="text-xs text-[var(--color-text-secondary)] mb-1">Total Litros</p>
          <p className="text-lg font-bold text-[var(--color-text)] tabular-nums">{formatNumber(summary.totalLiters)} L</p>
        </CardContent>
      </Card>
      <Card className="!rounded-xl">
        <CardContent className="p-4 !pt-4">
          <p className="text-xs text-[var(--color-text-secondary)] mb-1">Total Gasto</p>
          <p className="text-lg font-bold text-[var(--color-text)] tabular-nums">{formatCurrency(summary.totalCost)}</p>
        </CardContent>
      </Card>
      <Card className="!rounded-xl">
        <CardContent className="p-4 !pt-4">
          <p className="text-xs text-[var(--color-text-secondary)] mb-1">Média R$/L</p>
          <p className="text-lg font-bold text-[var(--color-accent)] tabular-nums">R$ {summary.avgPricePerLiter.toFixed(3)}</p>
        </CardContent>
      </Card>
      <Card className="!rounded-xl">
        <CardContent className="p-4 !pt-4">
          <p className="text-xs text-[var(--color-text-secondary)] mb-1">Faixa R$/L</p>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-0.5 text-sm font-semibold text-emerald-500">
              <TrendingDown className="h-3 w-3" />
              {summary.minPrice.toFixed(2)}
            </span>
            <span className="text-[var(--color-text-secondary)]">-</span>
            <span className="flex items-center gap-0.5 text-sm font-semibold text-red-400">
              <TrendingUp className="h-3 w-3" />
              {summary.maxPrice.toFixed(2)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function EditFuelModal({ fuel, trucks, drivers, isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();
  const [formData, setFormData] = useState({
    caminhao_id: fuel.caminhao_id || '',
    motorista_id: fuel.motorista_id || '',
    km_registro: fuel.km_registro || '',
    litros: fuel.litros || '',
    valor_total: fuel.valor_total || '',
    posto: fuel.posto || ''
  });

  const pricePerLiter = formData.litros && formData.valor_total
    ? (Number(formData.valor_total) / Number(formData.litros)).toFixed(3)
    : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        caminhao_id: Number(formData.caminhao_id),
        motorista_id: Number(formData.motorista_id),
        km_registro: Number(formData.km_registro),
        litros: Number(formData.litros),
        valor_total: Number(formData.valor_total),
        posto: formData.posto || undefined
      };

      await fuelService.update(fuel.id, data);
      success('Sucesso!', 'Abastecimento atualizado com sucesso');
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Failed to update fuel record:', err);
      error('Erro', err.message || 'Falha ao atualizar abastecimento');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Abastecimento">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Select
            name="caminhao_id"
            label="Caminhão"
            value={formData.caminhao_id}
            onChange={handleChange}
            required
          >
            <option value="">Selecione um caminhão</option>
            {trucks.map(truck => (
              <option key={truck.id} value={truck.id}>
                {truck.placa} - {truck.modelo}
              </option>
            ))}
          </Select>

          <Select
            name="motorista_id"
            label="Motorista"
            value={formData.motorista_id}
            onChange={handleChange}
            required
          >
            <option value="">Selecione um motorista</option>
            {drivers.map(driver => (
              <option key={driver.id} value={driver.id}>
                {driver.nome}
              </option>
            ))}
          </Select>

          <Input
            name="km_registro"
            label="Quilometragem (km)"
            type="number"
            placeholder="50000"
            value={formData.km_registro}
            onChange={handleChange}
            required
          />

          <Input
            name="litros"
            label="Litros"
            type="number"
            step="0.01"
            placeholder="200"
            value={formData.litros}
            onChange={handleChange}
            required
          />

          <Input
            name="valor_total"
            label="Valor Total (R$)"
            type="number"
            step="0.01"
            placeholder="1200.00"
            value={formData.valor_total}
            onChange={handleChange}
            required
          />

          <Input
            name="posto"
            label="Posto"
            placeholder="Shell"
            value={formData.posto}
            onChange={handleChange}
          />
        </div>

        {pricePerLiter && (
          <div className="rounded-xl bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 px-4 py-3">
            <p className="text-xs text-[var(--color-text-secondary)]">Preço por litro calculado</p>
            <p className="text-lg font-bold text-[var(--color-accent)] tabular-nums">R$ {pricePerLiter}</p>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            className="flex-1"
          >
            Salvar Alterações
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function FuelPage({ trucks, drivers, onRefetch }) {
  const { success, error } = useToast();
  const [fuelRecords, setFuelRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingFuel, setEditingFuel] = useState(null);
  const [deletingFuel, setDeletingFuel] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTruck, setFilterTruck] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const getTruckName = (caminhaoId) => {
    const truck = trucks.find(t => t.id === caminhaoId);
    return truck ? `${truck.placa} - ${truck.modelo}` : 'N/A';
  };

  const getDriverName = (motoristaId) => {
    const driver = drivers.find(d => d.id === motoristaId);
    return driver ? driver.nome : 'N/A';
  };

  const filteredFuelRecords = useMemo(() => {
    let filtered = fuelRecords.filter(record => {
      const searchLower = searchTerm.toLowerCase();
      const truckName = getTruckName(record.caminhao_id).toLowerCase();
      const driverName = getDriverName(record.motorista_id).toLowerCase();
      const posto = (record.posto || '').toLowerCase();

      const matchesSearch = !searchTerm ||
        truckName.includes(searchLower) ||
        driverName.includes(searchLower) ||
        posto.includes(searchLower);

      const matchesTruck = !filterTruck || record.caminhao_id === Number(filterTruck);

      let matchesPeriod = true;
      if (filterPeriod !== 'all') {
        const recordDate = new Date(record.created_at);
        const now = new Date();

        switch (filterPeriod) {
          case 'today':
            matchesPeriod = recordDate.toDateString() === now.toDateString();
            break;
          case 'week': {
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            matchesPeriod = recordDate >= weekAgo;
            break;
          }
          case 'month':
            matchesPeriod = recordDate.getMonth() === now.getMonth() &&
                          recordDate.getFullYear() === now.getFullYear();
            break;
          case '3months': {
            const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
            matchesPeriod = recordDate >= threeMonthsAgo;
            break;
          }
        }
      }

      return matchesSearch && matchesTruck && matchesPeriod;
    });

    return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [fuelRecords, searchTerm, filterTruck, filterPeriod]);

  const loadFuelRecords = async () => {
    try {
      setLoading(true);
      const response = await fuelService.getAll();
      setFuelRecords(response.data || response || []);
    } catch (err) {
      console.error('Failed to load fuel records:', err);
      error('Erro', 'Falha ao carregar registros de abastecimento');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFuelRecords();
  }, []);

  const handleSuccess = () => {
    loadFuelRecords();
    onRefetch?.();
    setShowCreateForm(false);
  };

  const handleDelete = async () => {
    if (!deletingFuel) return;

    setDeleteLoading(true);
    try {
      await fuelService.delete(deletingFuel.id);
      success('Sucesso!', 'Abastecimento excluído com sucesso');
      handleSuccess();
      setDeletingFuel(null);
    } catch (err) {
      console.error('Failed to delete fuel record:', err);
      error('Erro', err.message || 'Falha ao excluir abastecimento');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-[var(--color-text)]">
            Abastecimentos ({filteredFuelRecords.length} de {fuelRecords.length})
          </h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="mr-2 h-4 w-4" />
              {showFilters ? 'Ocultar Filtros' : 'Filtros'}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowCreateForm(true)}
              disabled={trucks.length === 0 || drivers.length === 0}
            >
              <Plus className="mr-2 h-4 w-4" />
              Registrar Abastecimento
            </Button>
          </div>
        </div>

        {showFilters && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Input
                  icon={Search}
                  placeholder="Buscar por caminhão, motorista ou posto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Select
                  label="Filtrar por Caminhão"
                  value={filterTruck}
                  onChange={(e) => setFilterTruck(e.target.value)}
                >
                  <option value="">Todos os caminhões</option>
                  {trucks.map(truck => (
                    <option key={truck.id} value={truck.id}>
                      {truck.placa} - {truck.modelo}
                    </option>
                  ))}
                </Select>
                <Select
                  label="Período"
                  value={filterPeriod}
                  onChange={(e) => setFilterPeriod(e.target.value)}
                >
                  <option value="all">Todos os períodos</option>
                  <option value="today">Hoje</option>
                  <option value="week">Última semana</option>
                  <option value="month">Este mês</option>
                  <option value="3months">Últimos 3 meses</option>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Cards */}
        <FuelSummaryCards records={filteredFuelRecords} />

        {loading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-[var(--color-text-secondary)]">Carregando...</p>
            </CardContent>
          </Card>
        ) : fuelRecords.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <EmptyState
                icon={Fuel}
                title="Nenhum abastecimento registrado"
                description="Os registros de abastecimento aparecerão aqui"
              />
            </CardContent>
          </Card>
        ) : filteredFuelRecords.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <EmptyState
                icon={Search}
                title="Nenhum resultado encontrado"
                description="Tente ajustar os filtros de busca"
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredFuelRecords.map(fuel => {
              const pricePerL = fuel.litros > 0 ? Number(fuel.valor_total) / Number(fuel.litros) : 0;
              return (
                <Card key={fuel.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent)]/10">
                            <Fuel className="h-5 w-5 text-[var(--color-accent)]" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-[var(--color-text)]">
                              {getTruckName(fuel.caminhao_id)}
                            </p>
                            <p className="flex items-center gap-1 text-sm text-[var(--color-text-secondary)]">
                              <User className="h-3 w-3" />
                              {getDriverName(fuel.motorista_id)}
                            </p>
                          </div>
                        </div>
                        <div className="flex shrink-0 gap-1">
                          <Button variant="outline" size="sm" onClick={() => setEditingFuel(fuel)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="danger" size="sm" onClick={() => setDeletingFuel(fuel)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Details grid */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-lg bg-[var(--color-surface)] p-2 text-center">
                          <p className="text-[10px] text-[var(--color-text-secondary)]">Litros</p>
                          <p className="text-sm font-semibold text-[var(--color-text)] tabular-nums">{formatNumber(fuel.litros)} L</p>
                        </div>
                        <div className="rounded-lg bg-[var(--color-surface)] p-2 text-center">
                          <p className="text-[10px] text-[var(--color-text-secondary)]">Valor</p>
                          <p className="text-sm font-semibold text-[var(--color-text)] tabular-nums">{formatCurrency(fuel.valor_total)}</p>
                        </div>
                        <div className="rounded-lg bg-[var(--color-surface)] p-2 text-center">
                          <p className="text-[10px] text-[var(--color-text-secondary)]">R$/Litro</p>
                          <p className="text-sm font-semibold text-[var(--color-accent)] tabular-nums">R$ {pricePerL.toFixed(3)}</p>
                        </div>
                        <div className="rounded-lg bg-[var(--color-surface)] p-2 text-center">
                          <p className="text-[10px] text-[var(--color-text-secondary)]">KM</p>
                          <p className="text-sm font-semibold text-[var(--color-text)] tabular-nums">{formatNumber(fuel.km_registro, 0)}</p>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(fuel.created_at)}
                        </span>
                        {fuel.posto && <Badge variant="outline">{fuel.posto}</Badge>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Registrar Abastecimento */}
      <Modal isOpen={showCreateForm} onClose={() => setShowCreateForm(false)} title="Registrar Abastecimento">
        <FuelForm trucks={trucks} drivers={drivers} onSuccess={handleSuccess} />
      </Modal>

      {editingFuel && (
        <EditFuelModal
          fuel={editingFuel}
          trucks={trucks}
          drivers={drivers}
          isOpen={!!editingFuel}
          onClose={() => setEditingFuel(null)}
          onSuccess={handleSuccess}
        />
      )}

      <ConfirmDialog
        isOpen={!!deletingFuel}
        onClose={() => setDeletingFuel(null)}
        onConfirm={handleDelete}
        title="Excluir Abastecimento"
        description="Tem certeza que deseja excluir este registro de abastecimento? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        isLoading={deleteLoading}
      />
    </div>
  );
}
