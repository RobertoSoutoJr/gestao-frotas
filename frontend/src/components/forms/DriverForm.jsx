import { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { driversService } from '../../services/drivers';
import { useToast } from '../../hooks/useToast';

export function DriverForm({ onSuccess }) {
  const [loading, setLoading] = useState(false);
  const { success, error: showError } = useToast();
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    telefone: '',
    numero_cnh: '',
    validade_cnh: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await driversService.create(formData);
      success('Sucesso!', 'Motorista cadastrado com sucesso');
      setFormData({ nome: '', cpf: '', telefone: '', numero_cnh: '', validade_cnh: '' });
      onSuccess?.();
    } catch (err) {
      showError('Erro', err.message || 'Falha ao cadastrar motorista');
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
        <Input
          name="numero_cnh"
          label="Numero CNH"
          placeholder="00000000000"
          value={formData.numero_cnh}
          onChange={handleChange}
        />
        <Input
          name="validade_cnh"
          label="Validade CNH"
          type="date"
          value={formData.validade_cnh}
          onChange={handleChange}
        />
      </div>
      <Button type="submit" variant="success" loading={loading} className="w-full">
        Cadastrar Motorista
      </Button>
    </form>
  );
}
