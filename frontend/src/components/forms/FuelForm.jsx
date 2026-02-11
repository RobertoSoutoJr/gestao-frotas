import { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { fuelService } from '../services/fuel';

export function FuelForm({ trucks, drivers, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    caminhao_id: '',
    motorista_id: '',
    km_registro: '',
    litros: '',
    valor_total: '',
    posto: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        caminhao_id: Number(formData.caminhao_id),
        motorista_id: Number(formData.motorista_id),
        km_registro: Number(formData.km_registro),
        litros: Number(formData.litros),
        valor_total: Number(formData.valor_total),
        posto: formData.posto || undefined
      };

      await fuelService.create(data);
      setFormData({
        caminhao_id: '',
        motorista_id: '',
        km_registro: '',
        litros: '',
        valor_total: '',
        posto: ''
      });
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create fuel record:', error);
      alert(error.message || 'Failed to create fuel record');
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
          name="motorista_id"
          label="Driver"
          value={formData.motorista_id}
          onChange={handleChange}
          required
        >
          <option value="">Select a driver</option>
          {drivers.map(driver => (
            <option key={driver.id} value={driver.id}>
              {driver.nome}
            </option>
          ))}
        </Select>

        <Input
          name="km_registro"
          label="Mileage (km)"
          type="number"
          placeholder="50000"
          value={formData.km_registro}
          onChange={handleChange}
          required
        />

        <Input
          name="litros"
          label="Liters"
          type="number"
          step="0.01"
          placeholder="200"
          value={formData.litros}
          onChange={handleChange}
          required
        />

        <Input
          name="valor_total"
          label="Total Amount (R$)"
          type="number"
          step="0.01"
          placeholder="1200.00"
          value={formData.valor_total}
          onChange={handleChange}
          required
        />

        <Input
          name="posto"
          label="Gas Station"
          placeholder="Shell"
          value={formData.posto}
          onChange={handleChange}
        />
      </div>

      <Button type="submit" variant="primary" loading={loading} className="w-full">
        Register Fuel Record
      </Button>
    </form>
  );
}
