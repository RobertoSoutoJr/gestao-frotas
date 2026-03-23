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
  Warehouse, Package, Factory, DollarSign, CheckCircle, Clock,
  Edit2, Trash2, Search, Filter, TrendingUp, AlertCircle, Plus,
  MapPin, CreditCard, ArrowUpDown, Undo2, Receipt, ChevronDown, ChevronUp, X, Route
} from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/utils';
import { stockService } from '../services/stock';
import { suppliersService } from '../services/suppliers';
import { tripsService } from '../services/trips';
import { useToast } from '../hooks/useToast';

const PRODUTOS_OPCOES = ['Milho', 'Sorgo', 'Outros'];
const FORMAS_PAGAMENTO = ['Pix', 'Dinheiro', 'Transferencia', 'Cheque'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Mais Recente' },
  { value: 'oldest', label: 'Mais Antigo' },
  { value: 'expensive', label: 'Maior Valor' },
  { value: 'cheapest', label: 'Menor Valor' },
  { value: 'due_soon', label: 'Vencimento Próximo' }
];
const FILTER_OPTIONS = [
  { value: 'todos', label: 'Todos' },
  { value: 'pendente', label: 'Pendentes' },
  { value: 'parcial', label: 'Parcialmente Pago' },
  { value: 'pago', label: 'Pagos' },
  { value: 'vencido', label: 'Vencidos' }
];

// ============ SILO COMPONENT ============
function SiloIcon({ percent, size = 120 }) {
  const clampedPercent = Math.max(0, Math.min(100, percent));
  const fillColor = clampedPercent > 50 ? '#10B981' : clampedPercent > 20 ? '#F59E0B' : '#EF4444';
  const fillHeight = (clampedPercent / 100) * 70;
  const fillY = 25 + (70 - fillHeight);

  return (
    <svg viewBox="0 0 80 100" width={size} height={size * 1.25} className="drop-shadow-lg">
      {/* Silo body */}
      <rect x="15" y="25" width="50" height="70" rx="4" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="1.5" />
      {/* Silo dome */}
      <path d="M15 28 Q15 8 40 5 Q65 8 65 28" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="1.5" />
      {/* Fill level */}
      <rect x="16" y={fillY} width="48" height={fillHeight} rx="3"
        fill={fillColor} opacity="0.85"
        style={{ transition: 'height 0.8s ease-in-out, y 0.8s ease-in-out' }} />
      {/* Fill gradient overlay */}
      <rect x="16" y={fillY} width="48" height={fillHeight} rx="3"
        fill="url(#siloGradient)" opacity="0.3"
        style={{ transition: 'height 0.8s ease-in-out, y 0.8s ease-in-out' }} />
      {/* Dome fill */}
      {clampedPercent > 95 && (
        <path d="M16 28 Q16 10 40 7 Q64 10 64 28" fill={fillColor} opacity="0.85"
          style={{ transition: 'opacity 0.5s ease-in-out' }} />
      )}
      {/* Percent text */}
      <text x="40" y="65" textAnchor="middle" fontSize="14" fontWeight="bold"
        fill={clampedPercent > 40 ? 'white' : 'var(--color-text)'}>
        {Math.round(clampedPercent)}%
      </text>
      {/* Bottom base */}
      <rect x="10" y="93" width="60" height="5" rx="2" fill="var(--color-border)" />
      {/* Gradient definition */}
      <defs>
        <linearGradient id="siloGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="white" stopOpacity="0.4" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ============ STOCK FORM ============
function StockForm({ suppliers, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [produtoTipo, setProdutoTipo] = useState('');
  const [produtoCustom, setProdutoCustom] = useState('');
  const [formData, setFormData] = useState({
    fornecedor_id: '', quantidade_sacas: '', preco_pago_saca: '',
    pago: false, nota_fiscal: '', observacoes: '',
    data_vencimento: '', localizacao: '', forma_pagamento: ''
  });

  const produto = produtoTipo === 'Outros' ? produtoCustom : produtoTipo;
  const qtdSacas = Number(formData.quantidade_sacas) || 0;
  const precoSaca = Number(formData.preco_pago_saca) || 0;
  const valorTotal = qtdSacas * precoSaca;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!produto) { alert('Selecione ou informe o produto'); return; }
    setLoading(true);
    try {
      await stockService.create({
        produto,
        fornecedor_id: Number(formData.fornecedor_id),
        quantidade_sacas: qtdSacas,
        preco_pago_saca: precoSaca,
        pago: formData.pago,
        nota_fiscal: formData.nota_fiscal || null,
        observacoes: formData.observacoes || null,
        data_vencimento: formData.data_vencimento || null,
        localizacao: formData.localizacao || null,
        forma_pagamento: formData.forma_pagamento || null
      });
      setFormData({ fornecedor_id: '', quantidade_sacas: '', preco_pago_saca: '', pago: false, nota_fiscal: '', observacoes: '', data_vencimento: '', localizacao: '', forma_pagamento: '' });
      setProdutoTipo('');
      setProdutoCustom('');
      onSuccess?.();
    } catch (error) {
      alert(error.message || 'Falha ao adicionar ao estoque');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Produto e Fornecedor</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Select label="Produto" value={produtoTipo} onChange={(e) => setProdutoTipo(e.target.value)} required>
            <option value="">Selecione o produto</option>
            {PRODUTOS_OPCOES.map(p => <option key={p} value={p}>{p}</option>)}
          </Select>
          {produtoTipo === 'Outros' && (
            <Input label="Nome do Produto" placeholder="Digite o nome" value={produtoCustom} onChange={(e) => setProdutoCustom(e.target.value)} required />
          )}
          <Select name="fornecedor_id" label="Fornecedor" value={formData.fornecedor_id} onChange={handleChange} required>
            <option value="">Selecione o fornecedor</option>
            {suppliers.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
          </Select>
          <Input name="localizacao" label="Localização" placeholder="Ex: Fazenda São João" value={formData.localizacao} onChange={handleChange} />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Quantidade e Valores</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Input name="quantidade_sacas" label="Quantidade (Sacas)" type="number" placeholder="0" min="1" step="0.01" value={formData.quantidade_sacas} onChange={handleChange} required />
          <Input name="preco_pago_saca" label="Preço Pago por Saca (R$)" type="number" placeholder="0,00" min="0.01" step="0.01" value={formData.preco_pago_saca} onChange={handleChange} required />
          <Input name="nota_fiscal" label="Nota Fiscal" placeholder="NF-e 000000" value={formData.nota_fiscal} onChange={handleChange} />
          <Input name="data_vencimento" label="Data de Vencimento" type="date" value={formData.data_vencimento} onChange={handleChange} />
        </div>
      </div>

      {qtdSacas > 0 && precoSaca > 0 && (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
          <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-3">
            <div>
              <p className="text-zinc-500">Peso Total</p>
              <p className="font-semibold text-zinc-900 dark:text-zinc-50">{(qtdSacas * 60).toLocaleString('pt-BR')} kg</p>
            </div>
            <div>
              <p className="text-zinc-500">Valor Total</p>
              <p className="font-semibold text-zinc-900 dark:text-zinc-50">{formatCurrency(valorTotal)}</p>
            </div>
            <div>
              <p className="text-zinc-500">Preço Sugerido Venda</p>
              <p className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(precoSaca * 1.15)}/saca</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
          <input type="checkbox" name="pago" checked={formData.pago} onChange={handleChange} className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500" />
          Já foi pago ao fornecedor
        </label>
        {formData.pago && (
          <Select name="forma_pagamento" label="" value={formData.forma_pagamento} onChange={handleChange} className="w-48">
            <option value="">Forma de pagamento</option>
            {FORMAS_PAGAMENTO.map(f => <option key={f} value={f}>{f}</option>)}
          </Select>
        )}
      </div>

      <Input name="observacoes" label="Observações" placeholder="Informações adicionais..." value={formData.observacoes} onChange={handleChange} />

      <Button type="submit" variant="success" loading={loading} className="w-full">
        Adicionar ao Estoque
      </Button>
    </form>
  );
}

// ============ EDIT STOCK MODAL ============
function EditStockModal({ item, suppliers, isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();
  const initTipo = ['Milho', 'Sorgo'].includes(item.produto) ? item.produto : (item.produto ? 'Outros' : '');
  const initCustom = initTipo === 'Outros' ? (item.produto || '') : '';
  const [produtoTipo, setProdutoTipo] = useState(initTipo);
  const [produtoCustom, setProdutoCustom] = useState(initCustom);
  const [formData, setFormData] = useState({
    fornecedor_id: item.fornecedor_id || '',
    quantidade_sacas: item.quantidade_sacas || '',
    preco_pago_saca: item.preco_pago_saca || '',
    nota_fiscal: item.nota_fiscal || '',
    observacoes: item.observacoes || '',
    data_vencimento: item.data_vencimento || '',
    localizacao: item.localizacao || ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const produto = produtoTipo === 'Outros' ? produtoCustom : produtoTipo;
    if (!produto) { alert('Selecione ou informe o produto'); return; }
    setLoading(true);
    try {
      await stockService.update(item.id, {
        ...formData,
        produto,
        fornecedor_id: Number(formData.fornecedor_id),
        quantidade_sacas: Number(formData.quantidade_sacas),
        preco_pago_saca: Number(formData.preco_pago_saca),
        data_vencimento: formData.data_vencimento || null,
        localizacao: formData.localizacao || null
      });
      success('Sucesso!', 'Estoque atualizado com sucesso');
      onSuccess?.();
      onClose();
    } catch (err) {
      error('Erro', err.message || 'Falha ao atualizar estoque');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Registro de Estoque" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Select label="Produto" value={produtoTipo} onChange={(e) => setProdutoTipo(e.target.value)} required>
            <option value="">Selecione</option>
            {PRODUTOS_OPCOES.map(p => <option key={p} value={p}>{p}</option>)}
          </Select>
          {produtoTipo === 'Outros' && (
            <Input label="Nome do Produto" value={produtoCustom} onChange={(e) => setProdutoCustom(e.target.value)} required />
          )}
          <Select name="fornecedor_id" label="Fornecedor" value={formData.fornecedor_id} onChange={handleChange} required>
            <option value="">Selecione</option>
            {suppliers.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
          </Select>
          <Input name="quantidade_sacas" label="Quantidade (Sacas)" type="number" min="1" step="0.01" value={formData.quantidade_sacas} onChange={handleChange} required />
          <Input name="preco_pago_saca" label="Preço Pago por Saca (R$)" type="number" min="0.01" step="0.01" value={formData.preco_pago_saca} onChange={handleChange} required />
          <Input name="nota_fiscal" label="Nota Fiscal" value={formData.nota_fiscal} onChange={handleChange} />
          <Input name="data_vencimento" label="Data de Vencimento" type="date" value={formData.data_vencimento} onChange={handleChange} />
          <Input name="localizacao" label="Localização" placeholder="Ex: Fazenda São João" value={formData.localizacao} onChange={handleChange} />
          <Input name="observacoes" label="Observações" value={formData.observacoes} onChange={handleChange} className="md:col-span-2" />
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={loading}>Cancelar</Button>
          <Button type="submit" variant="success" loading={loading} className="flex-1">Salvar Alterações</Button>
        </div>
      </form>
    </Modal>
  );
}

// ============ PARTIAL PAYMENT MODAL ============
function PartialPaymentModal({ item, isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();
  const [valor, setValor] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [cheques, setCheques] = useState([{ valor: '', nome_titular_conta: '', nome_emissor: '', data_cheque: '', numero_cheque: '' }]);
  const [payments, setPayments] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const saldoRestante = Number(item.valor_total) - Number(item.valor_pago || 0);
  const valorNum = Number(valor) || 0;

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await stockService.getPaymentHistory(item.id);
      setPayments(res.data || []);
    } catch { }
    setLoadingHistory(false);
  };

  const addCheque = () => setCheques(prev => [...prev, { valor: '', nome_titular_conta: '', nome_emissor: '', data_cheque: '', numero_cheque: '' }]);
  const removeCheque = (idx) => setCheques(prev => prev.filter((_, i) => i !== idx));
  const updateCheque = (idx, field, value) => setCheques(prev => prev.map((c, i) => i === idx ? { ...c, [field]: value } : c));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (valorNum <= 0 || valorNum > saldoRestante + 0.01) {
      alert(`Valor deve ser entre R$ 0,01 e ${formatCurrency(saldoRestante)}`);
      return;
    }
    if (!formaPagamento) { alert('Selecione a forma de pagamento'); return; }

    setLoading(true);
    try {
      const payload = { valor: valorNum, forma_pagamento: formaPagamento, observacoes: observacoes || null };
      if (formaPagamento === 'Cheque') {
        payload.cheques = cheques.filter(c => c.valor && c.nome_titular_conta && c.nome_emissor).map(c => ({
          ...c, valor: Number(c.valor)
        }));
        if (payload.cheques.length === 0) {
          alert('Adicione pelo menos um cheque com os dados completos');
          setLoading(false);
          return;
        }
      }
      await stockService.makePartialPayment(item.id, payload);
      success('Pagamento Registrado!', `${formatCurrency(valorNum)} registrado com sucesso`);
      onSuccess?.();
      onClose();
    } catch (err) {
      error('Erro', err.message || 'Falha ao registrar pagamento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Registrar Pagamento" size="lg">
      <div className="space-y-4">
        {/* Summary */}
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-zinc-500">Valor Total</p>
              <p className="font-semibold text-[var(--color-text)]">{formatCurrency(item.valor_total)}</p>
            </div>
            <div>
              <p className="text-zinc-500">Já Pago</p>
              <p className="font-semibold text-green-600">{formatCurrency(item.valor_pago || 0)}</p>
            </div>
            <div>
              <p className="text-zinc-500">Saldo Restante</p>
              <p className="font-bold text-red-600">{formatCurrency(saldoRestante)}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input label="Valor do Pagamento (R$)" type="number" placeholder="0,00" min="0.01" step="0.01"
              max={saldoRestante} value={valor} onChange={(e) => setValor(e.target.value)} required />
            <Select label="Forma de Pagamento" value={formaPagamento} onChange={(e) => setFormaPagamento(e.target.value)} required>
              <option value="">Selecione</option>
              {FORMAS_PAGAMENTO.map(f => <option key={f} value={f}>{f}</option>)}
            </Select>
          </div>

          {/* Cheque sub-form */}
          {formaPagamento === 'Cheque' && (
            <div className="space-y-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-[var(--color-text)]">Cheques ({cheques.length})</h4>
                <Button type="button" variant="outline" size="sm" onClick={addCheque}>
                  <Plus className="mr-1 h-3 w-3" /> Adicionar Cheque
                </Button>
              </div>
              {cheques.map((cheque, idx) => (
                <div key={idx} className="relative rounded-lg border border-zinc-100 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800/50">
                  {cheques.length > 1 && (
                    <button type="button" onClick={() => removeCheque(idx)}
                      className="absolute right-2 top-2 text-zinc-400 hover:text-red-500">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <Input label="Valor (R$)" type="number" min="0.01" step="0.01" placeholder="0,00"
                      value={cheque.valor} onChange={(e) => updateCheque(idx, 'valor', e.target.value)} required />
                    <Input label="Nº Cheque" placeholder="000000"
                      value={cheque.numero_cheque} onChange={(e) => updateCheque(idx, 'numero_cheque', e.target.value)} />
                    <Input label="Titular da Conta" placeholder="Nome do titular"
                      value={cheque.nome_titular_conta} onChange={(e) => updateCheque(idx, 'nome_titular_conta', e.target.value)} required />
                    <Input label="Quem Passou o Cheque" placeholder="Nome de quem emitiu"
                      value={cheque.nome_emissor} onChange={(e) => updateCheque(idx, 'nome_emissor', e.target.value)} required />
                    <Input label="Data do Cheque" type="date"
                      value={cheque.data_cheque} onChange={(e) => updateCheque(idx, 'data_cheque', e.target.value)} />
                  </div>
                </div>
              ))}
            </div>
          )}

          <Input label="Observações" placeholder="Informações adicionais do pagamento..." value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />

          {/* Quick fill buttons */}
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setValor(saldoRestante.toFixed(2))}>
              Pagar Total ({formatCurrency(saldoRestante)})
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setValor((saldoRestante / 2).toFixed(2))}>
              Pagar Metade ({formatCurrency(saldoRestante / 2)})
            </Button>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={loading}>Cancelar</Button>
            <Button type="submit" variant="success" loading={loading} className="flex-1">
              <DollarSign className="mr-2 h-4 w-4" /> Registrar Pagamento
            </Button>
          </div>
        </form>

        {/* Payment history */}
        <div className="border-t border-zinc-200 pt-4 dark:border-zinc-700">
          <button type="button" onClick={() => { setShowHistory(!showHistory); if (!showHistory) loadHistory(); }}
            className="flex w-full items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)]">
            <Receipt className="h-4 w-4" />
            Histórico de Pagamentos
            {showHistory ? <ChevronUp className="ml-auto h-4 w-4" /> : <ChevronDown className="ml-auto h-4 w-4" />}
          </button>
          {showHistory && (
            <div className="mt-3 space-y-2">
              {loadingHistory ? (
                <p className="text-sm text-zinc-400">Carregando...</p>
              ) : payments.length === 0 ? (
                <p className="text-sm text-zinc-400">Nenhum pagamento registrado</p>
              ) : (
                payments.map(p => (
                  <div key={p.id} className="flex items-center justify-between rounded-lg bg-[var(--color-surface)] p-3 text-sm">
                    <div>
                      <p className="font-medium text-[var(--color-text)]">{formatCurrency(p.valor)} - {p.forma_pagamento}</p>
                      <p className="text-xs text-[var(--color-text-secondary)]">{formatDate(p.data_pagamento)}</p>
                      {p.observacoes && <p className="text-xs text-zinc-400">{p.observacoes}</p>}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

// ============ DUE DATE BADGE ============
function DueDateBadge({ date }) {
  if (!date) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(date + 'T00:00:00');
  const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return <Badge variant="danger">Vencido {Math.abs(diffDays)}d</Badge>;
  if (diffDays <= 7) return <Badge variant="warning">Vence em {diffDays}d</Badge>;
  return <span className="text-xs text-zinc-400">Vence {formatDate(date)}</span>;
}

// ============ MAIN PAGE ============
export function StockPage({ onRefetch }) {
  const { success, error } = useToast();
  const [stock, setStock] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [payingItem, setPayingItem] = useState(null);
  const [togglingItem, setTogglingItem] = useState(null);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('todos');
  const [sortOption, setSortOption] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [expandedItem, setExpandedItem] = useState(null);
  const [trips, setTrips] = useState([]);

  const fetchData = async () => {
    try {
      setLoadingData(true);
      const [stockRes, suppliersRes, tripsRes] = await Promise.all([
        stockService.getAll(),
        suppliersService.getAll(),
        tripsService.getAll()
      ]);
      setStock(stockRes.data || []);
      setSuppliers(suppliersRes.data || []);
      setTrips(tripsRes.data || []);
    } catch (err) {
      error('Erro', 'Falha ao carregar dados');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleRefetch = () => { fetchData(); onRefetch?.(); };
  const handleCreateSuccess = () => { handleRefetch(); setShowCreateForm(false); };

  const filteredStock = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let filtered = stock.filter(item => {
      const matchSearch = searchTerm === '' || [
        item.produto, item.fornecedores?.nome, item.nota_fiscal, item.localizacao
      ].some(v => v?.toLowerCase().includes(searchTerm.toLowerCase()));

      let matchFilter = true;
      if (paymentFilter === 'pago') matchFilter = item.pago;
      else if (paymentFilter === 'pendente') matchFilter = !item.pago && Number(item.valor_pago || 0) === 0;
      else if (paymentFilter === 'parcial') matchFilter = !item.pago && Number(item.valor_pago || 0) > 0;
      else if (paymentFilter === 'vencido') {
        matchFilter = !item.pago && item.data_vencimento && new Date(item.data_vencimento + 'T00:00:00') < today;
      }

      return matchSearch && matchFilter;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'oldest': return new Date(a.created_at) - new Date(b.created_at);
        case 'newest': return new Date(b.created_at) - new Date(a.created_at);
        case 'expensive': return Number(b.valor_total) - Number(a.valor_total);
        case 'cheapest': return Number(a.valor_total) - Number(b.valor_total);
        case 'due_soon': {
          const da = a.data_vencimento ? new Date(a.data_vencimento) : new Date('9999-12-31');
          const db = b.data_vencimento ? new Date(b.data_vencimento) : new Date('9999-12-31');
          return da - db;
        }
        default: return 0;
      }
    });

    return filtered;
  }, [stock, searchTerm, paymentFilter, sortOption]);

  const handleDelete = async () => {
    if (!deletingItem) return;
    setDeleteLoading(true);
    try {
      await stockService.delete(deletingItem.id);
      success('Sucesso!', 'Registro excluído com sucesso');
      handleRefetch();
      setDeletingItem(null);
    } catch (err) {
      error('Erro', err.message || 'Falha ao excluir');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleTogglePaid = async () => {
    if (!togglingItem) return;
    setToggleLoading(true);
    try {
      const newPago = !togglingItem.pago;
      await stockService.togglePaid(togglingItem.id, newPago);
      success('Sucesso!', newPago ? 'Marcado como pago' : 'Revertido para pendente');
      handleRefetch();
      setTogglingItem(null);
    } catch (err) {
      error('Erro', err.message || 'Falha ao alterar status');
    } finally {
      setToggleLoading(false);
    }
  };

  // KPIs
  const totalEstoque = stock.reduce((sum, i) => sum + Number(i.valor_total || 0), 0);
  const totalPago = stock.reduce((sum, i) => sum + Number(i.valor_pago || 0), 0);
  const totalPendente = totalEstoque - totalPago;
  const totalSacas = stock.reduce((sum, i) => sum + Number(i.quantidade_sacas || 0), 0);
  const totalSacasRestante = stock.reduce((sum, i) => sum + Number(i.quantidade_sacas_restante || 0), 0);
  const vencidos = stock.filter(i => !i.pago && i.data_vencimento && new Date(i.data_vencimento + 'T00:00:00') < new Date()).length;

  if (loadingData) {
    return <div className="flex items-center justify-center py-12"><div className="text-zinc-500">Carregando dados...</div></div>;
  }

  return (
    <div className="space-y-8">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-zinc-500">Total em Estoque</p>
            <p className="text-xl font-bold text-[var(--color-text)]">{totalSacasRestante.toLocaleString('pt-BR')} sc</p>
            <p className="text-xs text-zinc-400">Comprado: {totalSacas.toLocaleString('pt-BR')} sc</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-zinc-500">Valor Total</p>
            <p className="text-xl font-bold text-blue-600">{formatCurrency(totalEstoque)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-zinc-500">Total Pago</p>
            <p className="text-xl font-bold text-green-600">{formatCurrency(totalPago)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-zinc-500">Saldo a Pagar</p>
            <p className="text-xl font-bold text-red-600">{formatCurrency(totalPendente)}</p>
          </CardContent>
        </Card>
        {vencidos > 0 && (
          <Card className="border-red-400/50">
            <CardContent className="p-4 text-center">
              <p className="text-xs text-zinc-500">Vencidos</p>
              <p className="text-xl font-bold text-red-600">{vencidos}</p>
              <p className="text-xs text-red-400">registros</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-[var(--color-text)]">
          Estoque ({filteredStock.length} de {stock.length})
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="mr-2 h-4 w-4" />
            {showFilters ? 'Ocultar' : 'Filtros'}
          </Button>
          <Button variant="primary" size="sm" onClick={() => setShowCreateForm(true)}>
            <Plus className="mr-2 h-4 w-4" /> Nova Entrada
          </Button>
        </div>
      </div>

      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Input icon={Search} placeholder="Buscar por produto, fornecedor, NF ou local..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              <Select label="Status" value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}>
                {FILTER_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </Select>
              <Select label="Ordenar por" value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
                {SORT_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {stock.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <EmptyState icon={Warehouse} title="Estoque vazio" description="Adicione a primeira entrada de estoque" />
          </CardContent>
        </Card>
      ) : filteredStock.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <EmptyState icon={Search} title="Nenhum resultado" description="Tente ajustar os filtros" />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredStock.map(item => {
            const saldo = Number(item.valor_total) - Number(item.valor_pago || 0);
            const percentPago = Number(item.valor_total) > 0 ? (Number(item.valor_pago || 0) / Number(item.valor_total)) * 100 : 0;
            const percentEstoque = Number(item.quantidade_sacas) > 0 ? (Number(item.quantidade_sacas_restante) / Number(item.quantidade_sacas)) * 100 : 0;

            return (
              <Card key={item.id} className={`hover:shadow-md transition-shadow ${item.pago ? 'border-l-4 border-l-green-400' : saldo < Number(item.valor_total) && Number(item.valor_pago || 0) > 0 ? 'border-l-4 border-l-amber-400' : 'border-l-4 border-l-red-400'}`}>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row items-start gap-4">
                    <div className="flex flex-1 cursor-pointer flex-col sm:flex-row items-center sm:items-start gap-4" onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}>
                      {/* Silo Icon */}
                      <div className="shrink-0">
                        <SiloIcon percent={percentEstoque} size={56} />
                      </div>

                      <div className="flex-1 space-y-3">
                        {/* Header */}
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant={item.pago ? 'success' : percentPago > 0 ? 'warning' : 'danger'}>
                            {item.pago ? 'Pago' : percentPago > 0 ? `Parcial (${Math.round(percentPago)}%)` : 'Pendente'}
                          </Badge>
                          {item.nota_fiscal && <span className="text-xs text-zinc-400">NF: {item.nota_fiscal}</span>}
                          <span className="text-xs text-zinc-400">{formatDate(item.data_entrada || item.created_at)}</span>
                          <DueDateBadge date={item.data_vencimento} />
                        </div>

                        {/* Product & Supplier */}
                        <div>
                          <h3 className="text-base font-semibold text-[var(--color-text)]">{item.produto}</h3>
                          <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-[var(--color-text-secondary)]">
                            <span className="flex items-center gap-1">
                              <Factory className="h-3 w-3" /> {item.fornecedores?.nome}
                            </span>
                            {item.localizacao && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" /> {item.localizacao}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Package className="h-3 w-3" />
                              {Number(item.quantidade_sacas_restante).toLocaleString('pt-BR')}/{Number(item.quantidade_sacas).toLocaleString('pt-BR')} sc
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" /> {formatCurrency(item.preco_pago_saca)}/sc
                            </span>
                            {item.forma_pagamento && (
                              <span className="flex items-center gap-1">
                                <CreditCard className="h-3 w-3" /> {item.forma_pagamento}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Financial */}
                        <div className="flex items-center gap-4 text-sm">
                          <span className="font-semibold text-[var(--color-text)]">Total: {formatCurrency(item.valor_total)}</span>
                          {!item.pago && (
                            <>
                              <span className="text-green-600">Pago: {formatCurrency(item.valor_pago || 0)}</span>
                              <span className="font-medium text-red-600">Saldo: {formatCurrency(saldo)}</span>
                            </>
                          )}
                        </div>

                        {/* Expand indicator */}
                        <div className="flex items-center gap-1 text-xs text-[var(--color-accent)]">
                          {expandedItem === item.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                          <span>{expandedItem === item.id ? 'Recolher' : 'Ver saídas'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 flex-row flex-wrap gap-2 sm:flex-col">
                      {!item.pago && (
                        <Button variant="success" size="sm" onClick={() => setPayingItem(item)}>
                          <DollarSign className="mr-1 h-4 w-4" /> Pagar
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => setTogglingItem(item)}>
                        {item.pago ? <><Undo2 className="mr-1 h-4 w-4" /> Reverter</> : <><CheckCircle className="mr-1 h-4 w-4" /> Quitar</>}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setEditingItem(item)}>
                        <Edit2 className="mr-1 h-4 w-4" /> Editar
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => setDeletingItem(item)}>
                        <Trash2 className="mr-1 h-4 w-4" /> Excluir
                      </Button>
                    </div>
                  </div>

                  {/* Expanded trips section */}
                  {expandedItem === item.id && (
                    <div className="overflow-x-auto border-t border-zinc-200 dark:border-zinc-700 px-2 sm:px-6 pb-4 pt-3">
                      <h4 className="text-sm font-semibold text-[var(--color-text)] mb-2 flex items-center gap-2">
                        <Route className="h-4 w-4" />
                        Saídas (Viagens)
                      </h4>
                      {(() => {
                        const itemTrips = trips.filter(t => t.estoque_id === item.id);
                        if (itemTrips.length === 0) return (
                          <p className="text-sm text-zinc-400">Nenhuma saída registrada para este estoque</p>
                        );
                        return (
                          <div className="space-y-2">
                            {itemTrips.map(t => (
                              <div key={t.id} className="flex items-center justify-between rounded-lg bg-[var(--color-surface)] p-3 text-sm">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-[var(--color-text)]">{t.clientes?.nome || 'Cliente'}</span>
                                    <Badge variant={t.status === 'finalizada' ? 'success' : 'warning'}>
                                      {t.status === 'finalizada' ? 'Finalizada' : 'Em andamento'}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                                    {t.caminhoes?.placa} · {t.motoristas?.nome} · {formatDate(t.created_at)}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold text-[var(--color-text)]">{Number(t.quantidade_sacas).toLocaleString('pt-BR')} sc</p>
                                  <p className="text-xs text-[var(--color-text-secondary)]">{formatCurrency(t.valor_total_frete)} frete</p>
                                </div>
                              </div>
                            ))}
                            <div className="flex justify-between text-xs font-medium pt-1 border-t border-zinc-100 dark:border-zinc-700">
                              <span className="text-[var(--color-text-secondary)]">Total saídas:</span>
                              <span className="text-[var(--color-text)]">{itemTrips.reduce((s, t) => s + Number(t.quantidade_sacas), 0).toLocaleString('pt-BR')} sc</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal: Nova Entrada */}
      <Modal isOpen={showCreateForm} onClose={() => setShowCreateForm(false)} title="Nova Entrada de Estoque" size="xl">
        {suppliers.length === 0 ? (
          <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
            <p>Cadastre pelo menos um <strong>fornecedor</strong> antes.</p>
          </div>
        ) : (
          <StockForm suppliers={suppliers} onSuccess={handleCreateSuccess} />
        )}
      </Modal>

      {/* Modal: Editar */}
      {editingItem && (
        <EditStockModal item={editingItem} suppliers={suppliers} isOpen={!!editingItem} onClose={() => setEditingItem(null)} onSuccess={handleRefetch} />
      )}

      {/* Modal: Pagamento Parcial */}
      {payingItem && (
        <PartialPaymentModal item={payingItem} isOpen={!!payingItem} onClose={() => setPayingItem(null)} onSuccess={handleRefetch} />
      )}

      {/* Confirm: Toggle Paid */}
      <ConfirmDialog
        isOpen={!!togglingItem}
        onClose={() => setTogglingItem(null)}
        onConfirm={handleTogglePaid}
        title={togglingItem?.pago ? 'Reverter para Pendente' : 'Marcar como Pago'}
        description={togglingItem?.pago
          ? `Reverter o pagamento de ${formatCurrency(togglingItem?.valor_total)} para ${togglingItem?.produto}? O registro voltará como pendente.`
          : `Confirmar pagamento total de ${formatCurrency(togglingItem?.valor_total)} para ${togglingItem?.produto}?`}
        confirmText={togglingItem?.pago ? 'Reverter' : 'Confirmar Pagamento'}
        cancelText="Cancelar"
        variant={togglingItem?.pago ? 'danger' : 'default'}
        isLoading={toggleLoading}
      />

      {/* Confirm: Delete */}
      <ConfirmDialog
        isOpen={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleDelete}
        title="Excluir Registro"
        description="Tem certeza que deseja excluir este registro de estoque? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        isLoading={deleteLoading}
      />
    </div>
  );
}
