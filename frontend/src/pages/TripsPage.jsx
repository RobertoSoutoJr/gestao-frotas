import { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import {
  Route, MapPin, Truck, Users, Package, DollarSign, CheckCircle,
  Edit2, Trash2, Search, Filter, ArrowRight, Calendar, Map
} from 'lucide-react';
import { MapView } from '../components/ui/MapView';
import { DocumentGallery } from '../components/ui/DocumentGallery';
import { GPSCapture } from '../components/ui/GPSCapture';
import { TripCostsPanel } from '../components/ui/TripCostsPanel';
import { TripMapDetail } from '../components/ui/TripMapDetail';
import { formatCurrency, formatDate } from '../lib/utils';
import { tripsService } from '../services/trips';
import { clientsService } from '../services/clients';
import { suppliersService } from '../services/suppliers';
import { stockService } from '../services/stock';
import { useToast } from '../hooks/useToast';
import { Navigation, AlertTriangle, ChevronDown, ChevronUp, X } from 'lucide-react';
import { validarFreteANTT, getEixosOptions } from '../lib/anttFreight';
import { PageSkeleton } from '../components/ui/Skeleton';
import { usePagination } from '../hooks/usePagination';
import { Pagination } from '../components/ui/Pagination';

const PRODUTOS_OPCOES = ['Milho', 'Sorgo', 'Outros'];

const FORMAS_PAGAMENTO = [
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'pix', label: 'PIX' },
  { value: 'transferencia', label: 'Transferência Bancária' },
  { value: 'boleto', label: 'Boleto' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'cartao', label: 'Cartão' },
  { value: 'a_prazo', label: 'A Prazo' }
];

function TripForm({ trucks, drivers, clients, suppliers, stockItems, onSuccess }) {
  const { error: showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [produtoTipo, setProdutoTipo] = useState('');
  const [produtoCustom, setProdutoCustom] = useState('');
  const [selectedEstoqueId, setSelectedEstoqueId] = useState('');
  const [gpsOrigem, setGpsOrigem] = useState(null);
  const [formData, setFormData] = useState({
    fornecedor_id: '', cliente_id: '', caminhao_id: '', motorista_id: '',
    quantidade_sacas: '', preco_produto_saca: '', preco_frete_saca: '', observacoes: '',
    distancia_km: '', eixos: '5',
    custo_combustivel: '', custo_pedagio: '', custo_manutencao: '', custo_outros: ''
  });

  const selectedSupplier = suppliers.find(s => s.id === Number(formData.fornecedor_id));
  const selectedClient = clients.find(c => c.id === Number(formData.cliente_id));

  // Filter stock by selected supplier (only entries with remaining quantity)
  const availableStock = useMemo(() => {
    if (!formData.fornecedor_id) return [];
    return (stockItems || []).filter(s =>
      s.fornecedor_id === Number(formData.fornecedor_id) &&
      Number(s.quantidade_sacas_restante) > 0
    );
  }, [stockItems, formData.fornecedor_id]);

  // When stock is selected, auto-fill product and price
  const handleStockSelect = (estoqueId) => {
    setSelectedEstoqueId(estoqueId);
    if (estoqueId) {
      const stock = stockItems.find(s => s.id === Number(estoqueId));
      if (stock) {
        const produto = stock.produto || '';
        if (['Milho', 'Sorgo'].includes(produto)) {
          setProdutoTipo(produto);
          setProdutoCustom('');
        } else if (produto) {
          setProdutoTipo('Outros');
          setProdutoCustom(produto);
        }
        setFormData(prev => ({
          ...prev,
          preco_produto_saca: stock.preco_sugerido_saca || stock.preco_pago_saca || prev.preco_produto_saca
        }));
      }
    }
  };

  const produto = produtoTipo === 'Outros' ? produtoCustom : produtoTipo;
  const qtdSacas = Number(formData.quantidade_sacas) || 0;
  const precoSaca = Number(formData.preco_produto_saca) || 0;
  const precoFrete = Number(formData.preco_frete_saca) || 0;
  const pesoTotal = qtdSacas * 60;
  const valorProduto = qtdSacas * precoSaca;
  const valorFrete = qtdSacas * precoFrete;
  const valorTotal = valorProduto + valorFrete;

  // ANTT validation
  const distKm = Number(formData.distancia_km) || 0;
  const eixos = Number(formData.eixos) || 5;
  const anttValidation = distKm > 0 && valorFrete > 0
    ? validarFreteANTT(valorFrete, distKm, eixos, qtdSacas)
    : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!produto) { showError('Validação', 'Selecione ou informe o produto'); return; }
    setLoading(true);
    try {
      await tripsService.create({
        fornecedor_id: Number(formData.fornecedor_id),
        cliente_id: Number(formData.cliente_id),
        caminhao_id: Number(formData.caminhao_id),
        motorista_id: Number(formData.motorista_id),
        produto,
        quantidade_sacas: qtdSacas,
        preco_produto_saca: precoSaca,
        preco_frete_saca: precoFrete,
        observacoes: formData.observacoes || null,
        distancia_km: Number(formData.distancia_km) || null,
        estoque_id: selectedEstoqueId ? Number(selectedEstoqueId) : null,
        custo_combustivel: Number(formData.custo_combustivel) || 0,
        custo_pedagio: Number(formData.custo_pedagio) || 0,
        custo_manutencao: Number(formData.custo_manutencao) || 0,
        custo_outros: Number(formData.custo_outros) || 0,
        origem_cidade: selectedSupplier?.cidade || null,
        origem_estado: selectedSupplier?.estado || null,
        origem_lat: gpsOrigem?.lat || selectedSupplier?.latitude || null,
        origem_lng: gpsOrigem?.lng || selectedSupplier?.longitude || null,
        destino_cidade: selectedClient?.cidade || null,
        destino_estado: selectedClient?.estado || null,
        destino_lat: selectedClient?.latitude || null,
        destino_lng: selectedClient?.longitude || null,
      });
      setFormData({ fornecedor_id: '', cliente_id: '', caminhao_id: '', motorista_id: '', quantidade_sacas: '', preco_produto_saca: '', preco_frete_saca: '', observacoes: '', distancia_km: '', eixos: '5', custo_combustivel: '', custo_pedagio: '', custo_manutencao: '', custo_outros: '' });
      setProdutoTipo('');
      setProdutoCustom('');
      setSelectedEstoqueId('');
      onSuccess?.();
    } catch (error) {
      showError('Erro', error.message || 'Falha ao cadastrar viagem');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Rota: Fornecedor -> Cliente */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">Rota da Viagem</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Select name="fornecedor_id" label="Fornecedor (Carregamento)" value={formData.fornecedor_id} onChange={handleChange} required>
            <option value="">Selecione o fornecedor</option>
            {suppliers.map(s => <option key={s.id} value={s.id}>{s.nome} {s.cidade ? `- ${s.cidade}/${s.estado}` : ''}</option>)}
          </Select>
          <Select name="cliente_id" label="Cliente (Descarga)" value={formData.cliente_id} onChange={handleChange} required>
            <option value="">Selecione o cliente</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.nome} {c.cidade ? `- ${c.cidade}/${c.estado}` : ''}</option>)}
          </Select>
        </div>
        {selectedSupplier && selectedClient && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-blue-500/10 px-4 py-2 text-sm text-blue-400">
            <MapPin className="h-4 w-4" />
            {selectedSupplier.cidade || selectedSupplier.nome}
            <ArrowRight className="h-4 w-4" />
            {selectedClient.cidade || selectedClient.nome}
          </div>
        )}
        {/* GPS capture for origin (at loading point) */}
        <div className="mt-3">
          <GPSCapture
            type="trip_origin"
            label="Capturar GPS do carregamento"
            onCapture={({ lat, lng }) => setGpsOrigem({ lat, lng })}
          />
        </div>
      </div>

      {/* Estoque Vinculado (opcional) */}
      {availableStock.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">Vincular ao Estoque (Opcional)</h3>
          <Select value={selectedEstoqueId} onChange={(e) => handleStockSelect(e.target.value)} label="Entrada de Estoque">
            <option value="">Sem vínculo com estoque</option>
            {availableStock.map(s => (
              <option key={s.id} value={s.id}>
                {s.produto} - {s.localizacao || 'Sem local'} | Restante: {Number(s.quantidade_sacas_restante).toLocaleString('pt-BR')} sacas | Preço sugerido: R$ {Number(s.preco_sugerido_saca).toFixed(2)}
              </option>
            ))}
          </Select>
          {selectedEstoqueId && (
            <p className="mt-2 text-xs text-amber-400">
              Ao finalizar esta viagem, {qtdSacas || 0} sacas serão subtraídas do estoque selecionado.
            </p>
          )}
        </div>
      )}

      {/* Veículo e Motorista */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">Veículo e Motorista</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Select name="caminhao_id" label="Caminhão" value={formData.caminhao_id} onChange={handleChange} required>
            <option value="">Selecione o caminhão</option>
            {trucks.map(t => <option key={t.id} value={t.id}>{t.placa} - {t.modelo}</option>)}
          </Select>
          <Select name="motorista_id" label="Motorista" value={formData.motorista_id} onChange={handleChange} required>
            <option value="">Selecione o motorista</option>
            {drivers.map(d => <option key={d.id} value={d.id}>{d.nome}</option>)}
          </Select>
        </div>
      </div>

      {/* Produto e Valores */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">Produto e Valores</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Select label="Produto" value={produtoTipo} onChange={(e) => setProdutoTipo(e.target.value)} required>
            <option value="">Selecione o produto</option>
            {PRODUTOS_OPCOES.map(p => <option key={p} value={p}>{p}</option>)}
          </Select>
          {produtoTipo === 'Outros' && (
            <Input label="Nome do Produto" placeholder="Digite o nome do produto" value={produtoCustom} onChange={(e) => setProdutoCustom(e.target.value)} required />
          )}
          <Input name="quantidade_sacas" label="Quantidade (Sacas)" type="number" placeholder="0" min="1" step="0.01" value={formData.quantidade_sacas} onChange={handleChange} required />
          <Input name="preco_produto_saca" label="Preço Produto/Saca (R$)" type="number" placeholder="0,00" min="0.01" step="0.01" value={formData.preco_produto_saca} onChange={handleChange} required />
          <Input name="preco_frete_saca" label="Frete por Saca (R$)" type="number" placeholder="0,00" min="0.50" max="10.00" step="0.01" value={formData.preco_frete_saca} onChange={handleChange} required helperText="R$0,50 a R$10,00" />
        </div>
        {/* Distance + axles for ANTT validation */}
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input name="distancia_km" label="Distância (km)" type="number" placeholder="Ex: 250" min="0" step="1" value={formData.distancia_km} onChange={handleChange} helperText="Para validar piso ANTT" />
          <Select name="eixos" label="Eixos do caminhão" value={formData.eixos} onChange={handleChange}>
            {getEixosOptions().map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </Select>
        </div>
        {/* ANTT Warning */}
        {anttValidation && !anttValidation.valid && (
          <div className="mt-3 flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
            <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-red-400">Frete abaixo do piso ANTT</p>
              <p className="text-red-400/80 mt-1">
                Piso mínimo para {distKm}km com {eixos} eixos: <strong>{formatCurrency(anttValidation.minimo)}</strong>
                {' '}(seu frete: {formatCurrency(valorFrete)})
              </p>
              <p className="text-red-400/60 text-xs mt-1">
                Diferença: {formatCurrency(Math.abs(anttValidation.diferenca))} abaixo do mínimo legal (Res. ANTT 5.867/2020)
              </p>
            </div>
          </div>
        )}
        {anttValidation && anttValidation.valid && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-500/10 px-4 py-2 text-sm text-emerald-400">
            <CheckCircle className="h-4 w-4" />
            Frete dentro do piso ANTT (+{anttValidation.percentual.toFixed(1)}% acima do mínimo)
          </div>
        )}
      </div>

      {/* Resumo Financeiro */}
      {qtdSacas > 0 && precoFrete > 0 && produto && (
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">Resumo Financeiro</h3>
          <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
            <div>
              <p className="text-[var(--color-text-secondary)]">Peso Total</p>
              <p className="font-semibold text-[var(--color-text)]">{pesoTotal.toLocaleString('pt-BR')} kg</p>
            </div>
            <div>
              <p className="text-[var(--color-text-secondary)]">Valor Produto</p>
              <p className="font-semibold text-[var(--color-text)]">{formatCurrency(valorProduto)}</p>
            </div>
            <div>
              <p className="text-[var(--color-text-secondary)]">Valor Frete</p>
              <p className="font-semibold text-[var(--color-text)]">{formatCurrency(valorFrete)}</p>
            </div>
            <div>
              <p className="text-[var(--color-text-secondary)]">Total Geral</p>
              <p className="text-lg font-bold text-emerald-400">{formatCurrency(valorTotal)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Despesas da Viagem (opcional) */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">Despesas da Viagem (Opcional)</h3>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Input name="custo_combustivel" label="Combustivel (R$)" type="number" step="0.01" placeholder="0,00" value={formData.custo_combustivel} onChange={handleChange} />
          <Input name="custo_pedagio" label="Pedagio (R$)" type="number" step="0.01" placeholder="0,00" value={formData.custo_pedagio} onChange={handleChange} />
          <Input name="custo_manutencao" label="Manutencao (R$)" type="number" step="0.01" placeholder="0,00" value={formData.custo_manutencao} onChange={handleChange} />
          <Input name="custo_outros" label="Outros (R$)" type="number" step="0.01" placeholder="0,00" value={formData.custo_outros} onChange={handleChange} />
        </div>
      </div>

      <Input name="observacoes" label="Observações" placeholder="Informações adicionais da viagem..." value={formData.observacoes} onChange={handleChange} />

      <Button type="submit" variant="primary" loading={loading} className="w-full">
        Cadastrar Viagem
      </Button>
    </form>
  );
}

function FinalizeModal({ trip, isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formaPagamento, setFormaPagamento] = useState('');
  const [gpsDestino, setGpsDestino] = useState(null);
  const [custos, setCustos] = useState({
    custo_combustivel: trip.custo_combustivel || '',
    custo_pedagio: trip.custo_pedagio || '',
    custo_manutencao: trip.custo_manutencao || '',
    custo_outros: trip.custo_outros || ''
  });
  const { success, error } = useToast();

  const custoTotal = (Number(custos.custo_combustivel) || 0) + (Number(custos.custo_pedagio) || 0) +
    (Number(custos.custo_manutencao) || 0) + (Number(custos.custo_outros) || 0);
  const receita = Number(trip.valor_total_frete) || 0;
  const lucro = receita - custoTotal;
  const margem = receita > 0 ? (lucro / receita) * 100 : 0;

  const handleCustoChange = (e) => {
    setCustos(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await tripsService.finalize(trip.id, {
        forma_pagamento: formaPagamento,
        custo_combustivel: Number(custos.custo_combustivel) || 0,
        custo_pedagio: Number(custos.custo_pedagio) || 0,
        custo_manutencao: Number(custos.custo_manutencao) || 0,
        custo_outros: Number(custos.custo_outros) || 0
      });
      // Update destination GPS if captured
      if (gpsDestino) {
        try {
          await tripsService.updateLocation(trip.id, 'destino', gpsDestino.lat, gpsDestino.lng);
        } catch { /* non-blocking */ }
      }
      success('Viagem Finalizada!', 'A viagem foi finalizada com sucesso');
      onSuccess?.();
      onClose();
    } catch (err) {
      error('Erro', err.message || 'Falha ao finalizar viagem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Finalizar Viagem">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Trip summary */}
        <div className="rounded-lg bg-[var(--color-surface)] p-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-[var(--color-text-secondary)]">Produto</p>
              <p className="font-medium text-[var(--color-text)]">{trip.produto}</p>
            </div>
            <div>
              <p className="text-[var(--color-text-secondary)]">Quantidade</p>
              <p className="font-medium text-[var(--color-text)]">{trip.quantidade_sacas} sacas</p>
            </div>
            <div>
              <p className="text-[var(--color-text-secondary)]">Valor Produto</p>
              <p className="font-medium text-[var(--color-text)]">{formatCurrency(trip.valor_total_produto)}</p>
            </div>
            <div>
              <p className="text-[var(--color-text-secondary)]">Receita (Frete)</p>
              <p className="font-medium text-emerald-400">{formatCurrency(receita)}</p>
            </div>
          </div>
        </div>

        {/* Costs */}
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">Despesas da Viagem</h3>
          <div className="grid grid-cols-2 gap-3">
            <Input name="custo_combustivel" label="Combustivel (R$)" type="number" step="0.01" placeholder="0,00" value={custos.custo_combustivel} onChange={handleCustoChange} />
            <Input name="custo_pedagio" label="Pedagio (R$)" type="number" step="0.01" placeholder="0,00" value={custos.custo_pedagio} onChange={handleCustoChange} />
            <Input name="custo_manutencao" label="Manutencao (R$)" type="number" step="0.01" placeholder="0,00" value={custos.custo_manutencao} onChange={handleCustoChange} />
            <Input name="custo_outros" label="Outros (R$)" type="number" step="0.01" placeholder="0,00" value={custos.custo_outros} onChange={handleCustoChange} />
          </div>
        </div>

        {/* Profitability summary */}
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">Rentabilidade</h3>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-[var(--color-text-secondary)]">Custo Total</p>
              <p className="font-semibold text-red-400">{formatCurrency(custoTotal)}</p>
            </div>
            <div>
              <p className="text-[var(--color-text-secondary)]">Lucro</p>
              <p className={`font-semibold ${lucro >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{formatCurrency(lucro)}</p>
            </div>
            <div>
              <p className="text-[var(--color-text-secondary)]">Margem</p>
              <p className={`font-semibold ${margem >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{margem.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        {/* GPS capture for destination (at unloading point) */}
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">Localizacao da Descarga</h3>
          <p className="mb-3 text-xs text-[var(--color-text-tertiary)]">Capture a localizacao GPS real do ponto de descarga</p>
          <GPSCapture
            type="trip_destination"
            tripId={trip.id}
            label="Capturar GPS da descarga"
            onCapture={({ lat, lng, offline }) => {
              if (!offline) setGpsDestino({ lat, lng });
            }}
          />
        </div>

        <Select label="Forma de Pagamento" value={formaPagamento} onChange={(e) => setFormaPagamento(e.target.value)} required>
          <option value="">Selecione a forma de pagamento</option>
          {FORMAS_PAGAMENTO.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
        </Select>

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={loading}>Cancelar</Button>
          <Button type="submit" variant="success" loading={loading} className="flex-1">
            <CheckCircle className="mr-2 h-4 w-4" /> Finalizar Viagem
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function TripsPage({ trucks, drivers, onRefetch }) {
  const { success, error } = useToast();
  const [trips, setTrips] = useState([]);
  const [clients, setClients] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [stockItems, setStockItems] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [finalizingTrip, setFinalizingTrip] = useState(null);
  const [deletingTrip, setDeletingTrip] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todas');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [expandedTripId, setExpandedTripId] = useState(null);

  const fetchData = async () => {
    try {
      setLoadingData(true);
      const [tripsRes, clientsRes, suppliersRes, stockRes] = await Promise.all([
        tripsService.getAll(),
        clientsService.getAll(),
        suppliersService.getAll(),
        stockService.getAll()
      ]);
      setTrips(tripsRes.data || []);
      setClients(clientsRes.data || []);
      setSuppliers(suppliersRes.data || []);
      setStockItems(stockRes.data || []);
    } catch (err) {
      error('Erro', 'Falha ao carregar dados');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleRefetch = () => {
    fetchData();
  };

  const handleCreateSuccess = () => {
    handleRefetch();
    setShowCreateForm(false);
  };

  const filteredTrips = useMemo(() => {
    return trips.filter(t => {
      const matchSearch = searchTerm === '' || [
        t.fornecedores?.nome, t.clientes?.nome, t.motoristas?.nome,
        t.caminhoes?.placa, t.produto || ''
      ].some(v => v?.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchStatus = statusFilter === 'todas' || t.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [trips, searchTerm, statusFilter]);

  const pagination = usePagination(filteredTrips);

  const handleDelete = async () => {
    if (!deletingTrip) return;
    setDeleteLoading(true);
    try {
      await tripsService.delete(deletingTrip.id);
      success('Sucesso!', 'Viagem excluída com sucesso');
      handleRefetch();
      setDeletingTrip(null);
    } catch (err) {
      error('Erro', err.message || 'Falha ao excluir viagem');
    } finally {
      setDeleteLoading(false);
    }
  };

  const totalCadastradas = trips.filter(t => t.status === 'cadastrada').length;
  const totalFinalizadas = trips.filter(t => t.status === 'finalizada').length;
  const finalizadas = trips.filter(t => t.status === 'finalizada');
  const totalFrete = finalizadas.reduce((sum, t) => sum + Number(t.valor_total_frete || 0), 0);
  const totalCustos = finalizadas.reduce((sum, t) =>
    sum + (Number(t.custo_combustivel) || 0) + (Number(t.custo_pedagio) || 0) +
    (Number(t.custo_manutencao) || 0) + (Number(t.custo_outros) || 0), 0);
  const lucroTotal = totalFrete - totalCustos;
  const margemMedia = totalFrete > 0 ? (lucroTotal / totalFrete) * 100 : 0;

  if (loadingData) {
    return <PageSkeleton type="cards" />;
  }

  return (
    <div className="space-y-8">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 sm:gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">Em Andamento</p>
            <p className="text-xl sm:text-2xl font-bold text-amber-400">{totalCadastradas}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">Finalizadas</p>
            <p className="text-xl sm:text-2xl font-bold text-emerald-400">{totalFinalizadas}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">Receita (Frete)</p>
            <p className="text-xl sm:text-2xl font-bold text-blue-400">{formatCurrency(totalFrete)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">Lucro</p>
            <p className={`text-xl sm:text-2xl font-bold ${lucroTotal >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{formatCurrency(lucroTotal)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">Margem</p>
            <p className={`text-xl sm:text-2xl font-bold ${margemMedia >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{margemMedia.toFixed(1)}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Mapa de Rotas */}
      {showMap && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Map className="h-5 w-5" /> Mapa de Rotas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MapView
              trips={filteredTrips.map(t => ({
                ...t,
                origem_cidade: t.origem_cidade || t.fornecedores?.cidade,
                origem_estado: t.origem_estado || t.fornecedores?.estado,
                destino_cidade: t.destino_cidade || t.clientes?.cidade,
                destino_estado: t.destino_estado || t.clientes?.estado,
              })).filter(t => t.origem_cidade || t.destino_cidade)}
              height="420px"
            />
            <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
              {filteredTrips.filter(t => t.status === 'cadastrada').length} viagem(ns) ativa(s) em amarelo.
              Rotas finalizadas em cinza tracejado.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Lista de Viagens */}
      <div>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-[var(--color-text)]">
            Viagens ({filteredTrips.length} de {trips.length})
          </h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowMap(!showMap)}>
              <Map className="mr-2 h-4 w-4" />
              {showMap ? 'Ocultar Mapa' : 'Mapa'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="mr-2 h-4 w-4" />
              {showFilters ? 'Ocultar Filtros' : 'Filtros'}
            </Button>
            <Button variant="primary" size="sm" onClick={() => setShowCreateForm(true)}>
              <Route className="mr-2 h-4 w-4" />
              Cadastrar Viagem
            </Button>
          </div>
        </div>

        {showFilters && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input icon={Search} placeholder="Buscar por fornecedor, cliente, motorista, placa ou produto..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <Select label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="todas">Todas</option>
                  <option value="cadastrada">Cadastradas</option>
                  <option value="finalizada">Finalizadas</option>
                </Select>
                {(searchTerm || statusFilter !== 'todas') && (
                  <Button variant="outline" size="sm" onClick={() => { setSearchTerm(''); setStatusFilter('todas'); }} className="self-end">
                    <X className="mr-1 h-3.5 w-3.5" /> Limpar Filtros
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {trips.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <EmptyState icon={Route} title="Nenhuma viagem cadastrada" description="Cadastre a primeira viagem para começar o controle de fretes" />
            </CardContent>
          </Card>
        ) : filteredTrips.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <EmptyState icon={Search} title="Nenhum resultado encontrado" description="Tente ajustar os filtros" />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {pagination.paginatedItems.map(trip => {
              const isExpanded = expandedTripId === trip.id;
              return (
              <Card key={trip.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  {/* Clickable header area */}
                  <div
                    className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 cursor-pointer"
                    onClick={() => setExpandedTripId(isExpanded ? null : trip.id)}
                  >
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <Badge variant={trip.status === 'finalizada' ? 'success' : 'warning'}>
                          {trip.status === 'finalizada' ? 'Finalizada' : 'Cadastrada'}
                        </Badge>
                        <span className="text-xs text-[var(--color-text-secondary)]">
                          <Calendar className="mr-1 inline h-3 w-3" />
                          {formatDate(trip.data_viagem || trip.created_at)}
                        </span>
                        {isExpanded
                          ? <ChevronUp className="h-4 w-4 text-[var(--color-text-tertiary)]" />
                          : <ChevronDown className="h-4 w-4 text-[var(--color-text-tertiary)]" />
                        }
                      </div>

                      <div className="mt-3 flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-amber-500" />
                        <span className="font-medium">{trip.fornecedores?.nome}</span>
                        <ArrowRight className="h-4 w-4 text-[var(--color-text-secondary)]" />
                        <MapPin className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">{trip.clientes?.nome}</span>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-[var(--color-text-secondary)]">
                        <span className="flex items-center gap-1">
                          <Truck className="h-3 w-3" />
                          {trip.caminhoes?.placa}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {trip.motoristas?.nome}
                        </span>
                        <span className="flex items-center gap-1">
                          <Package className="h-3 w-3" />
                          {trip.produto} - {trip.quantidade_sacas} sacas
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          Frete: {formatCurrency(trip.valor_total_frete)}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-row flex-wrap gap-2 sm:ml-4 sm:flex-col sm:shrink-0" onClick={(e) => e.stopPropagation()}>
                      <DocumentGallery entidadeTipo="viagem" entidadeId={trip.id} compact />
                      {trip.status === 'cadastrada' && (
                        <>
                          <Button variant="success" size="sm" onClick={() => setFinalizingTrip(trip)}>
                            <CheckCircle className="mr-2 h-4 w-4" /> Finalizar
                          </Button>
                          <Button variant="danger" size="sm" onClick={() => setDeletingTrip(trip)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Excluir
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Expanded detail panel */}
                  {isExpanded && (
                    <div className="mt-4 space-y-3 border-t border-[var(--color-border)] pt-4">
                      {/* Cost center for finalized trips */}
                      {trip.status === 'finalizada' && (() => {
                        const ct = (Number(trip.custo_combustivel) || 0) + (Number(trip.custo_pedagio) || 0) +
                          (Number(trip.custo_manutencao) || 0) + (Number(trip.custo_outros) || 0);
                        const rec = Number(trip.valor_total_frete) || 0;
                        const luc = rec - ct;
                        if (ct > 0) {
                          return (
                            <div className="flex flex-wrap items-center gap-3 text-xs">
                              <span className="text-red-400">Custos: {formatCurrency(ct)}</span>
                              <span className={luc >= 0 ? 'text-emerald-400 font-medium' : 'text-red-400 font-medium'}>
                                Lucro: {formatCurrency(luc)} ({rec > 0 ? ((luc / rec) * 100).toFixed(1) : 0}%)
                              </span>
                            </div>
                          );
                        }
                        return null;
                      })()}

                      {/* Custos detalhados */}
                      <TripCostsPanel
                        tripId={trip.id}
                        readOnly={trip.status === 'finalizada'}
                        onTotalsChange={() => handleRefetch()}
                      />

                      {trip.estoque_id && (
                        <p className="text-xs text-emerald-400">
                          Vinculada ao estoque #{trip.estoque_id}
                        </p>
                      )}
                      {trip.forma_pagamento && (
                        <p className="text-xs text-[var(--color-text-secondary)]">
                          Pago via: {FORMAS_PAGAMENTO.find(f => f.value === trip.forma_pagamento)?.label || trip.forma_pagamento}
                        </p>
                      )}

                      {trip.distancia_km > 0 && (
                        <p className="text-xs text-[var(--color-text-secondary)]">
                          Distância: {trip.distancia_km} km | Eixos: {trip.eixos || '-'}
                        </p>
                      )}

                      {trip.observacoes && (
                        <p className="text-xs text-[var(--color-text-secondary)] italic">
                          Obs: {trip.observacoes}
                        </p>
                      )}

                      {/* Inline map with route */}
                      <TripMapDetail
                        trip={{
                          ...trip,
                          origem_cidade: trip.origem_cidade || trip.fornecedores?.cidade,
                          origem_estado: trip.origem_estado || trip.fornecedores?.estado,
                          destino_cidade: trip.destino_cidade || trip.clientes?.cidade,
                          destino_estado: trip.destino_estado || trip.clientes?.estado,
                        }}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
              );
            })}
            <Pagination {...pagination} />
          </div>
        )}
      </div>

      {/* Modal: Cadastrar Viagem */}
      <Modal isOpen={showCreateForm} onClose={() => setShowCreateForm(false)} title="Cadastrar Nova Viagem" size="xl">
        {clients.length === 0 || suppliers.length === 0 ? (
          <div className="rounded-lg bg-amber-500/10 p-4 text-sm text-amber-400">
            <p className="font-semibold">Pré-requisitos:</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              {suppliers.length === 0 && <li>Cadastre pelo menos um <strong>fornecedor</strong></li>}
              {clients.length === 0 && <li>Cadastre pelo menos um <strong>cliente</strong></li>}
            </ul>
          </div>
        ) : (
          <TripForm trucks={trucks} drivers={drivers} clients={clients} suppliers={suppliers} stockItems={stockItems} onSuccess={handleCreateSuccess} />
        )}
      </Modal>

      {finalizingTrip && (
        <FinalizeModal trip={finalizingTrip} isOpen={!!finalizingTrip} onClose={() => setFinalizingTrip(null)} onSuccess={handleRefetch} />
      )}

      <ConfirmDialog
        isOpen={!!deletingTrip}
        onClose={() => setDeletingTrip(null)}
        onConfirm={handleDelete}
        title="Excluir Viagem"
        description="Tem certeza que deseja excluir esta viagem? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        isLoading={deleteLoading}
      />
    </div>
  );
}
