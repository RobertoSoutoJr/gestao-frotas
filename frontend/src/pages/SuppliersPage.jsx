import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { SupplierForm } from '../components/forms/SupplierForm';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Factory, Phone, Mail, MapPin, Edit2, Trash2, Search, Filter } from 'lucide-react';
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
    observacoes: supplier.observacoes || ''
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
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={loading}>Cancelar</Button>
          <Button type="submit" variant="success" loading={loading} className="flex-1">Salvar Alterações</Button>
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

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Cadastrar Novo Fornecedor</CardTitle>
        </CardHeader>
        <CardContent>
          <SupplierForm onSuccess={onRefetch} />
        </CardContent>
      </Card>

      <div>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Fornecedores ({filteredSuppliers.length} de {suppliers.length})
          </h2>
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="mr-2 h-4 w-4" />
            {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          </Button>
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
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-900/20">
                      <Factory className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">{supplier.nome}</h3>
                      <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-zinc-500">
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
                        <p className="mt-1 text-xs text-zinc-400">{supplier.endereco}</p>
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
