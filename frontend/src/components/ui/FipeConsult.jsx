import { useState, useEffect } from 'react';
import { Select } from './Select';
import { Button } from './Button';
import { Badge } from './Badge';
import { Loader2, Search, DollarSign, Calendar, Tag } from 'lucide-react';
import { fipeService } from '../../services/fipe';
import { formatCurrency } from '../../lib/utils';

/**
 * Componente de consulta FIPE para caminhões.
 * Pode ser usado standalone ou embutido em um modal/form.
 */
export function FipeConsult({ onPriceFound }) {
  const [marcas, setMarcas] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [anos, setAnos] = useState([]);
  const [resultado, setResultado] = useState(null);

  const [marcaCodigo, setMarcaCodigo] = useState('');
  const [modeloCodigo, setModeloCodigo] = useState('');
  const [anoCodigo, setAnoCodigo] = useState('');

  const [loadingMarcas, setLoadingMarcas] = useState(false);
  const [loadingModelos, setLoadingModelos] = useState(false);
  const [loadingAnos, setLoadingAnos] = useState(false);
  const [loadingPreco, setLoadingPreco] = useState(false);
  const [error, setError] = useState(null);

  // Carregar marcas ao montar
  useEffect(() => {
    setLoadingMarcas(true);
    fipeService.getMarcas()
      .then(data => setMarcas(Array.isArray(data) ? data : []))
      .catch(() => setError('Falha ao carregar marcas FIPE'))
      .finally(() => setLoadingMarcas(false));
  }, []);

  // Carregar modelos quando marca muda
  useEffect(() => {
    if (!marcaCodigo) { setModelos([]); setModeloCodigo(''); return; }
    setLoadingModelos(true);
    setModelos([]);
    setModeloCodigo('');
    setAnos([]);
    setAnoCodigo('');
    setResultado(null);

    fipeService.getModelos(marcaCodigo)
      .then(data => setModelos(Array.isArray(data) ? data : []))
      .catch(() => setError('Falha ao carregar modelos'))
      .finally(() => setLoadingModelos(false));
  }, [marcaCodigo]);

  // Carregar anos quando modelo muda
  useEffect(() => {
    if (!marcaCodigo || !modeloCodigo) { setAnos([]); setAnoCodigo(''); return; }
    setLoadingAnos(true);
    setAnos([]);
    setAnoCodigo('');
    setResultado(null);

    fipeService.getAnos(marcaCodigo, modeloCodigo)
      .then(data => setAnos(Array.isArray(data) ? data : []))
      .catch(() => setError('Falha ao carregar anos'))
      .finally(() => setLoadingAnos(false));
  }, [marcaCodigo, modeloCodigo]);

  const handleConsultar = async () => {
    if (!marcaCodigo || !modeloCodigo || !anoCodigo) return;
    setLoadingPreco(true);
    setError(null);

    try {
      const data = await fipeService.getPreco(marcaCodigo, modeloCodigo, anoCodigo);
      setResultado(data);
      onPriceFound?.(data);
    } catch {
      setError('Falha ao consultar preço FIPE');
    } finally {
      setLoadingPreco(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10">
          <DollarSign className="h-4 w-4 text-green-500" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--color-text)]">Consulta Tabela FIPE</p>
          <p className="text-xs text-[var(--color-text-secondary)]">Valor de referência do veículo</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Select
          label="Marca"
          value={marcaCodigo}
          onChange={e => setMarcaCodigo(e.target.value)}
          disabled={loadingMarcas}
        >
          <option value="">{loadingMarcas ? 'Carregando...' : 'Selecione'}</option>
          {marcas.map(m => (
            <option key={m.codigo} value={m.codigo}>{m.nome}</option>
          ))}
        </Select>

        <Select
          label="Modelo"
          value={modeloCodigo}
          onChange={e => setModeloCodigo(e.target.value)}
          disabled={!marcaCodigo || loadingModelos}
        >
          <option value="">{loadingModelos ? 'Carregando...' : 'Selecione'}</option>
          {modelos.map(m => (
            <option key={m.codigo} value={m.codigo}>{m.nome}</option>
          ))}
        </Select>

        <Select
          label="Ano"
          value={anoCodigo}
          onChange={e => setAnoCodigo(e.target.value)}
          disabled={!modeloCodigo || loadingAnos}
        >
          <option value="">{loadingAnos ? 'Carregando...' : 'Selecione'}</option>
          {anos.map(a => (
            <option key={a.codigo} value={a.codigo}>{a.nome}</option>
          ))}
        </Select>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={handleConsultar}
        disabled={!anoCodigo || loadingPreco}
        className="w-full"
      >
        {loadingPreco ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Consultando...</>
        ) : (
          <><Search className="mr-2 h-4 w-4" /> Consultar Preço FIPE</>
        )}
      </Button>

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      {resultado && (
        <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-[var(--color-text-secondary)]">Valor FIPE</p>
            <Badge variant="success">{resultado.MesReferencia}</Badge>
          </div>
          <p className="text-2xl font-bold text-green-500">{resultado.Valor}</p>
          <div className="grid grid-cols-2 gap-2 text-xs text-[var(--color-text-secondary)]">
            <div className="flex items-center gap-1">
              <Tag className="h-3 w-3" />
              <span>{resultado.Marca} {resultado.Modelo}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>Ano: {resultado.AnoModelo}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>Código FIPE: {resultado.CodigoFipe}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>Combustível: {resultado.Combustivel}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
