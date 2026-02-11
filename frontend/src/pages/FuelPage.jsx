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
import { Fuel, Truck, User, Calendar, DollarSign, Droplet, Edit2, Trash2, Search, Filter } from 'lucide-react';
import { formatNumber, formatCurrency } from '../lib/utils';
import { fuelService } from '../services/fuel';
import { useToast } from '../hooks/useToast';

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

  const filteredFuelRecords = useMemo(() => {
    let filtered = fuelRecords.filter(record => {
      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const truckName = getTruckName(record.caminhao_id).toLowerCase();
      const driverName = getDriverName(record.motorista_id).toLowerCase();
      const posto = (record.posto || '').toLowerCase();

      const matchesSearch = !searchTerm ||
        truckName.includes(searchLower) ||
        driverName.includes(searchLower) ||
        posto.includes(searchLower);

      // Truck filter
      const matchesTruck = !filterTruck || record.caminhao_id === Number(filterTruck);

      // Period filter
      let matchesPeriod = true;
      if (filterPeriod !== 'all') {
        const recordDate = new Date(record.created_at);
        const now = new Date();

        switch (filterPeriod) {
          case 'today':
            matchesPeriod = recordDate.toDateString() === now.toDateString();
            break;
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            matchesPeriod = recordDate >= weekAgo;
            break;
          case 'month':
            matchesPeriod = recordDate.getMonth() === now.getMonth() &&
                          recordDate.getFullYear() === now.getFullYear();
            break;
          case '3months':
            const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
            matchesPeriod = recordDate >= threeMonthsAgo;
            break;
        }
      }

      return matchesSearch && matchesTruck && matchesPeriod;
    });

    // Sort by date (most recent first)
    return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [fuelRecords, searchTerm, filterTruck, filterPeriod]);

  const loadFuelRecords = async () => {
    try {
      setLoading(true);
      const data = await fuelService.getAll();
      setFuelRecords(data);
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

  const getTruckName = (caminhaoId) => {
    const truck = trucks.find(t => t.id === caminhaoId);
    return truck ? `${truck.placa} - ${truck.modelo}` : 'N/A';
  };

  const getDriverName = (motoristaId) => {
    const driver = drivers.find(d => d.id === motoristaId);
    return driver ? driver.nome : 'N/A';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Registrar Abastecimento</CardTitle>
        </CardHeader>
        <CardContent>
          {trucks.length === 0 || drivers.length === 0 ? (
            <EmptyState
              icon={Fuel}
              title="Dados faltando"
              description="Você precisa cadastrar pelo menos um caminhão e um motorista antes de adicionar registros de abastecimento"
            />
          ) : (
            <FuelForm trucks={trucks} drivers={drivers} onSuccess={handleSuccess} />
          )}
        </CardContent>
      </Card>

      <div>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Histórico ({filteredFuelRecords.length} de {fuelRecords.length})
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="mr-2 h-4 w-4" />
            {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          </Button>
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

        {loading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-zinc-500">Carregando...</p>
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
          <div className="space-y-3">
            {filteredFuelRecords.map(fuel => (
              <Card key={fuel.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                          <Fuel className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-zinc-400" />
                            <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                              {getTruckName(fuel.caminhao_id)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-zinc-500">
                            <User className="h-3 w-3" />
                            <span>{getDriverName(fuel.motorista_id)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        <div>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">KM Registro</p>
                          <p className="font-mono font-semibold text-zinc-900 dark:text-zinc-50">
                            {formatNumber(fuel.km_registro, 0)} km
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">Litros</p>
                          <p className="flex items-center gap-1 font-semibold text-zinc-900 dark:text-zinc-50">
                            <Droplet className="h-3 w-3 text-blue-500" />
                            {formatNumber(fuel.litros)} L
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">Valor Total</p>
                          <p className="flex items-center gap-1 font-semibold text-zinc-900 dark:text-zinc-50">
                            <DollarSign className="h-3 w-3 text-green-500" />
                            {formatCurrency(fuel.valor_total)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">Data</p>
                          <p className="flex items-center gap-1 text-sm text-zinc-900 dark:text-zinc-50">
                            <Calendar className="h-3 w-3" />
                            {formatDate(fuel.created_at)}
                          </p>
                        </div>
                      </div>

                      {fuel.posto && (
                        <div>
                          <Badge variant="outline">Posto: {fuel.posto}</Badge>
                        </div>
                      )}
                    </div>

                    <div className="ml-4 flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingFuel(fuel)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setDeletingFuel(fuel)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

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
