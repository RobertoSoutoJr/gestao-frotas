import { useState, useMemo, lazy, Suspense } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { ClientForm } from '../components/forms/ClientForm';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Building2, Phone, Mail, MapPin, Edit2, Trash2, Search, Filter, Plus, TrendingUp, DollarSign, Route } from 'lucide-react';

const LocationPicker = lazy(() => import('../components/ui/LocationPicker').then(m => ({ default: m.LocationPicker })));
import { formatCurrency } from '../lib/utils';
import { clientsService } from '../services/clients';
import { useToast } from '../hooks/useToast';

const ESTADOS_BR = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA',
  'PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
];

function EditClientModal({ client, isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();
  const [formData, setFormData] = useState({
    nome: client.nome || '',
    cpf_cnpj: client.cpf_cnpj || '',
    telefone: client.telefone || '',
    email: client.email || '',
    endereco: client.endereco || '',
    cidade: client.cidade || '',
    estado: client.estado || '',
    cep: client.cep || '',
    observacoes: client.observacoes || '',
    latitude: client.latitude || null,
    longitude: client.longitude || null
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await clientsService.update(client.id, formData);
      success('Sucesso!', 'Cliente atualizado com sucesso');
      onSuccess?.();
      onClose();
    } catch (err) {
      error('Erro', err.message || 'Falha ao atualizar cliente');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Cliente" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input name="nome" label="Nome / Razão Social" value={formData.nome} onChange={handleChange} required className="md:col-span-2" />
          <Input name="cpf_cnpj" label="CPF/CNPJ" value={formData.cpf_cnpj} onChange={handleChange} />
          <Input name="telefone" label="Telefone" value={formData.telefone} onChange={handleChange} />
          <Input name="email" label="E-mail" type="email" value={formData.email} onChange={handleChange} />
          <Input name="cep" label="CEP" value={formData.cep} onChange={handleChange} />
          <Input name="endereco" label="Endereço" value={formData.endereco} onChange={handleChange} className="md:col-span-2" />
          <Input name="cidade" label="Cidade" value={formData.cidade} onChange={handleChange} />
          <Select name="estado" label="Estado (UF)" value={formData.estado} onChange={handleChange}>
            <option value="">Selecione</option>
            {ESTADOS_BR.map(uf => <option key={uf} value={uf}>{uf}</option>)}
          </Select>
          <Input name="observacoes" label="Observações" value={formData.observacoes} onChange={handleChange} className="md:col-span-2" />
        </div>

        <Suspense fallback={<div className="h-[280px] rounded-xl bg-[var(--color-bg-elevated)] animate-pulse" />}>
          <LocationPicker
            label="Localização"
            latitude={formData.latitude}
            longitude={formData.longitude}
            onChange={({ latitude, longitude }) => setFormData(prev => ({ ...prev, latitude, longitude }))}
          />
        </Suspense>

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={loading}>Cancelar</Button>
          <Button type="submit" variant="primary" loading={loading} className="flex-1">Salvar Alterações</Button>
        </div>
      </form>
    </Modal>
  );
}

function useClientProfitability(clients, trips) {
  return useMemo(() => {
    const finalized = (trips || []).filter(t => t.status === 'finalizada');
    const map = {};

    finalized.forEach(t => {
      const cid = t.cliente_id;
      if (!map[cid]) map[cid] = { receita: 0, custos: 0, viagens: 0 };
      map[cid].receita += Number(t.valor_total_frete) || 0;
      map[cid].custos += (Number(t.custo_combustivel) || 0) + (Number(t.custo_pedagio) || 0) +
        (Number(t.custo_manutencao) || 0) + (Number(t.custo_outros) || 0);
      map[cid].viagens += 1;
    });

    // Calculate profit and margin
    Object.values(map).forEach(v => {
      v.lucro = v.receita - v.custos;
      v.margem = v.receita > 0 ? (v.lucro / v.receita) * 100 : 0;
    });

    // Ranking sorted by lucro descending
    const ranking = Object.entries(map)
      .map(([id, data]) => {
        const client = (clients || []).find(c => c.id === Number(id));
        return { id: Number(id), nome: client?.nome || `#${id}`, ...data };
      })
      .sort((a, b) => b.lucro - a.lucro);

    return { map, ranking };
  }, [clients, trips]);
}

export function ClientsPage({ clients, trips, onRefetch }) {
  const { success, error } = useToast();
  const [editingClient, setEditingClient] = useState(null);
  const [deletingClient, setDeletingClient] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { map: profitMap, ranking } = useClientProfitability(clients, trips);

  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      const s = searchTerm.toLowerCase();
      return (
        c.nome?.toLowerCase().includes(s) ||
        c.cpf_cnpj?.includes(searchTerm) ||
        c.cidade?.toLowerCase().includes(s) ||
        c.telefone?.includes(searchTerm)
      );
    }).sort((a, b) => (a.nome || '').localeCompare(b.nome || ''));
  }, [clients, searchTerm]);

  const handleDelete = async () => {
    if (!deletingClient) return;
    setDeleteLoading(true);
    try {
      await clientsService.delete(deletingClient.id);
      success('Sucesso!', 'Cliente excluído com sucesso');
      onRefetch?.();
      setDeletingClient(null);
    } catch (err) {
      error('Erro', err.message || 'Falha ao excluir cliente');
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
      {/* Profitability Ranking */}
      {ranking.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-3">
            Rentabilidade por Cliente
          </h2>
          <div className="overflow-x-auto">
            <Card>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--color-border)] text-[var(--color-text-secondary)]">
                      <th className="px-4 py-3 text-left font-medium">#</th>
                      <th className="px-4 py-3 text-left font-medium">Cliente</th>
                      <th className="px-4 py-3 text-right font-medium">Viagens</th>
                      <th className="px-4 py-3 text-right font-medium">Receita</th>
                      <th className="px-4 py-3 text-right font-medium hidden sm:table-cell">Custos</th>
                      <th className="px-4 py-3 text-right font-medium">Lucro</th>
                      <th className="px-4 py-3 text-right font-medium hidden sm:table-cell">Margem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ranking.slice(0, 10).map((r, i) => (
                      <tr key={r.id} className="border-b border-[var(--color-border)] last:border-0">
                        <td className="px-4 py-3 font-medium text-[var(--color-text-secondary)]">{i + 1}</td>
                        <td className="px-4 py-3 font-medium text-[var(--color-text)]">{r.nome}</td>
                        <td className="px-4 py-3 text-right text-[var(--color-text-secondary)] tabular-nums">{r.viagens}</td>
                        <td className="px-4 py-3 text-right text-[var(--color-text)] tabular-nums">{formatCurrency(r.receita)}</td>
                        <td className="px-4 py-3 text-right text-red-400 tabular-nums hidden sm:table-cell">{formatCurrency(r.custos)}</td>
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
            Clientes ({filteredClients.length} de {clients.length})
          </h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="mr-2 h-4 w-4" />
              {showFilters ? 'Ocultar Filtros' : 'Filtros'}
            </Button>
            <Button variant="primary" size="sm" onClick={() => setShowCreateForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Cadastrar Cliente
            </Button>
          </div>
        </div>

        {showFilters && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <Input icon={Search} placeholder="Buscar por nome, CPF/CNPJ, cidade ou telefone..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </CardContent>
          </Card>
        )}

        {clients.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <EmptyState icon={Building2} title="Nenhum cliente cadastrado" description="Adicione seu primeiro cliente para começar a gerenciar as viagens" />
            </CardContent>
          </Card>
        ) : filteredClients.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <EmptyState icon={Search} title="Nenhum resultado encontrado" description="Tente ajustar os filtros de busca" />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredClients.map(client => (
              <Card key={client.id} className="hover:shadow-md transition-shadow">
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">
                      <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[var(--color-text)]">{client.nome}</h3>
                      <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-[var(--color-text-secondary)]">
                        {client.cidade && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {client.cidade}{client.estado ? `/${client.estado}` : ''}
                          </span>
                        )}
                        {client.telefone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {client.telefone}
                          </span>
                        )}
                        {client.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {client.email}
                          </span>
                        )}
                      </div>
                      {client.endereco && (
                        <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{client.endereco}</p>
                      )}
                      {profitMap[client.id] && (
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                          <span className="flex items-center gap-1 text-[var(--color-text-secondary)]">
                            <Route className="h-3 w-3" />
                            {profitMap[client.id].viagens} viagen{profitMap[client.id].viagens > 1 ? 's' : ''}
                          </span>
                          <span className="flex items-center gap-1 text-blue-400">
                            <DollarSign className="h-3 w-3" />
                            {formatCurrency(profitMap[client.id].receita)}
                          </span>
                          <span className={`flex items-center gap-1 font-medium ${profitMap[client.id].lucro >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            <TrendingUp className="h-3 w-3" />
                            {formatCurrency(profitMap[client.id].lucro)} ({profitMap[client.id].margem.toFixed(1)}%)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditingClient(client)}>
                      <Edit2 className="mr-2 h-4 w-4" /> Editar
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => setDeletingClient(client)}>
                      <Trash2 className="mr-2 h-4 w-4" /> Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Cadastrar Cliente */}
      <Modal isOpen={showCreateForm} onClose={() => setShowCreateForm(false)} title="Cadastrar Novo Cliente" size="lg">
        <ClientForm onSuccess={handleCreateSuccess} />
      </Modal>

      {editingClient && (
        <EditClientModal client={editingClient} isOpen={!!editingClient} onClose={() => setEditingClient(null)} onSuccess={onRefetch} />
      )}

      <ConfirmDialog
        isOpen={!!deletingClient}
        onClose={() => setDeletingClient(null)}
        onConfirm={handleDelete}
        title="Excluir Cliente"
        description={`Tem certeza que deseja excluir o cliente ${deletingClient?.nome}? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        isLoading={deleteLoading}
      />
    </div>
  );
}
