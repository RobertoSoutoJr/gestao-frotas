import { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { fuelService } from '../../services/fuel';
import { useToast } from '../../hooks/useToast';

export function FuelForm({ trucks, drivers, onSuccess, preselectedTruckId }) {
  const [loading, setLoading] = useState(false);
  const { success, error: showError } = useToast();
  const [formData, setFormData] = useState({
    caminhao_id: preselectedTruckId ? String(preselectedTruckId) : '',
    motorista_id: '',
    km_registro: '',
    litros: '',
    valor_total: '',
    posto: ''
  });

  const pricePerLiter = formData.litros && formData.valor_total
    ? (Number(formData.valor_total) / Number(formData.litros)).toFixed(3)
    : null;

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
      success('Sucesso!', 'Abastecimento registrado com sucesso');
      setFormData({
        caminhao_id: '',
        motorista_id: '',
        km_registro: '',
        litros: '',
        valor_total: '',
        posto: ''
      });
      onSuccess?.();
    } catch (err) {
      showError('Erro', err.message || 'Falha ao registrar abastecimento');
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
          label="Caminhão"
          value={formData.caminhao_id}
          onChange={handleChange}
          required
          disabled={!!preselectedTruckId}
        >
          <option value="">Selecione um caminhão</option>
          {trucks.map(truck => (
            <option key={truck.id} value={truck.id}>
              {truck.placa} - {truck.modelo}
            </option>
          ))}
        </Select>

        <Select
          name="motorista_id"
          label="Motorista"
          value={formData.motorista_id}
          onChange={handleChange}
          required
        >
          <option value="">Selecione um motorista</option>
          {drivers.map(driver => (
            <option key={driver.id} value={driver.id}>
              {driver.nome}
            </option>
          ))}
        </Select>

        <Input
          name="km_registro"
          label="Quilometragem (km)"
          type="number"
          placeholder="50000"
          value={formData.km_registro}
          onChange={handleChange}
          required
        />

        <Input
          name="litros"
          label="Litros"
          type="number"
          step="0.01"
          placeholder="200"
          value={formData.litros}
          onChange={handleChange}
          required
        />

        <Input
          name="valor_total"
          label="Valor Total (R$)"
          type="number"
          step="0.01"
          placeholder="1200.00"
          value={formData.valor_total}
          onChange={handleChange}
          required
        />

        <Input
          name="posto"
          label="Posto"
          placeholder="Shell"
          value={formData.posto}
          onChange={handleChange}
        />
      </div>

      {pricePerLiter && (
        <div className="rounded-xl bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-[var(--color-text-secondary)]">Preço por litro calculado</p>
            <p className="text-xl font-bold text-[var(--color-accent)] tabular-nums">R$ {pricePerLiter}</p>
          </div>
          <div className="text-right text-xs text-[var(--color-text-secondary)]">
            {formatNumber(formData.litros)} L × R$ {pricePerLiter} = R$ {Number(formData.valor_total).toFixed(2)}
          </div>
        </div>
      )}

      <Button type="submit" variant="primary" loading={loading} className="w-full">
        Registrar Abastecimento
      </Button>
    </form>
  );
}

function formatNumber(val) {
  const n = Number(val);
  return isNaN(n) ? '0' : n.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
}
