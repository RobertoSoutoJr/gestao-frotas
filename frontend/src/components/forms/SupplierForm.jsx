import { useState, lazy, Suspense } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { suppliersService } from '../../services/suppliers';
import { useToast } from '../../hooks/useToast';

const LocationPicker = lazy(() => import('../ui/LocationPicker').then(m => ({ default: m.LocationPicker })));

const ESTADOS_BR = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA',
  'PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
];

export function SupplierForm({ onSuccess }) {
  const { success, error: showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '', cpf_cnpj: '', telefone: '', email: '',
    endereco: '', cidade: '', estado: '', cep: '', observacoes: '',
    latitude: null, longitude: null
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await suppliersService.create(formData);
      setFormData({ nome: '', cpf_cnpj: '', telefone: '', email: '', endereco: '', cidade: '', estado: '', cep: '', observacoes: '', latitude: null, longitude: null });
      onSuccess?.();
    } catch (err) {
      showError('Erro', err.message || 'Falha ao cadastrar fornecedor');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input name="nome" label="Nome / Razão Social" placeholder="Fazenda Vinicius" value={formData.nome} onChange={handleChange} required className="md:col-span-2" />
        <Input name="cpf_cnpj" label="CPF/CNPJ" placeholder="000.000.000-00" value={formData.cpf_cnpj} onChange={handleChange} />
        <Input name="telefone" label="Telefone" placeholder="(11) 98888-8888" value={formData.telefone} onChange={handleChange} />
        <Input name="email" label="E-mail" type="email" placeholder="email@exemplo.com" value={formData.email} onChange={handleChange} />
        <Input name="cep" label="CEP" placeholder="00000-000" value={formData.cep} onChange={handleChange} />
        <Input name="endereco" label="Endereço (Local de Carregamento)" placeholder="Rodovia GO-060, Km 15" value={formData.endereco} onChange={handleChange} className="md:col-span-2" />
        <Input name="cidade" label="Cidade" placeholder="Jataí" value={formData.cidade} onChange={handleChange} />
        <Select name="estado" label="Estado (UF)" value={formData.estado} onChange={handleChange}>
          <option value="">Selecione</option>
          {ESTADOS_BR.map(uf => <option key={uf} value={uf}>{uf}</option>)}
        </Select>
        <Input name="observacoes" label="Observações" placeholder="Informações adicionais..." value={formData.observacoes} onChange={handleChange} className="md:col-span-2" />
      </div>

      <Suspense fallback={<div className="h-[280px] rounded-xl bg-[var(--color-bg-elevated)] animate-pulse" />}>
        <LocationPicker
          label="Localização do carregamento (clique no mapa ou use GPS)"
          latitude={formData.latitude}
          longitude={formData.longitude}
          onChange={({ latitude, longitude }) => setFormData(prev => ({ ...prev, latitude, longitude }))}
        />
      </Suspense>

      <Button type="submit" variant="success" loading={loading} className="w-full">
        Cadastrar Fornecedor
      </Button>
    </form>
  );
}
