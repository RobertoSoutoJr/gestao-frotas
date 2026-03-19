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
  Edit2, Trash2, Search, Filter, TrendingUp, AlertCircle, Plus
} from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/utils';
import { stockService } from '../services/stock';
import { suppliersService } from '../services/suppliers';
import { useToast } from '../hooks/useToast';

const PRODUTOS_OPCOES = ['Milho', 'Sorgo', 'Outros'];

function StockForm({ suppliers, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [produtoTipo, setProdutoTipo] = useState('');
  const [produtoCustom, setProdutoCustom] = useState('');
  const [formData, setFormData] = useState({
    fornecedor_id: '', quantidade_sacas: '',
    preco_pago_saca: '', pago: false, nota_fiscal: '', observacoes: ''
  });

  const qtdSacas = Number(formData.quantidade_sacas) || 0;
  const precoSaca = Number(formData.preco_pago_saca) || 0;
  const pesoTotal = qtdSacas * 60;
  const valorTotal = qtdSacas * precoSaca;
  const precoSugerido = precoSaca > 0 ? Number((precoSaca * 1.15).toFixed(2)) : 0;

  const produto = produtoTipo === 'Outros' ? produtoCustom : produtoTipo;

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
        observacoes: formData.observacoes || null
      });
      setFormData({ fornecedor_id: '', quantidade_sacas: '', preco_pago_saca: '', pago: false, nota_fiscal: '', observacoes: '' });
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
            <Input label="Nome do Produto" placeholder="Digite o nome do produto" value={produtoCustom} onChange={(e) => setProdutoCustom(e.target.value)} required />
          )}
          <Select name="fornecedor_id" label="Fornecedor" value={formData.fornecedor_id} onChange={handleChange} required>
            <option value="">Selecione o fornecedor</option>
            {suppliers.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
          </Select>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Quantidade e Valores</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Input name="quantidade_sacas" label="Quantidade (Sacas)" type="number" placeholder="0" min="1" step="0.01" value={formData.quantidade_sacas} onChange={handleChange} required />
          <Input name="preco_pago_saca" label="Preço Pago por Saca (R$)" type="number" placeholder="0,00" min="0.01" step="0.01" value={formData.preco_pago_saca} onChange={handleChange} required />
          <Input name="nota_fiscal" label="Nota Fiscal" placeholder="NF-e 000000" value={formData.nota_fiscal} onChange={handleChange} />
        </div>
      </div>

      {/* Resumo */}
      {qtdSacas > 0 && precoSaca > 0 && (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Resumo</h3>
          <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
            <div>
              <p className="text-zinc-500">Peso Total</p>
              <p className="font-semibold text-zinc-900 dark:text-zinc-50">{pesoTotal.toLocaleString('pt-BR')} kg</p>
            </div>
            <div>
              <p className="text-zinc-500">Valor Total</p>
              <p className="font-semibold text-zinc-900 dark:text-zinc-50">{formatCurrency(valorTotal)}</p>
            </div>
            <div>
              <p className="text-zinc-500">Preço Sugerido Venda</p>
              <p className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(precoSugerido)}/saca</p>
            </div>
            <div>
              <p className="text-zinc-500">Lucro Estimado (15%)</p>
              <p className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(valorTotal * 0.15)}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
          <input
            type="checkbox"
            name="pago"
            checked={formData.pago}
            onChange={handleChange}
            className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
          />
          Já foi pago ao fornecedor
        </label>
      </div>

      <Input name="observacoes" label="Observações" placeholder="Informações adicionais..." value={formData.observacoes} onChange={handleChange} />

      <Button type="submit" variant="success" loading={loading} className="w-full">
        Adicionar ao Estoque
      </Button>
    </form>
  );
}

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
    observacoes: item.observacoes || ''
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
        preco_pago_saca: Number(formData.preco_pago_saca)
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
          <Input name="observacoes" label="Observações" value={formData.observacoes} onChange={handleChange} />
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={loading}>Cancelar</Button>
          <Button type="submit" variant="success" loading={loading} className="flex-1">Salvar Alterações</Button>
        </div>
      </form>
    </Modal>
  );
}

export function StockPage({ onRefetch }) {
  const { success, error } = useToast();
  const [stock, setStock] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [payingItem, setPayingItem] = useState(null);
  const [payLoading, setPayLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('todos');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const fetchData = async () => {
    try {
      setLoadingData(true);
      const [stockRes, suppliersRes] = await Promise.all([
        stockService.getAll(),
        suppliersService.getAll()
      ]);
      setStock(stockRes.data || []);
      setSuppliers(suppliersRes.data || []);
    } catch (err) {
      error('Erro', 'Falha ao carregar dados');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleRefetch = () => {
    fetchData();
    onRefetch?.();
  };

  const handleCreateSuccess = () => {
    handleRefetch();
    setShowCreateForm(false);
  };

  const filteredStock = useMemo(() => {
    return stock.filter(item => {
      const matchSearch = searchTerm === '' || [
        item.produto, item.fornecedores?.nome, item.nota_fiscal
      ].some(v => v?.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchPayment = paymentFilter === 'todos' ||
        (paymentFilter === 'pago' && item.pago) ||
        (paymentFilter === 'pendente' && !item.pago);
      return matchSearch && matchPayment;
    });
  }, [stock, searchTerm, paymentFilter]);

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

  const handleMarkAsPaid = async () => {
    if (!payingItem) return;
    setPayLoading(true);
    try {
      await stockService.markAsPaid(payingItem.id);
      success('Pago!', 'Registro marcado como pago');
      handleRefetch();
      setPayingItem(null);
    } catch (err) {
      error('Erro', err.message || 'Falha ao marcar como pago');
    } finally {
      setPayLoading(false);
    }
  };

  const totalEstoque = stock.reduce((sum, i) => sum + Number(i.valor_total || 0), 0);
  const totalPago = stock.filter(i => i.pago).reduce((sum, i) => sum + Number(i.valor_total || 0), 0);
  const totalPendente = totalEstoque - totalPago;
  const totalSacas = stock.reduce((sum, i) => sum + Number(i.quantidade_sacas || 0), 0);

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-zinc-500">Carregando dados...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-zinc-500">Total em Estoque</p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{totalSacas.toLocaleString('pt-BR')} sacas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-zinc-500">Valor Total</p>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalEstoque)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-zinc-500">Total Pago</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPago)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-zinc-500">Contas a Pagar</p>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(totalPendente)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerta Contas a Pagar */}
      {totalPendente > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          <div className="text-sm">
            <p className="font-semibold text-red-700 dark:text-red-300">
              Você tem {stock.filter(i => !i.pago).length} entrada(s) pendente(s) de pagamento
            </p>
            <p className="text-red-600 dark:text-red-400">
              Total pendente: {formatCurrency(totalPendente)}
            </p>
          </div>
        </div>
      )}

      {/* Lista */}
      <div>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-[var(--color-text)]">
            Estoque ({filteredStock.length} de {stock.length})
          </h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="mr-2 h-4 w-4" />
              {showFilters ? 'Ocultar Filtros' : 'Filtros'}
            </Button>
            <Button variant="primary" size="sm" onClick={() => setShowCreateForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Entrada
            </Button>
          </div>
        </div>

        {showFilters && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input icon={Search} placeholder="Buscar por produto, fornecedor ou NF..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <Select label="Pagamento" value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}>
                  <option value="todos">Todos</option>
                  <option value="pago">Pagos</option>
                  <option value="pendente">Pendentes</option>
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
            {filteredStock.map(item => (
              <Card key={item.id} className={`hover:shadow-md transition-shadow ${!item.pago ? 'border-l-4 border-l-red-400' : 'border-l-4 border-l-green-400'}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <Badge variant={item.pago ? 'success' : 'danger'}>
                          {item.pago ? 'Pago' : 'Pendente'}
                        </Badge>
                        {item.nota_fiscal && (
                          <span className="text-xs text-zinc-400">NF: {item.nota_fiscal}</span>
                        )}
                        <span className="text-xs text-zinc-400">
                          {formatDate(item.data_entrada || item.created_at)}
                        </span>
                      </div>

                      <h3 className="mt-2 font-semibold text-zinc-900 dark:text-zinc-50">
                        {item.produto}
                      </h3>

                      <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-zinc-500">
                        <span className="flex items-center gap-1">
                          <Factory className="h-3 w-3" />
                          {item.fornecedores?.nome}
                        </span>
                        <span className="flex items-center gap-1">
                          <Package className="h-3 w-3" />
                          {item.quantidade_sacas} sacas ({Number(item.peso_total_kg).toLocaleString('pt-BR')} kg)
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {formatCurrency(item.preco_pago_saca)}/saca
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3 text-green-500" />
                          Sugerido: {formatCurrency(item.preco_sugerido_saca)}/saca
                        </span>
                      </div>

                      <p className="mt-1 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        Total: {formatCurrency(item.valor_total)}
                      </p>
                    </div>

                    <div className="ml-4 flex flex-col gap-2">
                      {!item.pago && (
                        <Button variant="success" size="sm" onClick={() => setPayingItem(item)}>
                          <CheckCircle className="mr-2 h-4 w-4" /> Pagar
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => setEditingItem(item)}>
                        <Edit2 className="mr-2 h-4 w-4" /> Editar
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => setDeletingItem(item)}>
                        <Trash2 className="mr-2 h-4 w-4" /> Excluir
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Nova Entrada de Estoque */}
      <Modal isOpen={showCreateForm} onClose={() => setShowCreateForm(false)} title="Nova Entrada de Estoque" size="lg">
        {suppliers.length === 0 ? (
          <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
            <p>Cadastre pelo menos um <strong>fornecedor</strong> antes.</p>
          </div>
        ) : (
          <StockForm suppliers={suppliers} onSuccess={handleCreateSuccess} />
        )}
      </Modal>

      {editingItem && (
        <EditStockModal item={editingItem} suppliers={suppliers} isOpen={!!editingItem} onClose={() => setEditingItem(null)} onSuccess={handleRefetch} />
      )}

      <ConfirmDialog
        isOpen={!!payingItem}
        onClose={() => setPayingItem(null)}
        onConfirm={handleMarkAsPaid}
        title="Confirmar Pagamento"
        description={`Confirmar pagamento de ${formatCurrency(payingItem?.valor_total)} para ${payingItem?.produtos?.nome}? Esta ação registrará a data de pagamento como hoje.`}
        confirmText="Confirmar Pagamento"
        cancelText="Cancelar"
        variant="default"
        isLoading={payLoading}
      />

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
