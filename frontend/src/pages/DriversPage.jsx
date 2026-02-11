import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { DriverForm } from '../components/forms/DriverForm';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Users, Phone, CreditCard, Edit2, Trash2, Search, Filter } from 'lucide-react';
import { formatCPF } from '../lib/utils';
import { driversService } from '../services/drivers';
import { useToast } from '../hooks/useToast';

function EditDriverModal({ driver, isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();
  const [formData, setFormData] = useState({
    nome: driver.nome || '',
    cpf: driver.cpf || '',
    telefone: driver.telefone || ''
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
      console.error('Failed to update driver:', err);
      error('Erro', err.message || 'Falha ao atualizar motorista');
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
            variant="success"
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

export function DriversPage({ drivers, onRefetch }) {
  const { success, error } = useToast();
  const [editingDriver, setEditingDriver] = useState(null);
  const [deletingDriver, setDeletingDriver] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('nome');
  const [showFilters, setShowFilters] = useState(false);

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

  const handleDelete = async () => {
    if (!deletingDriver) return;

    setDeleteLoading(true);
    try {
      await driversService.delete(deletingDriver.id);
      success('Sucesso!', 'Motorista excluído com sucesso');
      onRefetch?.();
      setDeletingDriver(null);
    } catch (err) {
      console.error('Failed to delete driver:', err);
      error('Erro', err.message || 'Falha ao excluir motorista');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Cadastrar Novo Motorista</CardTitle>
        </CardHeader>
        <CardContent>
          <DriverForm onSuccess={onRefetch} />
        </CardContent>
      </Card>

      <div>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Equipe ({filteredAndSortedDrivers.length} de {drivers.length})
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
            {filteredAndSortedDrivers.map(driver => (
              <Card key={driver.id} className="hover:shadow-md transition-shadow">
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                      <Users className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                        {driver.nome}
                      </h3>
                      <div className="mt-1 flex items-center gap-4 text-sm text-zinc-500">
                        <span className="flex items-center gap-1">
                          <CreditCard className="h-3 w-3" />
                          {formatCPF(driver.cpf)}
                        </span>
                        {driver.telefone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {driver.telefone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingDriver(driver)}
                    >
                      <Edit2 className="mr-2 h-4 w-4" />
                      Editar
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setDeletingDriver(driver)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

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
