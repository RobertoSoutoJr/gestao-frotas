import { useState, useMemo } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Input } from '../components/ui/Input';
import { Wrench, Phone, MapPin, Edit2, Trash2, Search, Filter, Plus, X, FileText } from 'lucide-react';
import { oficinasService } from '../services/oficinas';
import { useToast } from '../hooks/useToast';
import { usePagination } from '../hooks/usePagination';
import { Pagination } from '../components/ui/Pagination';
import { maskCPFCNPJ, maskPhone } from '../lib/utils';

function OficinaFormModal({ oficina, isOpen, onClose, onSuccess, isEdit = false }) {
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();
  const [formData, setFormData] = useState({
    nome: oficina?.nome || '',
    endereco: oficina?.endereco || '',
    telefone: oficina?.telefone || '',
    cnpj: oficina?.cnpj || '',
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
      if (isEdit && oficina) {
        await oficinasService.update(oficina.id, formData);
        success('Sucesso!', 'Oficina atualizada');
      } else {
        await oficinasService.create(formData);
        success('Sucesso!', 'Oficina cadastrada');
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      error('Erro', err.message || 'Falha ao salvar oficina');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Editar Oficina' : 'Cadastrar Oficina'} size="md" warnUnsaved>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input name="nome" label="Nome *" value={formData.nome} onChange={handleChange} required placeholder="Nome da oficina" />
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

export function OficinasPage({ oficinas, onRefetch }) {
  const { success, error } = useToast();
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const filtered = useMemo(() => {
    return oficinas.filter(o => {
      const s = searchTerm.toLowerCase();
      return o.nome?.toLowerCase().includes(s) || o.cnpj?.includes(searchTerm) || o.endereco?.toLowerCase().includes(s);
    }).sort((a, b) => (a.nome || '').localeCompare(b.nome || ''));
  }, [oficinas, searchTerm]);

  const pagination = usePagination(filtered);

  const handleDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await oficinasService.delete(deleting.id);
      success('Sucesso!', 'Oficina excluida');
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
            Oficinas ({filtered.length} de {oficinas.length})
          </h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="mr-2 h-4 w-4" />{showFilters ? 'Ocultar' : 'Filtros'}
            </Button>
            <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}>
              <Plus className="mr-2 h-4 w-4" />Cadastrar Oficina
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

        {oficinas.length === 0 ? (
          <Card><CardContent className="py-12"><EmptyState icon={Wrench} title="Nenhuma oficina cadastrada" description="Adicione oficinas para vincular as manutencoes" /></CardContent></Card>
        ) : filtered.length === 0 ? (
          <Card><CardContent className="py-12"><EmptyState icon={Search} title="Nenhum resultado" description="Ajuste os filtros de busca" /></CardContent></Card>
        ) : (
          <div className="space-y-3">
            {pagination.paginatedItems.map(o => (
              <Card key={o.id} className="hover:shadow-md transition-shadow">
                <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-6">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full bg-orange-500/10">
                      <Wrench className="h-5 w-5 text-orange-400" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-[var(--color-text)] truncate">{o.nome}</h3>
                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--color-text-secondary)]">
                        {o.telefone && <span className="flex items-center gap-1"><Phone className="h-3 w-3 shrink-0" />{o.telefone}</span>}
                        {o.cnpj && <span className="flex items-center gap-1"><FileText className="h-3 w-3 shrink-0" />{o.cnpj}</span>}
                      </div>
                      {o.endereco && <p className="mt-1 text-xs text-[var(--color-text-secondary)] truncate"><MapPin className="h-3 w-3 inline mr-1" />{o.endereco}</p>}
                    </div>
                  </div>
                  <div className="flex gap-2 sm:shrink-0 self-end sm:self-center">
                    <Button variant="outline" size="sm" onClick={() => setEditing(o)}><Edit2 className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Editar</span></Button>
                    <Button variant="danger" size="sm" onClick={() => setDeleting(o)}><Trash2 className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Excluir</span></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Pagination {...pagination} />
          </div>
        )}
      </div>

      {showCreate && <OficinaFormModal isOpen onClose={() => setShowCreate(false)} onSuccess={() => { onRefetch?.(); setShowCreate(false); }} />}
      {editing && <OficinaFormModal oficina={editing} isEdit isOpen onClose={() => setEditing(null)} onSuccess={onRefetch} />}
      <ConfirmDialog isOpen={!!deleting} onClose={() => setDeleting(null)} onConfirm={handleDelete} title="Excluir Oficina" description={`Excluir "${deleting?.nome}"? Manutenções vinculadas perderão a referência.`} confirmText="Excluir" cancelText="Cancelar" variant="danger" isLoading={deleteLoading} />
    </div>
  );
}
