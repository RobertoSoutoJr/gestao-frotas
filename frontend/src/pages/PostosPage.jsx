import { useState, useMemo } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Input } from '../components/ui/Input';
import { Fuel, Phone, MapPin, Edit2, Trash2, Search, Filter, Plus, X, FileText } from 'lucide-react';
import { postosService } from '../services/postos';
import { useToast } from '../hooks/useToast';
import { usePagination } from '../hooks/usePagination';
import { Pagination } from '../components/ui/Pagination';
import { maskCPFCNPJ, maskPhone } from '../lib/utils';

function PostoFormModal({ posto, isOpen, onClose, onSuccess, isEdit = false }) {
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();
  const [formData, setFormData] = useState({
    nome: posto?.nome || '',
    endereco: posto?.endereco || '',
    telefone: posto?.telefone || '',
    cnpj: posto?.cnpj || '',
  });

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === 'cnpj') value = maskCPFCNPJ(value);
    if (name === 'telefone') value = maskPhone(value);
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nome.trim()) return;
    setLoading(true);
    try {
      if (isEdit && posto) {
        await postosService.update(posto.id, formData);
        success('Sucesso!', 'Posto atualizado');
      } else {
        await postosService.create(formData);
        success('Sucesso!', 'Posto cadastrado');
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      error('Erro', err.message || 'Falha ao salvar posto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Editar Posto' : 'Cadastrar Posto'} size="md" warnUnsaved>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input name="nome" label="Nome *" value={formData.nome} onChange={handleChange} required placeholder="Nome do posto" />
        <Input name="cnpj" label="CNPJ" value={formData.cnpj} onChange={handleChange} placeholder="00.000.000/0000-00" />
        <Input name="telefone" label="Telefone" value={formData.telefone} onChange={handleChange} placeholder="(00) 00000-0000" />
        <Input name="endereco" label="Endereco" value={formData.endereco} onChange={handleChange} placeholder="Rua, numero, bairro, cidade" />
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={loading}>Cancelar</Button>
          <Button type="submit" variant="primary" loading={loading} className="flex-1">{isEdit ? 'Salvar' : 'Cadastrar'}</Button>
        </div>
      </form>
    </Modal>
  );
}

export function PostosPage({ postos, onRefetch }) {
  const { success, error } = useToast();
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const filtered = useMemo(() => {
    return postos.filter(p => {
      const s = searchTerm.toLowerCase();
      return p.nome?.toLowerCase().includes(s) || p.cnpj?.includes(searchTerm) || p.endereco?.toLowerCase().includes(s);
    }).sort((a, b) => (a.nome || '').localeCompare(b.nome || ''));
  }, [postos, searchTerm]);

  const pagination = usePagination(filtered);

  const handleDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await postosService.delete(deleting.id);
      success('Sucesso!', 'Posto excluido');
      onRefetch?.();
      setDeleting(null);
    } catch (err) {
      error('Erro', err.message || 'Falha ao excluir');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-[var(--color-text)]">
            Postos ({filtered.length} de {postos.length})
          </h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="mr-2 h-4 w-4" />{showFilters ? 'Ocultar' : 'Filtros'}
            </Button>
            <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}>
              <Plus className="mr-2 h-4 w-4" />Cadastrar Posto
            </Button>
          </div>
        </div>

        {showFilters && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <Input icon={Search} placeholder="Buscar por nome, CNPJ ou endereco..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                {searchTerm && (
                  <Button variant="outline" size="sm" onClick={() => setSearchTerm('')}>
                    <X className="mr-1 h-3.5 w-3.5" /> Limpar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {postos.length === 0 ? (
          <Card><CardContent className="py-12"><EmptyState icon={Fuel} title="Nenhum posto cadastrado" description="Adicione postos para vincular aos abastecimentos" /></CardContent></Card>
        ) : filtered.length === 0 ? (
          <Card><CardContent className="py-12"><EmptyState icon={Search} title="Nenhum resultado" description="Ajuste os filtros de busca" /></CardContent></Card>
        ) : (
          <div className="space-y-3">
            {pagination.paginatedItems.map(p => (
              <Card key={p.id} className="hover:shadow-md transition-shadow">
                <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-6">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full bg-green-500/10">
                      <Fuel className="h-5 w-5 text-green-400" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-[var(--color-text)] truncate">{p.nome}</h3>
                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--color-text-secondary)]">
                        {p.telefone && <span className="flex items-center gap-1"><Phone className="h-3 w-3 shrink-0" />{p.telefone}</span>}
                        {p.cnpj && <span className="flex items-center gap-1"><FileText className="h-3 w-3 shrink-0" />{p.cnpj}</span>}
                      </div>
                      {p.endereco && <p className="mt-1 text-xs text-[var(--color-text-secondary)] truncate"><MapPin className="h-3 w-3 inline mr-1" />{p.endereco}</p>}
                    </div>
                  </div>
                  <div className="flex gap-2 sm:shrink-0 self-end sm:self-center">
                    <Button variant="outline" size="sm" onClick={() => setEditing(p)}><Edit2 className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Editar</span></Button>
                    <Button variant="danger" size="sm" onClick={() => setDeleting(p)}><Trash2 className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Excluir</span></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Pagination {...pagination} />
          </div>
        )}
      </div>

      {showCreate && <PostoFormModal isOpen onClose={() => setShowCreate(false)} onSuccess={() => { onRefetch?.(); setShowCreate(false); }} />}
      {editing && <PostoFormModal posto={editing} isEdit isOpen onClose={() => setEditing(null)} onSuccess={onRefetch} />}
      <ConfirmDialog isOpen={!!deleting} onClose={() => setDeleting(null)} onConfirm={handleDelete} title="Excluir Posto" description={`Excluir "${deleting?.nome}"? Abastecimentos vinculados perderao a referencia.`} confirmText="Excluir" cancelText="Cancelar" variant="danger" isLoading={deleteLoading} />
    </div>
  );
}
