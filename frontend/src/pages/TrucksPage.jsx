import { useState, useMemo, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { TruckForm } from '../components/forms/TruckForm';
import { FuelForm } from '../components/forms/FuelForm';
import { MaintenanceForm } from '../components/forms/MaintenanceForm';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Truck, Gauge, Edit2, Trash2, Search, Filter, Plus, Fuel, Wrench, Camera } from 'lucide-react';
import { formatNumber } from '../lib/utils';
import { trucksService } from '../services/trucks';
import { useToast } from '../hooks/useToast';

function EditTruckModal({ truck, isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();
  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(truck.foto_url || null);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    placa: truck.placa || '',
    modelo: truck.modelo || '',
    ano: truck.ano || '',
    km_atual: truck.km_atual || '',
    capacidade_silo_ton: truck.capacidade_silo_ton || ''
  });

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        error('Erro', 'A imagem deve ter no máximo 5MB');
        return;
      }
      setFotoFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setFotoPreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

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

      // Upload photo if changed
      if (fotoFile) {
        try {
          await trucksService.uploadFoto(truck.id, fotoFile);
        } catch (err) {
          console.error('Photo upload failed:', err);
        }
      }

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
        {/* Photo Upload */}
        <div className="flex justify-center">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="group relative flex h-32 w-32 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50 transition-colors hover:border-blue-400 hover:bg-blue-50 dark:border-zinc-600 dark:bg-zinc-800 dark:hover:border-blue-500 dark:hover:bg-zinc-700"
          >
            {fotoPreview ? (
              <>
                <img src={fotoPreview} alt="Foto" className="h-full w-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <Camera className="h-6 w-6 text-white" />
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-1 text-zinc-400 group-hover:text-blue-500">
                <Camera className="h-8 w-8" />
                <span className="text-xs">Adicionar foto</span>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input name="placa" label="Placa" placeholder="ABC-1234" value={formData.placa} onChange={handleChange} required />
          <Input name="modelo" label="Modelo" placeholder="Scania R450" value={formData.modelo} onChange={handleChange} required />
          <Input name="ano" label="Ano" type="number" placeholder="2023" value={formData.ano} onChange={handleChange} />
          <Input name="km_atual" label="Quilometragem Atual (km)" type="number" placeholder="50000" value={formData.km_atual} onChange={handleChange} />
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
          <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" loading={loading} className="flex-1">
            Salvar Alterações
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function TrucksPage({ trucks, drivers, onRefetch }) {
  const { success, error } = useToast();
  const [editingTruck, setEditingTruck] = useState(null);
  const [deletingTruck, setDeletingTruck] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('placa');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [fuelingTruck, setFuelingTruck] = useState(null);
  const [maintainingTruck, setMaintainingTruck] = useState(null);

  const filteredAndSortedTrucks = useMemo(() => {
    let filtered = trucks.filter(truck => {
      const searchLower = searchTerm.toLowerCase();
      return (
        truck.placa?.toLowerCase().includes(searchLower) ||
        truck.modelo?.toLowerCase().includes(searchLower) ||
        truck.ano?.toString().includes(searchLower)
      );
    });

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

  const handleFuelSuccess = () => {
    onRefetch?.();
    setFuelingTruck(null);
  };

  const handleMaintenanceSuccess = () => {
    onRefetch?.();
    setMaintainingTruck(null);
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
            Frota ({filteredAndSortedTrucks.length} de {trucks.length})
          </h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="mr-2 h-4 w-4" />
              {showFilters ? 'Ocultar Filtros' : 'Filtros'}
            </Button>
            <Button variant="primary" size="sm" onClick={() => setShowCreateForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Cadastrar Caminhão
            </Button>
          </div>
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
              <div className="mt-4 flex justify-center">
                <Button variant="primary" onClick={() => setShowCreateForm(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Cadastrar Caminhão
                </Button>
              </div>
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
              <Card key={truck.id} className="hover:shadow-md transition-shadow overflow-hidden">
                {/* Truck Photo */}
                {truck.foto_url ? (
                  <div className="h-40 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                    <img src={truck.foto_url} alt={truck.placa} className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="flex h-28 w-full items-center justify-center bg-zinc-100 dark:bg-zinc-800/50">
                    <Truck className="h-12 w-12 text-zinc-300 dark:text-zinc-600" />
                  </div>
                )}
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-[var(--color-text)]">
                        {truck.placa}
                      </h3>
                      <p className="text-sm text-[var(--color-text-secondary)]">
                        {truck.modelo}
                      </p>
                    </div>
                    {truck.ano && (
                      <Badge variant="default">{truck.ano}</Badge>
                    )}
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Gauge className="h-4 w-4 text-[var(--color-text-secondary)]" />
                      <span className="font-medium text-[var(--color-text)]">
                        {formatNumber(truck.km_atual || 0, 0)} km
                      </span>
                    </div>

                    {truck.capacidade_silo_ton && (
                      <div className="flex items-center gap-2 text-sm">
                        <Truck className="h-4 w-4 text-[var(--color-text-secondary)]" />
                        <span className="text-[var(--color-text-secondary)]">
                          Capacidade: {formatNumber(truck.capacidade_silo_ton)} tons
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action buttons: Fuel & Maintenance */}
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFuelingTruck(truck)}
                      className="text-amber-500 border-amber-500/30 hover:bg-amber-500/10"
                    >
                      <Fuel className="mr-1.5 h-4 w-4" />
                      Abastecer
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setMaintainingTruck(truck)}
                      className="text-purple-400 border-purple-400/30 hover:bg-purple-400/10"
                    >
                      <Wrench className="mr-1.5 h-4 w-4" />
                      Manutenção
                    </Button>
                  </div>

                  {/* Edit & Delete */}
                  <div className="mt-2 flex gap-2">
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

      {/* Modal: Cadastrar Caminhão */}
      <Modal isOpen={showCreateForm} onClose={() => setShowCreateForm(false)} title="Cadastrar Novo Caminhão">
        <TruckForm onSuccess={handleCreateSuccess} />
      </Modal>

      {/* Modal: Abastecer */}
      {fuelingTruck && (
        <Modal isOpen={!!fuelingTruck} onClose={() => setFuelingTruck(null)} title={`Abastecer — ${fuelingTruck.placa}`}>
          <FuelForm
            trucks={[fuelingTruck]}
            drivers={drivers || []}
            onSuccess={handleFuelSuccess}
            preselectedTruckId={fuelingTruck.id}
          />
        </Modal>
      )}

      {/* Modal: Manutenção */}
      {maintainingTruck && (
        <Modal isOpen={!!maintainingTruck} onClose={() => setMaintainingTruck(null)} title={`Manutenção — ${maintainingTruck.placa}`}>
          <MaintenanceForm
            trucks={[maintainingTruck]}
            onSuccess={handleMaintenanceSuccess}
            preselectedTruckId={maintainingTruck.id}
          />
        </Modal>
      )}

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
