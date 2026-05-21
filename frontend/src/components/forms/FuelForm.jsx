import { useState, useRef } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { fuelService } from '../../services/fuel';
import { documentsService } from '../../services/documents';
import { useToast } from '../../hooks/useToast';
import { Camera, CheckCircle, AlertTriangle, Loader2, FileText } from 'lucide-react';

export function FuelForm({ trucks, drivers, postos = [], onSuccess, preselectedTruckId }) {
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);
  const fileInputRef = useRef(null);
  const { success, error: showError } = useToast();
  const [formData, setFormData] = useState({
    caminhao_id: preselectedTruckId ? String(preselectedTruckId) : '',
    motorista_id: '',
    km_registro: '',
    litros: '',
    valor_total: '',
    posto_id: ''
  });

  const pricePerLiter = formData.litros && formData.valor_total
    ? (Number(formData.valor_total) / Number(formData.litros)).toFixed(3)
    : null;

  const handleScanNfce = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanning(true);
    setOcrResult(null);

    try {
      const response = await documentsService.extractFuelReceipt(file);
      const data = response.data;

      if (data.extracted) {
        const ext = data.extracted;

        // Auto-fill form
        setFormData(prev => ({
          ...prev,
          litros: ext.litros ? String(ext.litros) : prev.litros,
          valor_total: ext.valor_total ? String(ext.valor_total) : prev.valor_total,
          posto_id: matchPostoByCnpj(ext.posto_cnpj) || prev.posto_id,
          caminhao_id: matchTruckByPlaca(ext.placa_veiculo) || prev.caminhao_id,
        }));

        setOcrResult({
          confidence: data.confidence,
          method: data.method,
          documento_id: data.documento_id,
        });

        const conf = Math.round(data.confidence * 100);
        if (data.confidence >= 0.7) {
          success('NFC-e lida!', `Dados extraídos com ${conf}% de confiança`);
        } else {
          showError('Leitura parcial', `Apenas ${conf}% dos dados foram extraídos. Revise os valores.`);
        }
      } else {
        showError('Falha na leitura', data.error || 'Não foi possível extrair dados do cupom');
      }
    } catch (err) {
      showError('Erro', err.message || 'Falha ao processar imagem');
    } finally {
      setScanning(false);
      // Reset file input so same file can be selected again
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const matchPostoByCnpj = (cnpj) => {
    if (!cnpj) return '';
    const clean = cnpj.replace(/[^\d]/g, '');
    const p = postos.find(p => p.cnpj?.replace(/[^\d]/g, '') === clean);
    return p ? String(p.id) : '';
  };

  const matchTruckByPlaca = (placa) => {
    if (!placa) return '';
    const clean = placa.replace(/[-\s]/g, '').toUpperCase();
    const t = trucks.find(t => t.placa?.replace(/[-\s]/g, '').toUpperCase() === clean);
    return t ? String(t.id) : '';
  };

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
        posto_id: formData.posto_id ? Number(formData.posto_id) : null,
        documento_id: ocrResult?.documento_id || undefined,
      };

      await fuelService.create(data);
      success('Sucesso!', 'Abastecimento registrado com sucesso');
      setFormData({
        caminhao_id: '',
        motorista_id: '',
        km_registro: '',
        litros: '',
        valor_total: '',
        posto_id: ''
      });
      setOcrResult(null);
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

  const confColor = ocrResult
    ? ocrResult.confidence >= 0.7 ? '#10B981'
      : ocrResult.confidence >= 0.4 ? '#F59E0B'
      : '#EF4444'
    : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* NFC-e Scanner */}
      <div
        className="relative rounded-xl border-2 border-dashed border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 p-4 cursor-pointer hover:bg-[var(--color-accent)]/10 transition-colors"
        onClick={() => !scanning && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleScanNfce}
        />
        <div className="flex items-center gap-3">
          {scanning ? (
            <Loader2 className="h-6 w-6 text-[var(--color-accent)] animate-spin" />
          ) : (
            <Camera className="h-6 w-6 text-[var(--color-accent)]" />
          )}
          <div className="flex-1">
            <p className="font-semibold text-sm text-[var(--color-accent)]">
              {scanning ? 'Lendo cupom fiscal...' : 'Ler NFC-e automaticamente'}
            </p>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              {scanning ? 'Aguarde enquanto a IA analisa a imagem' : 'Tire uma foto ou selecione a imagem do cupom fiscal'}
            </p>
          </div>
          {!scanning && <FileText className="h-5 w-5 text-[var(--color-text-secondary)]" />}
        </div>
      </div>

      {/* OCR Result Badge */}
      {ocrResult && confColor && (
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium"
          style={{ backgroundColor: `${confColor}10`, borderColor: `${confColor}30`, color: confColor }}
        >
          {ocrResult.confidence >= 0.7 ? (
            <CheckCircle className="h-4 w-4 flex-shrink-0" />
          ) : (
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          )}
          <span>
            {ocrResult.confidence >= 0.7
              ? 'Dados extraídos com alta confiança'
              : ocrResult.confidence >= 0.4
                ? 'Dados parciais — revise os valores'
                : 'Poucos dados extraídos — preencha manualmente'}
            {' '}({ocrResult.method === 'qr+vision' ? 'QR + OCR' : ocrResult.method === 'qr' ? 'QR Code' : 'OCR'}, {Math.round(ocrResult.confidence * 100)}%)
          </span>
        </div>
      )}

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

        <Select
          name="posto_id"
          label="Posto"
          value={formData.posto_id}
          onChange={handleChange}
        >
          <option value="">Nenhum posto</option>
          {postos.map(p => (
            <option key={p.id} value={p.id}>{p.nome}</option>
          ))}
        </Select>
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
