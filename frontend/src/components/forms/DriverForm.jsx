import { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Truck } from 'lucide-react';
import { driversService } from '../../services/drivers';
import { useToast } from '../../hooks/useToast';
import { maskCPF, maskPhone } from '../../lib/utils';

export function DriverForm({ trucks = [], onSuccess }) {
  const [loading, setLoading] = useState(false);
  const { success, error: showError } = useToast();
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    telefone: '',
    numero_cnh: '',
    validade_cnh: ''
  });
  const [selectedTrucks, setSelectedTrucks] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await driversService.create({
        ...formData,
        caminhao_ids: selectedTrucks,
      });
      success('Sucesso!', 'Motorista cadastrado com sucesso');
      setFormData({ nome: '', cpf: '', telefone: '', numero_cnh: '', validade_cnh: '' });
      setSelectedTrucks([]);
      onSuccess?.();
    } catch (err) {
      if (!err.isPlanLimit) showError('Erro', err.message || 'Falha ao cadastrar motorista');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === 'cpf') value = maskCPF(value);
    if (name === 'telefone') value = maskPhone(value);
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleTruck = (truckId) => {
    setSelectedTrucks(prev =>
      prev.includes(truckId)
        ? prev.filter(id => id !== truckId)
        : [...prev, truckId]
    );
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

      {/* Multi-select de caminhões */}
      {trucks.length > 0 && (
        <div>
          <label className="mb-2 flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-secondary)]">
            <Truck className="h-4 w-4" />
            Caminhões vinculados
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-40 overflow-y-auto rounded-lg border border-[var(--color-border)] p-2">
            {trucks.map(t => (
              <label
                key={t.id}
                className={`flex items-center gap-2 text-sm cursor-pointer rounded-md px-3 py-2 transition-colors ${
                  selectedTrucks.includes(t.id)
                    ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
                    : 'hover:bg-[var(--color-surface)] text-[var(--color-text)]'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedTrucks.includes(t.id)}
                  onChange={() => toggleTruck(t.id)}
                  className="rounded accent-[var(--color-accent)]"
                />
                <span className="font-medium">{t.placa}</span>
                <span className="text-xs text-[var(--color-text-secondary)]">— {t.modelo}</span>
              </label>
            ))}
          </div>
          {selectedTrucks.length > 0 && (
            <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
              {selectedTrucks.length} caminhão(ões) selecionado(s)
            </p>
          )}
        </div>
      )}

      <Button type="submit" variant="success" loading={loading} className="w-full">
        Cadastrar Motorista
      </Button>
    </form>
  );
}
