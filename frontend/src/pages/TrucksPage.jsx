import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { TruckForm } from '../components/forms/TruckForm';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Truck, Gauge, Edit2, Trash2, Search, Filter } from 'lucide-react';
import { formatNumber } from '../lib/utils';
import { trucksService } from '../services/trucks';
import { useToast } from '../hooks/useToast';

function EditTruckModal({ truck, isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();
  const [formData, setFormData] = useState({
    placa: truck.placa || '',
    modelo: truck.modelo || '',
    ano: truck.ano || '',
    km_atual: truck.km_atual || '',
    capacidade_silo_ton: truck.capacidade_silo_ton || ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        ano: formData.ano ? Number(formData.ano) : undefined,
        km_atual: formData.km_atual ? Number(formData.km_atual) : undefined,
        capacidade_silo_ton: formData.capacidade_silo_ton ? Number(formData.capacidade_silo_ton) : undefined
      };

      await trucksService.update(truck.id, data);
      success('Sucesso!', 'Caminhão atualizado com sucesso');
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Failed to update truck:', err);
      error('Erro', err.message || 'Falha ao atualizar caminhão');
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
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Caminhão">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            name="placa"
            label="Placa"
            placeholder="ABC-1234"
            value={formData.placa}
            onChange={handleChange}
            required
          />
          <Input
            name="modelo"
            label="Modelo"
            placeholder="Scania R450"
            value={formData.modelo}
            onChange={handleChange}
            required
          />
          <Input
            name="ano"
            label="Ano"
            type="number"
            placeholder="2023"
            value={formData.ano}
            onChange={handleChange}
          />
          <Input
            name="km_atual"
            label="Quilometragem Atual (km)"
            type="number"
            placeholder="50000"
            value={formData.km_atual}
            onChange={handleChange}
          />
          <Input
            name="capacidade_silo_ton"
            label="Capacidade do Silo (ton)"
            type="number"
            step="0.01"
            placeholder="30"
            value={formData.capacidade_silo_ton}
            onChange={handleChange}
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

export function TrucksPage({ trucks, onRefetch }) {
  const { success, error } = useToast();
  const [editingTruck, setEditingTruck] = useState(null);
  const [deletingTruck, setDeletingTruck] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('placa');
  const [showFilters, setShowFilters] = useState(false);

  const filteredAndSortedTrucks = useMemo(() => {
    let filtered = trucks.filter(truck => {
      const searchLower = searchTerm.toLowerCase();
      return (
        truck.placa?.toLowerCase().includes(searchLower) ||
        truck.modelo?.toLowerCase().includes(searchLower) ||
        truck.ano?.toString().includes(searchLower)
      );
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'placa':
          return (a.placa || '').localeCompare(b.placa || '');
        case 'modelo':
          return (a.modelo || '').localeCompare(b.modelo || '');
        case 'ano':
          return (b.ano || 0) - (a.ano || 0);
        case 'km':
          return (b.km_atual || 0) - (a.km_atual || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [trucks, searchTerm, sortBy]);

  const handleDelete = async () => {
    if (!deletingTruck) return;

    setDeleteLoading(true);
    try {
      await trucksService.delete(deletingTruck.id);
      success('Sucesso!', 'Caminhão excluído com sucesso');
      onRefetch?.();
      setDeletingTruck(null);
    } catch (err) {
      console.error('Failed to delete truck:', err);
      error('Erro', err.message || 'Falha ao excluir caminhão');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Cadastrar Novo Caminhão</CardTitle>
        </CardHeader>
        <CardContent>
          <TruckForm onSuccess={onRefetch} />
        </CardContent>
      </Card>

      <div>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Frota ({filteredAndSortedTrucks.length} de {trucks.length})
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
                  placeholder="Buscar por placa, modelo ou ano..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Select
                  label="Ordenar por"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="placa">Placa</option>
                  <option value="modelo">Modelo</option>
                  <option value="ano">Ano (mais novo)</option>
                  <option value="km">Quilometragem (maior)</option>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {trucks.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <EmptyState
                icon={Truck}
                title="Nenhum caminhão cadastrado"
                description="Comece adicionando seu primeiro caminhão à frota"
              />
            </CardContent>
          </Card>
        ) : filteredAndSortedTrucks.length === 0 ? (
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredAndSortedTrucks.map(truck => (
              <Card key={truck.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                        {truck.placa}
                      </h3>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {truck.modelo}
                      </p>
                    </div>
                    {truck.ano && (
                      <Badge variant="default">{truck.ano}</Badge>
                    )}
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Gauge className="h-4 w-4 text-zinc-400" />
                      <span className="font-mono font-medium text-zinc-900 dark:text-zinc-50">
                        {formatNumber(truck.km_atual || 0, 0)} km
                      </span>
                    </div>

                    {truck.capacidade_silo_ton && (
                      <div className="flex items-center gap-2 text-sm">
                        <Truck className="h-4 w-4 text-zinc-400" />
                        <span className="text-zinc-600 dark:text-zinc-400">
                          Capacidade: {formatNumber(truck.capacidade_silo_ton)} tons
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingTruck(truck)}
                      className="flex-1"
                    >
                      <Edit2 className="mr-2 h-4 w-4" />
                      Editar
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setDeletingTruck(truck)}
                      className="flex-1"
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

      {editingTruck && (
        <EditTruckModal
          truck={editingTruck}
          isOpen={!!editingTruck}
          onClose={() => setEditingTruck(null)}
          onSuccess={onRefetch}
        />
      )}

      <ConfirmDialog
        isOpen={!!deletingTruck}
        onClose={() => setDeletingTruck(null)}
        onConfirm={handleDelete}
        title="Excluir Caminhão"
        description={`Tem certeza que deseja excluir o caminhão ${deletingTruck?.placa}? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        isLoading={deleteLoading}
      />
    </div>
  );
}
