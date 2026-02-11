import { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { maintenanceService } from '../services/maintenance';

const MAINTENANCE_TYPES = [
  'Preventiva',
  'Corretiva',
  'Pneus',
  'Motor',
  'Freios',
  'Suspensão',
  'Elétrica',
  'Outros'
];

export function MaintenanceForm({ trucks, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    caminhao_id: '',
    descricao: '',
    tipo_manutencao: 'Preventiva',
    valor_total: '',
    km_manutencao: '',
    data_manutencao: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        caminhao_id: Number(formData.caminhao_id),
        descricao: formData.descricao,
        tipo_manutencao: formData.tipo_manutencao,
        valor_total: Number(formData.valor_total),
        km_manutencao: Number(formData.km_manutencao),
        data_manutencao: formData.data_manutencao
      };

      await maintenanceService.create(data);
      setFormData({
        caminhao_id: '',
        descricao: '',
        tipo_manutencao: 'Preventiva',
        valor_total: '',
        km_manutencao: '',
        data_manutencao: ''
      });
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create maintenance record:', error);
      alert(error.message || 'Failed to create maintenance record');
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Select
          name="caminhao_id"
          label="Truck"
          value={formData.caminhao_id}
          onChange={handleChange}
          required
        >
          <option value="">Select a truck</option>
          {trucks.map(truck => (
            <option key={truck.id} value={truck.id}>
              {truck.placa} - {truck.modelo}
            </option>
          ))}
        </Select>

        <Select
          name="tipo_manutencao"
          label="Maintenance Type"
          value={formData.tipo_manutencao}
          onChange={handleChange}
          required
        >
          {MAINTENANCE_TYPES.map(type => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </Select>

        <Input
          name="descricao"
          label="Description"
          placeholder="What was done?"
          value={formData.descricao}
          onChange={handleChange}
          required
          className="md:col-span-2"
        />

        <Input
          name="valor_total"
          label="Total Amount (R$)"
          type="number"
          step="0.01"
          placeholder="500.00"
          value={formData.valor_total}
          onChange={handleChange}
          required
        />

        <Input
          name="km_manutencao"
          label="Mileage (km)"
          type="number"
          placeholder="50000"
          value={formData.km_manutencao}
          onChange={handleChange}
          required
        />

        <Input
          name="data_manutencao"
          label="Date"
          type="date"
          value={formData.data_manutencao}
          onChange={handleChange}
          required
          className="md:col-span-2"
        />
      </div>

      <Button type="submit" variant="danger" loading={loading} className="w-full">
        Register Maintenance
      </Button>
    </form>
  );
}
