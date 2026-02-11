import { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { MaintenanceForm } from '../components/forms/MaintenanceForm';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Wrench, Truck, Calendar, DollarSign, Edit2, Trash2, Search, Filter } from 'lucide-react';
import { formatNumber, formatCurrency } from '../lib/utils';
import { maintenanceService } from '../services/maintenance';
import { useToast } from '../hooks/useToast';

const MAINTENANCE_TYPES = [
  'Preventiva',
  'Corretiva',
  'Pneus',
  'Motor',
  'Freios',
  'Suspensão',
  'Elétrica',
  'Outros'
];

const TYPE_COLORS = {
  Preventiva: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
  Corretiva: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
  Pneus: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
  Motor: 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
  Freios: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
  Suspensão: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
  Elétrica: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-400',
  Outros: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
};

function EditMaintenanceModal({ maintenance, trucks, isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();
  const [formData, setFormData] = useState({
    caminhao_id: maintenance.caminhao_id || '',
    descricao: maintenance.descricao || '',
    tipo_manutencao: maintenance.tipo_manutencao || 'Preventiva',
    valor_total: maintenance.valor_total || '',
    km_manutencao: maintenance.km_manutencao || '',
    data_manutencao: maintenance.data_manutencao ? maintenance.data_manutencao.split('T')[0] : ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        caminhao_id: Number(formData.caminhao_id),
        descricao: formData.descricao,
        tipo_manutencao: formData.tipo_manutencao,
        valor_total: Number(formData.valor_total),
        km_manutencao: Number(formData.km_manutencao),
        data_manutencao: formData.data_manutencao
      };

      await maintenanceService.update(maintenance.id, data);
      success('Sucesso!', 'Manutenção atualizada com sucesso');
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Failed to update maintenance record:', err);
      error('Erro', err.message || 'Falha ao atualizar manutenção');
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
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Manutenção">
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
            name="tipo_manutencao"
            label="Tipo de Manutenção"
            value={formData.tipo_manutencao}
            onChange={handleChange}
            required
          >
            {MAINTENANCE_TYPES.map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>

          <Input
            name="descricao"
            label="Descrição"
            placeholder="O que foi feito?"
            value={formData.descricao}
            onChange={handleChange}
            required
            className="md:col-span-2"
          />

          <Input
            name="valor_total"
            label="Valor Total (R$)"
            type="number"
            step="0.01"
            placeholder="500.00"
            value={formData.valor_total}
            onChange={handleChange}
            required
          />

          <Input
            name="km_manutencao"
            label="Quilometragem (km)"
            type="number"
            placeholder="50000"
            value={formData.km_manutencao}
            onChange={handleChange}
            required
          />

          <Input
            name="data_manutencao"
            label="Data"
            type="date"
            value={formData.data_manutencao}
            onChange={handleChange}
            required
            className="md:col-span-2"
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
            variant="danger"
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

export function MaintenancePage({ trucks, onRefetch }) {
  const { success, error } = useToast();
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingMaintenance, setEditingMaintenance] = useState(null);
  const [deletingMaintenance, setDeletingMaintenance] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTruck, setFilterTruck] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredMaintenanceRecords = useMemo(() => {
    let filtered = maintenanceRecords.filter(record => {
      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const truckName = getTruckName(record.caminhao_id).toLowerCase();
      const description = (record.descricao || '').toLowerCase();

      const matchesSearch = !searchTerm ||
        truckName.includes(searchLower) ||
        description.includes(searchLower);

      // Truck filter
      const matchesTruck = !filterTruck || record.caminhao_id === Number(filterTruck);

      // Type filter
      const matchesType = !filterType || record.tipo_manutencao === filterType;

      // Period filter
      let matchesPeriod = true;
      if (filterPeriod !== 'all') {
        const recordDate = new Date(record.data_manutencao || record.created_at);
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

      return matchesSearch && matchesTruck && matchesType && matchesPeriod;
    });

    // Sort by date (most recent first)
    return filtered.sort((a, b) =>
      new Date(b.data_manutencao || b.created_at) - new Date(a.data_manutencao || a.created_at)
    );
  }, [maintenanceRecords, searchTerm, filterTruck, filterType, filterPeriod]);

  const loadMaintenanceRecords = async () => {
    try {
      setLoading(true);
      const data = await maintenanceService.getAll();
      setMaintenanceRecords(data);
    } catch (err) {
      console.error('Failed to load maintenance records:', err);
      error('Erro', 'Falha ao carregar registros de manutenção');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMaintenanceRecords();
  }, []);

  const handleSuccess = () => {
    loadMaintenanceRecords();
    onRefetch?.();
  };

  const handleDelete = async () => {
    if (!deletingMaintenance) return;

    setDeleteLoading(true);
    try {
      await maintenanceService.delete(deletingMaintenance.id);
      success('Sucesso!', 'Manutenção excluída com sucesso');
      handleSuccess();
      setDeletingMaintenance(null);
    } catch (err) {
      console.error('Failed to delete maintenance record:', err);
      error('Erro', err.message || 'Falha ao excluir manutenção');
    } finally {
      setDeleteLoading(false);
    }
  };

  const getTruckName = (caminhaoId) => {
    const truck = trucks.find(t => t.id === caminhaoId);
    return truck ? `${truck.placa} - ${truck.modelo}` : 'N/A';
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
          <CardTitle>Registrar Manutenção</CardTitle>
        </CardHeader>
        <CardContent>
          {trucks.length === 0 ? (
            <EmptyState
              icon={Wrench}
              title="Nenhum caminhão disponível"
              description="Cadastre pelo menos um caminhão antes de adicionar registros de manutenção"
            />
          ) : (
            <MaintenanceForm trucks={trucks} onSuccess={handleSuccess} />
          )}
        </CardContent>
      </Card>

      <div>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Histórico ({filteredMaintenanceRecords.length} de {maintenanceRecords.length})
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
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <Input
                  icon={Search}
                  placeholder="Buscar por caminhão ou descrição..."
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
                  label="Tipo de Manutenção"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="">Todos os tipos</option>
                  {MAINTENANCE_TYPES.map(type => (
                    <option key={type} value={type}>
                      {type}
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
        ) : maintenanceRecords.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <EmptyState
                icon={Wrench}
                title="Nenhuma manutenção registrada"
                description="Os registros de manutenção aparecerão aqui"
              />
            </CardContent>
          </Card>
        ) : filteredMaintenanceRecords.length === 0 ? (
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
            {filteredMaintenanceRecords.map(maintenance => (
              <Card key={maintenance.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
                          <Wrench className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-zinc-400" />
                            <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                              {getTruckName(maintenance.caminhao_id)}
                            </span>
                          </div>
                          <div className="mt-1">
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_COLORS[maintenance.tipo_manutencao] || TYPE_COLORS.Outros}`}>
                              {maintenance.tipo_manutencao}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
                        <p className="text-sm text-zinc-700 dark:text-zinc-300">
                          {maintenance.descricao}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                        <div>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">KM Manutenção</p>
                          <p className="font-mono font-semibold text-zinc-900 dark:text-zinc-50">
                            {formatNumber(maintenance.km_manutencao, 0)} km
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">Valor Total</p>
                          <p className="flex items-center gap-1 font-semibold text-zinc-900 dark:text-zinc-50">
                            <DollarSign className="h-3 w-3 text-green-500" />
                            {formatCurrency(maintenance.valor_total)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">Data</p>
                          <p className="flex items-center gap-1 text-sm text-zinc-900 dark:text-zinc-50">
                            <Calendar className="h-3 w-3" />
                            {formatDate(maintenance.data_manutencao)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="ml-4 flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingMaintenance(maintenance)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setDeletingMaintenance(maintenance)}
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

      {editingMaintenance && (
        <EditMaintenanceModal
          maintenance={editingMaintenance}
          trucks={trucks}
          isOpen={!!editingMaintenance}
          onClose={() => setEditingMaintenance(null)}
          onSuccess={handleSuccess}
        />
      )}

      <ConfirmDialog
        isOpen={!!deletingMaintenance}
        onClose={() => setDeletingMaintenance(null)}
        onConfirm={handleDelete}
        title="Excluir Manutenção"
        description="Tem certeza que deseja excluir este registro de manutenção? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        isLoading={deleteLoading}
      />
    </div>
  );
}
