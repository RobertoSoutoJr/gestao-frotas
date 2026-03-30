import { useState, useMemo, lazy, Suspense } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { SupplierForm } from '../components/forms/SupplierForm';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Factory, Phone, Mail, MapPin, Edit2, Trash2, Search, Filter, Plus } from 'lucide-react';

const LocationPicker = lazy(() => import('../components/ui/LocationPicker').then(m => ({ default: m.LocationPicker })));
import { suppliersService } from '../services/suppliers';
import { useToast } from '../hooks/useToast';

const ESTADOS_BR = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA',
  'PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
];

function EditSupplierModal({ supplier, isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();
  const [formData, setFormData] = useState({
    nome: supplier.nome || '',
    cpf_cnpj: supplier.cpf_cnpj || '',
    telefone: supplier.telefone || '',
    email: supplier.email || '',
    endereco: supplier.endereco || '',
    cidade: supplier.cidade || '',
    estado: supplier.estado || '',
    cep: supplier.cep || '',
    observacoes: supplier.observacoes || '',
    latitude: supplier.latitude || null,
    longitude: supplier.longitude || null
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await suppliersService.update(supplier.id, formData);
      success('Sucesso!', 'Fornecedor atualizado com sucesso');
      onSuccess?.();
      onClose();
    } catch (err) {
      error('Erro', err.message || 'Falha ao atualizar fornecedor');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Fornecedor" size="lg">
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
            label="Localização do carregamento"
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

export function SuppliersPage({ suppliers, onRefetch }) {
  const { success, error } = useToast();
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [deletingSupplier, setDeletingSupplier] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => {
      const search = searchTerm.toLowerCase();
      return (
        s.nome?.toLowerCase().includes(search) ||
        s.cpf_cnpj?.includes(searchTerm) ||
        s.cidade?.toLowerCase().includes(search) ||
        s.telefone?.includes(searchTerm)
      );
    }).sort((a, b) => (a.nome || '').localeCompare(b.nome || ''));
  }, [suppliers, searchTerm]);

  const handleDelete = async () => {
    if (!deletingSupplier) return;
    setDeleteLoading(true);
    try {
      await suppliersService.delete(deletingSupplier.id);
      success('Sucesso!', 'Fornecedor excluído com sucesso');
      onRefetch?.();
      setDeletingSupplier(null);
    } catch (err) {
      error('Erro', err.message || 'Falha ao excluir fornecedor');
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
      <div>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-[var(--color-text)]">
            Fornecedores ({filteredSuppliers.length} de {suppliers.length})
          </h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="mr-2 h-4 w-4" />
              {showFilters ? 'Ocultar Filtros' : 'Filtros'}
            </Button>
            <Button variant="primary" size="sm" onClick={() => setShowCreateForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Cadastrar Fornecedor
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

        {suppliers.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <EmptyState icon={Factory} title="Nenhum fornecedor cadastrado" description="Adicione seu primeiro fornecedor (local de carregamento) para começar" />
            </CardContent>
          </Card>
        ) : filteredSuppliers.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <EmptyState icon={Search} title="Nenhum resultado encontrado" description="Tente ajustar os filtros de busca" />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredSuppliers.map(supplier => (
              <Card key={supplier.id} className="hover:shadow-md transition-shadow">
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10">
                      <Factory className="h-5 w-5 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[var(--color-text)]">{supplier.nome}</h3>
                      <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-[var(--color-text-secondary)]">
                        {supplier.cidade && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {supplier.cidade}{supplier.estado ? `/${supplier.estado}` : ''}
                          </span>
                        )}
                        {supplier.telefone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {supplier.telefone}
                          </span>
                        )}
                        {supplier.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {supplier.email}
                          </span>
                        )}
                      </div>
                      {supplier.endereco && (
                        <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{supplier.endereco}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditingSupplier(supplier)}>
                      <Edit2 className="mr-2 h-4 w-4" /> Editar
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => setDeletingSupplier(supplier)}>
                      <Trash2 className="mr-2 h-4 w-4" /> Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Cadastrar Fornecedor */}
      <Modal isOpen={showCreateForm} onClose={() => setShowCreateForm(false)} title="Cadastrar Novo Fornecedor" size="lg">
        <SupplierForm onSuccess={handleCreateSuccess} />
      </Modal>

      {editingSupplier && (
        <EditSupplierModal supplier={editingSupplier} isOpen={!!editingSupplier} onClose={() => setEditingSupplier(null)} onSuccess={onRefetch} />
      )}

      <ConfirmDialog
        isOpen={!!deletingSupplier}
        onClose={() => setDeletingSupplier(null)}
        onConfirm={handleDelete}
        title="Excluir Fornecedor"
        description={`Tem certeza que deseja excluir o fornecedor ${deletingSupplier?.nome}? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        isLoading={deleteLoading}
      />
    </div>
  );
}
