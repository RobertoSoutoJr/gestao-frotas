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
import { Wrench, Truck, Calendar, DollarSign, Edit2, Trash2, Search, Filter, Plus } from 'lucide-react';
import { formatNumber, formatCurrency, formatDate } from '../lib/utils';
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
  Preventiva: 'bg-emerald-500/15 text-emerald-400',
  Corretiva:  'bg-red-500/15 text-red-400',
  Pneus:      'bg-blue-500/15 text-blue-400',
  Motor:      'bg-amber-500/15 text-amber-400',
  Freios:     'bg-yellow-500/15 text-yellow-400',
  Suspensão:  'bg-purple-500/15 text-purple-400',
  Elétrica:   'bg-cyan-500/15 text-cyan-400',
  Outros:     'bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)]'
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
  const [showCreateForm, setShowCreateForm] = useState(false);

  const getTruckName = (caminhaoId) => {
    const truck = trucks.find(t => t.id === caminhaoId);
    return truck ? `${truck.placa} - ${truck.modelo}` : 'N/A';
  };

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
      const response = await maintenanceService.getAll();
      setMaintenanceRecords(response.data || response || []);
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
    setShowCreateForm(false);
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

  return (
    <div className="space-y-8">
      <div>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-[var(--color-text)]">
            Manutenções ({filteredMaintenanceRecords.length} de {maintenanceRecords.length})
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
              disabled={trucks.length === 0}
            >
              <Plus className="mr-2 h-4 w-4" />
              Registrar Manutenção
            </Button>
          </div>
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
              <p className="text-[var(--color-text-secondary)]">Carregando...</p>
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
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)]">
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Caminhão</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Tipo</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)] hidden sm:table-cell">Descrição</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)] hidden md:table-cell">Data</th>
                    <th className="px-4 py-3 text-right font-medium text-[var(--color-text-secondary)]">Valor</th>
                    <th className="px-4 py-3 text-right font-medium text-[var(--color-text-secondary)] hidden lg:table-cell">KM</th>
                    <th className="px-4 py-3 text-right font-medium text-[var(--color-text-secondary)]">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMaintenanceRecords.map(maintenance => (
                    <tr key={maintenance.id} className="border-b border-[var(--color-border)]/50 hover:bg-[var(--color-surface)] transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-[var(--color-text)]">{getTruckName(maintenance.caminhao_id).split(' - ')[0]}</p>
                        <p className="text-xs text-[var(--color-text-secondary)] sm:hidden line-clamp-1">{maintenance.descricao}</p>
                        <p className="text-xs text-[var(--color-text-secondary)] md:hidden">{formatDate(maintenance.data_manutencao) || '—'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${TYPE_COLORS[maintenance.tipo_manutencao] || TYPE_COLORS.Outros}`}>
                          {maintenance.tipo_manutencao}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[var(--color-text-secondary)] hidden sm:table-cell max-w-[200px] xl:max-w-[300px]">
                        <p className="truncate">{maintenance.descricao || '—'}</p>
                      </td>
                      <td className="px-4 py-3 text-[var(--color-text-secondary)] hidden md:table-cell whitespace-nowrap">{formatDate(maintenance.data_manutencao) || '—'}</td>
                      <td className="px-4 py-3 text-right font-semibold text-red-400 tabular-nums whitespace-nowrap">{formatCurrency(maintenance.valor_total)}</td>
                      <td className="px-4 py-3 text-right text-[var(--color-text-secondary)] tabular-nums hidden lg:table-cell">{maintenance.km_manutencao ? formatNumber(maintenance.km_manutencao, 0) : '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Button variant="outline" size="sm" onClick={() => setEditingMaintenance(maintenance)}>
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="danger" size="sm" onClick={() => setDeletingMaintenance(maintenance)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* Modal: Registrar Manutenção */}
      <Modal isOpen={showCreateForm} onClose={() => setShowCreateForm(false)} title="Registrar Manutenção">
        <MaintenanceForm trucks={trucks} onSuccess={handleSuccess} />
      </Modal>

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
