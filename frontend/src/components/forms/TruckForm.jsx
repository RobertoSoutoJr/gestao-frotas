import { useState, useRef } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Camera } from 'lucide-react';
import { trucksService } from '../../services/trucks';
import { useToast } from '../../hooks/useToast';

export function TruckForm({ onSuccess }) {
  const [loading, setLoading] = useState(false);
  const { success, error: showError } = useToast();
  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    placa: '',
    modelo: '',
    ano: '',
    km_atual: '',
    capacidade_silo_ton: '',
    data_licenciamento: '',
    km_proxima_revisao: ''
  });

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showError('Erro', 'A imagem deve ter no máximo 5MB');
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
        capacidade_silo_ton: formData.capacidade_silo_ton ? Number(formData.capacidade_silo_ton) : undefined,
        data_licenciamento: formData.data_licenciamento || undefined,
        km_proxima_revisao: formData.km_proxima_revisao ? Number(formData.km_proxima_revisao) : undefined
      };

      const res = await trucksService.create(data);

      // Upload photo if selected
      if (fotoFile && res.data?.id) {
        try {
          await trucksService.uploadFoto(res.data.id, fotoFile);
        } catch (err) {
          console.error('Photo upload failed:', err);
          // Don't fail the whole creation for photo upload failure
        }
      }

      success('Sucesso!', 'Caminhão cadastrado com sucesso');
      setFormData({ placa: '', modelo: '', ano: '', km_atual: '', capacidade_silo_ton: '', data_licenciamento: '', km_proxima_revisao: '' });
      setFotoFile(null);
      setFotoPreview(null);
      onSuccess?.();
    } catch (err) {
      console.error('Failed to create truck:', err);
      showError('Erro', err.message || 'Falha ao cadastrar caminhão');
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
      {/* Photo Upload */}
      <div className="flex justify-center">
        <div
          onClick={() => fileInputRef.current?.click()}
          className="group relative flex h-32 w-32 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50 transition-colors hover:border-blue-400 hover:bg-blue-50 dark:border-zinc-600 dark:bg-zinc-800 dark:hover:border-blue-500 dark:hover:bg-zinc-700"
        >
          {fotoPreview ? (
            <img src={fotoPreview} alt="Preview" className="h-full w-full object-cover" />
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
        />
        <Input
          name="data_licenciamento"
          label="Validade Licenciamento"
          type="date"
          value={formData.data_licenciamento}
          onChange={handleChange}
        />
        <Input
          name="km_proxima_revisao"
          label="KM Proxima Revisao"
          type="number"
          placeholder="100000"
          value={formData.km_proxima_revisao}
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
