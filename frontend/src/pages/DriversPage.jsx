import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { DriverForm } from '../components/forms/DriverForm';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { DocumentGallery } from '../components/ui/DocumentGallery';
import { Users, Phone, CreditCard, Edit2, Trash2, Search, Filter, Plus, Route, DollarSign, TrendingUp, Fuel as FuelIcon, X } from 'lucide-react';
import { formatCPF, formatCurrency, formatNumber, maskCPF, maskPhone } from '../lib/utils';
import { driversService } from '../services/drivers';
import { useToast } from '../hooks/useToast';
import { usePagination } from '../hooks/usePagination';
import { Pagination } from '../components/ui/Pagination';

function useDriverPerformance(drivers, trips, fuelRecords) {
  return useMemo(() => {
    const finalized = (trips || []).filter(t => t.status === 'finalizada');
    const map = {};

    finalized.forEach(t => {
      const did = t.motorista_id;
      if (!did) return;
      if (!map[did]) map[did] = { viagens: 0, km: 0, receita: 0, custos: 0, litros: 0 };
      map[did].viagens += 1;
      map[did].km += Number(t.km_total) || 0;
      map[did].receita += Number(t.valor_total_frete) || 0;
      map[did].custos += (Number(t.custo_combustivel) || 0) + (Number(t.custo_pedagio) || 0) +
        (Number(t.custo_manutencao) || 0) + (Number(t.custo_outros) || 0);
    });

    (fuelRecords || []).forEach(r => {
      const did = r.motorista_id;
      if (!did) return;
      if (!map[did]) map[did] = { viagens: 0, km: 0, receita: 0, custos: 0, litros: 0 };
      map[did].litros += Number(r.litros) || 0;
    });

    Object.values(map).forEach(v => {
      v.lucro = v.receita - v.custos;
      v.margem = v.receita > 0 ? (v.lucro / v.receita) * 100 : 0;
      v.kmPerLiter = v.litros > 0 ? v.km / v.litros : 0;
    });

    const ranking = Object.entries(map)
      .map(([id, data]) => {
        const driver = (drivers || []).find(d => d.id === Number(id));
        return { id: Number(id), nome: driver?.nome || `#${id}`, ...data };
      })
      .sort((a, b) => b.viagens - a.viagens);

    return { map, ranking };
  }, [drivers, trips, fuelRecords]);
}

function EditDriverModal({ driver, isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();
  const [formData, setFormData] = useState({
    nome: driver.nome || '',
    cpf: driver.cpf || '',
    telefone: driver.telefone || '',
    numero_cnh: driver.numero_cnh || '',
    validade_cnh: driver.validade_cnh ? driver.validade_cnh.split('T')[0] : ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await driversService.update(driver.id, formData);
      success('Sucesso!', 'Motorista atualizado com sucesso');
      onSuccess?.();
      onClose();
    } catch (err) {

      error('Erro', err.message || 'Falha ao atualizar motorista');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === 'cpf') value = maskCPF(value);
    if (name === 'telefone') value = maskPhone(value);
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Motorista">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            name="nome"
            label="Nome Completo"
            placeholder="João Silva"
            value={formData.nome}
            onChange={handleChange}
            required
            className="md:col-span-2"
          />
          <Input
            name="cpf"
            label="CPF"
            placeholder="000.000.000-00"
            value={formData.cpf}
            onChange={handleChange}
            required
          />
          <Input
            name="telefone"
            label="Telefone"
            placeholder="(11) 98888-8888"
            value={formData.telefone}
            onChange={handleChange}
          />
          <Input
            name="numero_cnh"
            label="Numero CNH"
            placeholder="00000000000"
            value={formData.numero_cnh}
            onChange={handleChange}
          />
          <Input
            name="validade_cnh"
            label="Validade CNH"
            type="date"
            value={formData.validade_cnh}
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

      {/* Documentos do Motorista */}
      <div className="mt-6 border-t border-[var(--color-border)] pt-6">
        <DocumentGallery entidadeTipo="motorista" entidadeId={driver.id} />
      </div>
    </Modal>
  );
}

export function DriversPage({ drivers, trips, fuelRecords, onRefetch }) {
  const { success, error } = useToast();
  const [editingDriver, setEditingDriver] = useState(null);
  const [deletingDriver, setDeletingDriver] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('nome');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { map: perfMap, ranking } = useDriverPerformance(drivers, trips, fuelRecords);

  const filteredAndSortedDrivers = useMemo(() => {
    let filtered = drivers.filter(driver => {
      const searchLower = searchTerm.toLowerCase();
      return (
        driver.nome?.toLowerCase().includes(searchLower) ||
        driver.cpf?.includes(searchTerm) ||
        driver.telefone?.includes(searchTerm)
      );
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'nome':
          return (a.nome || '').localeCompare(b.nome || '');
        case 'cpf':
          return (a.cpf || '').localeCompare(b.cpf || '');
        default:
          return 0;
      }
    });

    return filtered;
  }, [drivers, searchTerm, sortBy]);

  const pagination = usePagination(filteredAndSortedDrivers);

  const handleDelete = async () => {
    if (!deletingDriver) return;

    setDeleteLoading(true);
    try {
      await driversService.delete(deletingDriver.id);
      success('Sucesso!', 'Motorista excluído com sucesso');
      onRefetch?.();
      setDeletingDriver(null);
    } catch (err) {

      error('Erro', err.message || 'Falha ao excluir motorista');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    onRefetch?.();
    setShowCreateForm(false);
  };

  return (
    <div className="space-y-8">
      {/* Performance Ranking */}
      {ranking.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-3">
            Produtividade por Motorista
          </h2>
          <div className="overflow-x-auto">
            <Card>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--color-border)] text-[var(--color-text-secondary)]">
                      <th className="px-4 py-3 text-left font-medium">#</th>
                      <th className="px-4 py-3 text-left font-medium">Motorista</th>
                      <th className="px-4 py-3 text-right font-medium">Viagens</th>
                      <th className="px-4 py-3 text-right font-medium hidden sm:table-cell">Km</th>
                      <th className="px-4 py-3 text-right font-medium">Receita</th>
                      <th className="px-4 py-3 text-right font-medium">Lucro</th>
                      <th className="px-4 py-3 text-right font-medium hidden sm:table-cell">Margem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ranking.slice(0, 10).map((r, i) => (
                      <tr key={r.id} className="border-b border-[var(--color-border)] last:border-0">
                        <td className="px-4 py-3 font-medium text-[var(--color-text-secondary)]">{i + 1}</td>
                        <td className="px-4 py-3 font-medium text-[var(--color-text)]">{r.nome}</td>
                        <td className="px-4 py-3 text-right text-[var(--color-text)] tabular-nums">{r.viagens}</td>
                        <td className="px-4 py-3 text-right text-[var(--color-text-secondary)] tabular-nums hidden sm:table-cell">{formatNumber(r.km, 0)}</td>
                        <td className="px-4 py-3 text-right text-[var(--color-text)] tabular-nums">{formatCurrency(r.receita)}</td>
                        <td className={`px-4 py-3 text-right font-semibold tabular-nums ${r.lucro >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{formatCurrency(r.lucro)}</td>
                        <td className={`px-4 py-3 text-right tabular-nums hidden sm:table-cell ${r.margem >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{r.margem.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <div>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-[var(--color-text)]">
            Equipe ({filteredAndSortedDrivers.length} de {drivers.length})
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
            >
              <Plus className="mr-2 h-4 w-4" />
              Cadastrar Motorista
            </Button>
          </div>
        </div>

        {showFilters && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                  icon={Search}
                  placeholder="Buscar por nome, CPF ou telefone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Select
                  label="Ordenar por"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="nome">Nome</option>
                  <option value="cpf">CPF</option>
                </Select>
                {searchTerm && (
                  <Button variant="outline" size="sm" onClick={() => setSearchTerm('')} className="self-end">
                    <X className="mr-1 h-3.5 w-3.5" /> Limpar Busca
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {drivers.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <EmptyState
                icon={Users}
                title="Nenhum motorista cadastrado"
                description="Adicione seu primeiro motorista para começar a gerenciar a equipe"
              />
            </CardContent>
          </Card>
        ) : filteredAndSortedDrivers.length === 0 ? (
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
            {pagination.paginatedItems.map(driver => (
              <Card key={driver.id} className="hover:shadow-md transition-shadow">
                <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-6">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-surface)]">
                      <Users className="h-5 w-5 text-[var(--color-text-secondary)]" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-[var(--color-text)] truncate">
                        {driver.nome}
                      </h3>
                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--color-text-secondary)]">
                        <span className="flex items-center gap-1">
                          <CreditCard className="h-3 w-3 shrink-0" />
                          {formatCPF(driver.cpf)}
                        </span>
                        {driver.telefone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3 shrink-0" />
                            {driver.telefone}
                          </span>
                        )}
                      </div>
                      {perfMap[driver.id] && (
                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                          <span className="flex items-center gap-1 text-[var(--color-text-secondary)]">
                            <Route className="h-3 w-3" />
                            {perfMap[driver.id].viagens} viagen{perfMap[driver.id].viagens > 1 ? 's' : ''}
                          </span>
                          {perfMap[driver.id].km > 0 && (
                            <span className="text-[var(--color-text-secondary)]">
                              {formatNumber(perfMap[driver.id].km, 0)} km
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-blue-400">
                            <DollarSign className="h-3 w-3" />
                            {formatCurrency(perfMap[driver.id].receita)}
                          </span>
                          <span className={`flex items-center gap-1 font-medium ${perfMap[driver.id].lucro >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            <TrendingUp className="h-3 w-3" />
                            {formatCurrency(perfMap[driver.id].lucro)} ({perfMap[driver.id].margem.toFixed(1)}%)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 sm:shrink-0 self-end sm:self-center">
                    <Button variant="outline" size="sm" onClick={() => setEditingDriver(driver)} aria-label="Editar motorista">
                      <Edit2 className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Editar</span>
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => setDeletingDriver(driver)} aria-label="Excluir motorista">
                      <Trash2 className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Excluir</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Pagination {...pagination} />
          </div>
        )}
      </div>

      {/* Modal: Cadastrar Motorista */}
      <Modal isOpen={showCreateForm} onClose={() => setShowCreateForm(false)} title="Cadastrar Novo Motorista">
        <DriverForm onSuccess={handleCreateSuccess} />
      </Modal>

      {editingDriver && (
        <EditDriverModal
          driver={editingDriver}
          isOpen={!!editingDriver}
          onClose={() => setEditingDriver(null)}
          onSuccess={onRefetch}
        />
      )}

      <ConfirmDialog
        isOpen={!!deletingDriver}
        onClose={() => setDeletingDriver(null)}
        onConfirm={handleDelete}
        title="Excluir Motorista"
        description={`Tem certeza que deseja excluir o motorista ${deletingDriver?.nome}? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        isLoading={deleteLoading}
      />
    </div>
  );
}
