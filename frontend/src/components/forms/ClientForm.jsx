import { useState, useCallback, lazy, Suspense } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { clientsService } from '../../services/clients';
import { useToast } from '../../hooks/useToast';
import { useCepLookup } from '../../hooks/useCepLookup';
import { maskCPFCNPJ, maskPhone, maskCEP } from '../../lib/utils';

const LocationPicker = lazy(() => import('../ui/LocationPicker').then(m => ({ default: m.LocationPicker })));

const ESTADOS_BR = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA',
  'PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
];

export function ClientForm({ onSuccess }) {
  const { success, error: showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formData, setFormData] = useState({
    nome: '', cpf_cnpj: '', telefone: '', email: '',
    endereco: '', cidade: '', estado: '', cep: '', observacoes: '',
    latitude: null, longitude: null
  });

  const validate = () => {
    const errors = {};
    if (!formData.nome.trim()) errors.nome = 'Nome é obrigatório';
    if (!formData.cidade.trim()) errors.cidade = 'Cidade é obrigatória';
    if (!formData.estado) errors.estado = 'Estado é obrigatório';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await clientsService.create(formData);
      success('Sucesso!', 'Cliente cadastrado com sucesso');
      setFormData({ nome: '', cpf_cnpj: '', telefone: '', email: '', endereco: '', cidade: '', estado: '', cep: '', observacoes: '', latitude: null, longitude: null });
      setFieldErrors({});
      onSuccess?.();
    } catch (err) {
      showError('Erro', err.message || 'Falha ao cadastrar cliente');
    } finally {
      setLoading(false);
    }
  };

  const onCepResult = useCallback((addr) => {
    setFormData(prev => ({ ...prev, ...addr }));
  }, []);
  const { lookupCep, loading: cepLoading, error: cepError } = useCepLookup(onCepResult);

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === 'cpf_cnpj') value = maskCPFCNPJ(value);
    if (name === 'telefone') value = maskPhone(value);
    if (name === 'cep') value = maskCEP(value);
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: undefined }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input name="nome" label="Nome / Razão Social" placeholder="Fazenda São João" value={formData.nome} onChange={handleChange} error={fieldErrors.nome} required className="md:col-span-2" />
        <Input name="cpf_cnpj" label="CPF/CNPJ" placeholder="000.000.000-00" value={formData.cpf_cnpj} onChange={handleChange} />
        <Input name="telefone" label="Telefone" placeholder="(11) 98888-8888" value={formData.telefone} onChange={handleChange} />
        <Input name="email" label="E-mail" type="email" placeholder="email@exemplo.com" value={formData.email} onChange={handleChange} />
        <div>
          <Input name="cep" label={cepLoading ? "CEP (buscando...)" : "CEP"} placeholder="00000-000" value={formData.cep} onChange={handleChange} onBlur={(e) => lookupCep(e.target.value)} />
          {cepError && <p className="mt-1 text-xs text-amber-500">{cepError}</p>}
        </div>
        <Input name="endereco" label="Endereço" placeholder="Rodovia BR-153, Km 42" value={formData.endereco} onChange={handleChange} className="md:col-span-2" />
        <Input name="cidade" label="Cidade" placeholder="Goiânia" value={formData.cidade} onChange={handleChange} error={fieldErrors.cidade} />
        <Select name="estado" label="Estado (UF)" value={formData.estado} onChange={handleChange} error={fieldErrors.estado}>
          <option value="">Selecione</option>
          {ESTADOS_BR.map(uf => <option key={uf} value={uf}>{uf}</option>)}
        </Select>
        <Input name="observacoes" label="Observações" placeholder="Informações adicionais..." value={formData.observacoes} onChange={handleChange} className="md:col-span-2" />
      </div>

      <Suspense fallback={<div className="h-[280px] rounded-xl bg-[var(--color-bg-elevated)] animate-pulse" />}>
        <LocationPicker
          label="Localização (clique no mapa ou use GPS)"
          latitude={formData.latitude}
          longitude={formData.longitude}
          onChange={({ latitude, longitude }) => setFormData(prev => ({ ...prev, latitude, longitude }))}
        />
      </Suspense>

      <Button type="submit" variant="success" loading={loading} className="w-full">
        Cadastrar Cliente
      </Button>
    </form>
  );
}
