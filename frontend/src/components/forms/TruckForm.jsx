import { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { trucksService } from '../../services/trucks';

export function TruckForm({ onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    placa: '',
    modelo: '',
    ano: '',
    km_atual: '',
    capacidade_silo_ton: ''
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

      await trucksService.create(data);
      setFormData({ placa: '', modelo: '', ano: '', km_atual: '', capacidade_silo_ton: '' });
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create truck:', error);
      alert(error.message || 'Falha ao cadastrar caminhão');
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
      <Button type="submit" variant="primary" loading={loading} className="w-full">
        Cadastrar Caminhão
      </Button>
    </form>
  );
}
