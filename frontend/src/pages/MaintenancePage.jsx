import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { MaintenanceForm } from '../components/forms/MaintenanceForm';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { DocumentGallery } from '../components/ui/DocumentGallery';
import { TableToolbar, FilterSelect } from '../components/ui/TableToolbar';
import { TableFooter } from '../components/ui/TableFooter';
import { Wrench, Truck, Calendar, DollarSign, Edit2, Trash2, Search, Filter, Plus, X } from 'lucide-react';
import { formatNumber, formatCurrency, formatDate } from '../lib/utils';
import { exportToCsv } from '../lib/exportCsv';
import { maintenanceService } from '../services/maintenance';
import { useToast } from '../hooks/useToast';
import { PageSkeleton } from '../components/ui/Skeleton';
import { usePagination } from '../hooks/usePagination';
import { useSortable } from '../hooks/useSortable';
import { useSelection } from '../hooks/useSelection';
import { Pagination } from '../components/ui/Pagination';
import { SortHeader } from '../components/ui/SortHeader';

const MAINTENANCE_TYPES = ['Preventiva', 'Corretiva', 'Pneus', 'Motor', 'Freios', 'Suspensão', 'Elétrica', 'Outros'];

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

const STATUS_LABELS = { pendente: 'Pendente', em_andamento: 'Em andamento', concluida: 'Concluída' };
const STATUS_COLORS = {
  pendente: 'bg-amber-500/15 text-amber-400',
  em_andamento: 'bg-blue-500/15 text-blue-400',
  concluida: 'bg-emerald-500/15 text-emerald-400',
};

function EditMaintenanceModal({ maintenance, trucks, oficinas = [], isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();
  const [formData, setFormData] = useState({
    caminhao_id: maintenance.caminhao_id || '',
    descricao: maintenance.descricao || '',
    tipo_manutencao: maintenance.tipo_manutencao || 'Preventiva',
    valor_total: maintenance.valor_total || '',
    km_manutencao: maintenance.km_manutencao || '',
    data_manutencao: maintenance.data_manutencao ? maintenance.data_manutencao.split('T')[0] : '',
    status: maintenance.status || 'concluida',
    oficina_id: maintenance.oficina_id || ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await maintenanceService.update(maintenance.id, {
        caminhao_id: Number(formData.caminhao_id),
        descricao: formData.descricao,
        tipo_manutencao: formData.tipo_manutencao,
        valor_total: Number(formData.valor_total),
        km_manutencao: Number(formData.km_manutencao),
        data_manutencao: formData.data_manutencao,
        status: formData.status,
        oficina_id: formData.oficina_id ? Number(formData.oficina_id) : null
      });
      success('Sucesso!', 'Manutenção atualizada');
      onSuccess?.();
      onClose();
    } catch (err) {
      error('Erro', err.message || 'Falha ao atualizar');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Manutenção">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Select name="caminhao_id" label="Caminhão" value={formData.caminhao_id} onChange={handleChange} required>
            <option value="">Selecione</option>
            {trucks.map(t => <option key={t.id} value={t.id}>{t.placa} - {t.modelo}</option>)}
          </Select>
          <Select name="tipo_manutencao" label="Tipo" value={formData.tipo_manutencao} onChange={handleChange} required>
            {MAINTENANCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </Select>
          <Select name="status" label="Status" value={formData.status} onChange={handleChange} required className="md:col-span-2">
            <option value="concluida">Concluída</option>
            <option value="pendente">Pendente</option>
            <option value="em_andamento">Em andamento</option>
          </Select>
          <Input name="descricao" label="Descrição" value={formData.descricao} onChange={handleChange} required className="md:col-span-2" />
          <Input name="valor_total" label="Valor (R$)" type="number" step="0.01" value={formData.valor_total} onChange={handleChange} required />
          <Input name="km_manutencao" label="KM" type="number" value={formData.km_manutencao} onChange={handleChange} required />
          <Input name="data_manutencao" label="Data" type="date" value={formData.data_manutencao} onChange={handleChange} required />
          <Select name="oficina_id" label="Oficina" value={formData.oficina_id} onChange={handleChange}>
            <option value="">Nenhuma</option>
            {oficinas.map(o => <option key={o.id} value={o.id}>{o.nome}</option>)}
          </Select>
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={loading}>Cancelar</Button>
          <Button type="submit" variant="primary" loading={loading} className="flex-1">Salvar</Button>
        </div>
      </form>
      <div className="mt-6 border-t border-[var(--color-border)] pt-6">
        <DocumentGallery entidadeTipo="manutencao" entidadeId={maintenance.id} />
      </div>
    </Modal>
  );
}

export function MaintenancePage({ trucks, oficinas = [], onRefetch }) {
  const { success, error } = useToast();
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingMaintenance, setEditingMaintenance] = useState(null);
  const [deletingMaintenance, setDeletingMaintenance] = useState(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTruck, setFilterTruck] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const getTruckName = (caminhaoId) => {
    const truck = trucks.find(t => t.id === caminhaoId);
    return truck ? `${truck.placa} - ${truck.modelo}` : 'N/A';
  };

  const filteredRecords = useMemo(() => {
    return maintenanceRecords.filter(record => {
      const searchLower = searchTerm.toLowerCase();
      const truckName = getTruckName(record.caminhao_id).toLowerCase();
      const description = (record.descricao || '').toLowerCase();

      const matchesSearch = !searchTerm || truckName.includes(searchLower) || description.includes(searchLower);
      const matchesTruck = !filterTruck || record.caminhao_id === Number(filterTruck);
      const matchesType = !filterType || record.tipo_manutencao === filterType;

      let matchesPeriod = true;
      if (filterPeriod) {
        const recordDate = new Date(record.data_manutencao || record.created_at);
        const now = new Date();
        switch (filterPeriod) {
          case 'today': matchesPeriod = recordDate.toDateString() === now.toDateString(); break;
          case 'week': matchesPeriod = recordDate >= new Date(now.getTime() - 7 * 86400000); break;
          case 'month': matchesPeriod = recordDate.getMonth() === now.getMonth() && recordDate.getFullYear() === now.getFullYear(); break;
          case '3months': matchesPeriod = recordDate >= new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()); break;
        }
      }
      return matchesSearch && matchesTruck && matchesType && matchesPeriod;
    });
  }, [maintenanceRecords, searchTerm, filterTruck, filterType, filterPeriod]);

  const { sortedItems: sortedMaint, sortKey, sortDir, requestSort } = useSortable(filteredRecords, { defaultKey: 'created_at', defaultDir: 'desc' });
  const pagination = usePagination(sortedMaint);
  const selection = useSelection(pagination.paginatedItems);

  // Totals
  const totals = useMemo(() => {
    const totalValor = filteredRecords.reduce((s, r) => s + (Number(r.valor_total) || 0), 0);
    const pendentes = filteredRecords.filter(r => r.status === 'pendente').length;
    return [
      { label: 'Total', value: totalValor, format: 'currency', color: 'text-red-400' },
      ...(pendentes > 0 ? [{ label: 'Pendentes', value: `${pendentes}`, format: 'text', color: 'text-amber-400' }] : []),
    ];
  }, [filteredRecords]);

  // Filter chips
  const filterChips = [
    filterTruck && { label: `Caminhão: ${getTruckName(Number(filterTruck)).split(' - ')[0]}`, active: true, onClear: () => setFilterTruck('') },
    filterType && { label: `Tipo: ${filterType}`, active: true, onClear: () => setFilterType('') },
    filterPeriod && { label: filterPeriod === 'today' ? 'Hoje' : filterPeriod === 'week' ? 'Semana' : filterPeriod === 'month' ? 'Mês' : '3 meses', active: true, onClear: () => setFilterPeriod('') },
  ].filter(Boolean);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const response = await maintenanceService.getAll();
      setMaintenanceRecords(response.data || response || []);
    } catch (err) {
      error('Erro', 'Falha ao carregar manutenções');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRecords(); }, []);

  const handleSuccess = () => { loadRecords(); onRefetch?.(); setShowCreateForm(false); };

  const handleDelete = async () => {
    if (!deletingMaintenance) return;
    setDeleteLoading(true);
    try {
      await maintenanceService.delete(deletingMaintenance.id);
      success('Sucesso!', 'Manutenção excluída');
      handleSuccess();
      setDeletingMaintenance(null);
    } catch (err) {
      error('Erro', err.message || 'Falha ao excluir');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    setDeleteLoading(true);
    try {
      await Promise.all(selection.selectedItems.map(item => maintenanceService.delete(item.id)));
      success('Sucesso!', `${selection.count} manutenç${selection.count > 1 ? 'ões excluídas' : 'ão excluída'}`);
      selection.clear();
      handleSuccess();
      setBulkDeleting(false);
    } catch (err) {
      error('Erro', err.message || 'Falha ao excluir em lote');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleExport = () => {
    exportToCsv(filteredRecords, [
      { key: 'caminhao_id', label: 'Caminhão', format: (v) => getTruckName(v) },
      { key: 'tipo_manutencao', label: 'Tipo' },
      { key: 'status', label: 'Status', format: (v) => STATUS_LABELS[v] || v },
      { key: 'descricao', label: 'Descrição' },
      { key: 'data_manutencao', label: 'Data', format: (v) => formatDate(v) },
      { key: 'valor_total', label: 'Valor' },
      { key: 'km_manutencao', label: 'KM' },
    ], 'manutencoes');
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-[var(--color-text)]">Manutenções</h2>
        <Button variant="primary" size="sm" onClick={() => setShowCreateForm(true)} disabled={trucks.length === 0}>
          <Plus className="mr-2 h-4 w-4" />Registrar
        </Button>
      </div>

      {loading ? (
        <PageSkeleton type="table" />
      ) : maintenanceRecords.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <EmptyState icon={Wrench} title="Nenhuma manutenção registrada" description="Os registros aparecerão aqui" />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="p-4 pb-0">
            <TableToolbar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              searchPlaceholder="Buscar caminhão, descrição..."
              filterChips={filterChips}
              selectionCount={selection.count}
              onBulkDelete={() => setBulkDeleting(true)}
              onClearSelection={selection.clear}
              onExport={handleExport}
            >
              <FilterSelect value={filterTruck} onChange={setFilterTruck} placeholder="Caminhão">
                {trucks.map(t => <option key={t.id} value={t.id}>{t.placa}</option>)}
              </FilterSelect>
              <FilterSelect value={filterType} onChange={setFilterType} placeholder="Tipo">
                {MAINTENANCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </FilterSelect>
              <FilterSelect value={filterPeriod} onChange={setFilterPeriod} placeholder="Período">
                <option value="today">Hoje</option>
                <option value="week">Semana</option>
                <option value="month">Mês</option>
                <option value="3months">3 meses</option>
              </FilterSelect>
            </TableToolbar>
          </div>

          {filteredRecords.length === 0 ? (
            <div className="py-12">
              <EmptyState icon={Search} title="Nenhum resultado" description="Tente ajustar os filtros" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto mt-3">
                <table className="w-full text-sm min-w-[700px]">
                  <thead>
                    <tr className="border-b border-[var(--color-border)]">
                      <th className="w-10 px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selection.allSelected}
                          ref={el => { if (el) el.indeterminate = selection.someSelected; }}
                          onChange={selection.toggleAll}
                          className="h-3.5 w-3.5 rounded border-[var(--color-border)] text-[var(--color-accent)] focus:ring-[var(--color-accent)] cursor-pointer"
                        />
                      </th>
                      <SortHeader column="caminhao_id" label="Caminhão" sortKey={sortKey} sortDir={sortDir} onSort={requestSort} />
                      <SortHeader column="tipo_manutencao" label="Tipo" sortKey={sortKey} sortDir={sortDir} onSort={requestSort} />
                      <SortHeader column="status" label="Status" sortKey={sortKey} sortDir={sortDir} onSort={requestSort} className="hidden sm:table-cell" />
                      <SortHeader column="descricao" label="Descrição" sortKey={sortKey} sortDir={sortDir} onSort={requestSort} className="hidden md:table-cell" />
                      <SortHeader column="data_manutencao" label="Data" sortKey={sortKey} sortDir={sortDir} onSort={requestSort} className="hidden md:table-cell" />
                      <SortHeader column="valor_total" label="Valor" sortKey={sortKey} sortDir={sortDir} onSort={requestSort} align="right" />
                      <SortHeader column="km_manutencao" label="KM" sortKey={sortKey} sortDir={sortDir} onSort={requestSort} align="right" className="hidden lg:table-cell" />
                      <th className="px-4 py-3 text-right font-medium text-[var(--color-text-secondary)]">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagination.paginatedItems.map(m => {
                      const selected = selection.isSelected(m.id);
                      return (
                        <tr
                          key={m.id}
                          className={`border-b border-[var(--color-border)]/50 transition-colors ${
                            selected ? 'bg-[var(--color-accent)]/5' : 'hover:bg-[var(--color-surface)]'
                          }`}
                        >
                          <td className="w-10 px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() => selection.toggle(m.id)}
                              className="h-3.5 w-3.5 rounded border-[var(--color-border)] text-[var(--color-accent)] focus:ring-[var(--color-accent)] cursor-pointer"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-[var(--color-text)]">{getTruckName(m.caminhao_id).split(' - ')[0]}</p>
                            <p className="text-xs text-[var(--color-text-secondary)] sm:hidden line-clamp-1">{m.descricao}</p>
                            <p className="text-xs text-[var(--color-text-secondary)] md:hidden">{formatDate(m.data_manutencao) || '—'}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap ${TYPE_COLORS[m.tipo_manutencao] || TYPE_COLORS.Outros}`}>
                              {m.tipo_manutencao}
                            </span>
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell">
                            <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap ${STATUS_COLORS[m.status] || STATUS_COLORS.concluida}`}>
                              {STATUS_LABELS[m.status] || m.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[var(--color-text-secondary)] hidden md:table-cell max-w-[200px]">
                            <p className="truncate">{m.descricao || '—'}</p>
                          </td>
                          <td className="px-4 py-3 text-[var(--color-text-secondary)] hidden md:table-cell whitespace-nowrap">{formatDate(m.data_manutencao) || '—'}</td>
                          <td className="px-4 py-3 text-right font-semibold text-red-400 tabular-nums whitespace-nowrap">{formatCurrency(m.valor_total)}</td>
                          <td className="px-4 py-3 text-right text-[var(--color-text-secondary)] tabular-nums hidden lg:table-cell">{m.km_manutencao ? formatNumber(m.km_manutencao, 0) : '—'}</td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-1">
                              <Button variant="outline" size="sm" onClick={() => setEditingMaintenance(m)} aria-label="Editar">
                                <Edit2 className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="danger" size="sm" onClick={() => setDeletingMaintenance(m)} aria-label="Excluir">
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <TableFooter
                totals={totals}
                totalItems={maintenanceRecords.length}
                filteredItems={filteredRecords.length}
              />

              <div className="px-4">
                <Pagination {...pagination} />
              </div>
            </>
          )}
        </Card>
      )}

      {/* Modals */}
      <Modal isOpen={showCreateForm} onClose={() => setShowCreateForm(false)} title="Registrar Manutenção" warnUnsaved>
        <MaintenanceForm trucks={trucks} oficinas={oficinas} onSuccess={handleSuccess} />
      </Modal>

      {editingMaintenance && (
        <EditMaintenanceModal maintenance={editingMaintenance} trucks={trucks} oficinas={oficinas} isOpen={!!editingMaintenance} onClose={() => setEditingMaintenance(null)} onSuccess={handleSuccess} />
      )}

      <ConfirmDialog
        isOpen={!!deletingMaintenance}
        onClose={() => setDeletingMaintenance(null)}
        onConfirm={handleDelete}
        title="Excluir Manutenção"
        description="Tem certeza? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        variant="danger"
        isLoading={deleteLoading}
      />

      <ConfirmDialog
        isOpen={bulkDeleting}
        onClose={() => setBulkDeleting(false)}
        onConfirm={handleBulkDelete}
        title={`Excluir ${selection.count} manutenç${selection.count > 1 ? 'ões' : 'ão'}`}
        description={`Tem certeza que deseja excluir ${selection.count} registro${selection.count > 1 ? 's' : ''} selecionado${selection.count > 1 ? 's' : ''}?`}
        confirmText="Excluir Todos"
        variant="danger"
        isLoading={deleteLoading}
      />
    </div>
  );
}
