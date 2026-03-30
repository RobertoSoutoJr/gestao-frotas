import { useState, useEffect } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';
import { Badge } from './Badge';
import { Plus, Trash2, Receipt, X, ChevronDown, ChevronUp } from 'lucide-react';
import { tripsService } from '../../services/trips';
import { formatCurrency, formatDate } from '../../lib/utils';
import { useToast } from '../../hooks/useToast';

const COST_TYPES = [
  { value: 'combustivel', label: 'Combustível', color: 'text-orange-400' },
  { value: 'pedagio', label: 'Pedágio', color: 'text-blue-400' },
  { value: 'manutencao', label: 'Manutenção', color: 'text-red-400' },
  { value: 'alimentacao', label: 'Alimentação', color: 'text-yellow-400' },
  { value: 'hospedagem', label: 'Hospedagem', color: 'text-purple-400' },
  { value: 'multa', label: 'Multa', color: 'text-red-500' },
  { value: 'outros', label: 'Outros', color: 'text-gray-400' },
];

export function TripCostsPanel({ tripId, readOnly = false, onTotalsChange }) {
  const { addToast } = useToast();
  const [costs, setCosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ tipo: 'pedagio', descricao: '', valor: '', data: '' });

  const fetchCosts = async (notifyParent = false) => {
    try {
      setLoading(true);
      const res = await tripsService.getCosts(tripId);
      setCosts(res.data || []);
      setFetched(true);
      if (notifyParent && onTotalsChange) {
        onTotalsChange();
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  // Only fetch when panel is expanded for the first time
  useEffect(() => {
    if (expanded && !fetched) {
      fetchCosts();
    }
  }, [expanded]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.valor || Number(form.valor) <= 0) {
      addToast('Valor deve ser positivo', 'error');
      return;
    }
    setSaving(true);
    try {
      await tripsService.addCost(tripId, {
        tipo: form.tipo,
        descricao: form.descricao || null,
        valor: Number(form.valor),
        data: form.data || null,
      });
      setForm({ tipo: 'pedagio', descricao: '', valor: '', data: '' });
      setShowForm(false);
      addToast('Custo adicionado', 'success');
      fetchCosts(true);
    } catch (err) {
      addToast(err.message || 'Erro ao adicionar custo', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await tripsService.deleteCost(id);
      addToast('Custo removido', 'success');
      fetchCosts(true);
    } catch (err) {
      addToast(err.message || 'Erro ao remover', 'error');
    }
  };

  const total = costs.reduce((s, c) => s + Number(c.valor), 0);
  const getTypeConfig = (tipo) => COST_TYPES.find(t => t.value === tipo) || COST_TYPES[6];

  return (
    <div className="mt-2">
      {/* Summary bar */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] px-3 py-2 text-xs cursor-pointer hover:bg-[var(--color-surface-hover)] transition-colors"
      >
        <span className="flex items-center gap-2">
          <Receipt className="h-3.5 w-3.5 text-[var(--color-text-secondary)]" />
          <span className="font-medium text-[var(--color-text)]">
            {costs.length} custo{costs.length !== 1 ? 's' : ''} detalhado{costs.length !== 1 ? 's' : ''}
          </span>
          {total > 0 && (
            <span className="text-red-400 font-medium">{formatCurrency(total)}</span>
          )}
        </span>
        {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="mt-2 space-y-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-3">
          {loading && (
            <p className="text-xs text-[var(--color-text-secondary)] text-center py-2">Carregando custos...</p>
          )}
          {/* Cost list */}
          {!loading && costs.length === 0 ? (
            <p className="text-xs text-[var(--color-text-secondary)] text-center py-2">
              Nenhum custo detalhado registrado
            </p>
          ) : (
            <div className="space-y-1.5">
              {costs.map(cost => {
                const tc = getTypeConfig(cost.tipo);
                return (
                  <div key={cost.id} className="flex items-center justify-between rounded-md bg-[var(--color-surface)] px-3 py-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Badge variant="default" className="text-[10px] shrink-0">
                        <span className={tc.color}>{tc.label}</span>
                      </Badge>
                      {cost.descricao && (
                        <span className="text-xs text-[var(--color-text-secondary)] truncate">{cost.descricao}</span>
                      )}
                      {cost.data && (
                        <span className="text-[10px] text-[var(--color-text-tertiary)] shrink-0">{formatDate(cost.data)}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="text-xs font-medium text-red-400">{formatCurrency(Number(cost.valor))}</span>
                      {!readOnly && (
                        <button
                          onClick={() => handleDelete(cost.id)}
                          className="text-[var(--color-text-tertiary)] hover:text-red-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Summary by type */}
          {costs.length > 1 && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-[var(--color-border)]">
              {COST_TYPES.filter(t => costs.some(c => c.tipo === t.value)).map(t => {
                const typeTotal = costs.filter(c => c.tipo === t.value).reduce((s, c) => s + Number(c.valor), 0);
                return (
                  <span key={t.value} className="text-[10px] text-[var(--color-text-secondary)]">
                    <span className={t.color}>{t.label}:</span> {formatCurrency(typeTotal)}
                  </span>
                );
              })}
            </div>
          )}

          {/* Add form */}
          {!readOnly && (
            <>
              {showForm ? (
                <form onSubmit={handleAdd} className="space-y-2 pt-2 border-t border-[var(--color-border)]">
                  <div className="grid grid-cols-2 gap-2">
                    <Select label="Tipo" value={form.tipo} onChange={(e) => setForm(p => ({ ...p, tipo: e.target.value }))}>
                      {COST_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </Select>
                    <Input label="Valor (R$)" type="number" step="0.01" placeholder="0,00" value={form.valor} onChange={(e) => setForm(p => ({ ...p, valor: e.target.value }))} required />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input label="Descrição (opcional)" placeholder="Ex: Pedagio BR-262" value={form.descricao} onChange={(e) => setForm(p => ({ ...p, descricao: e.target.value }))} />
                    <Input label="Data" type="date" value={form.data} onChange={(e) => setForm(p => ({ ...p, data: e.target.value }))} />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancelar</Button>
                    <Button type="submit" variant="primary" size="sm" disabled={saving}>
                      {saving ? 'Salvando...' : 'Adicionar'}
                    </Button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setShowForm(true)}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-[var(--color-border)] py-2 text-xs text-[var(--color-text-secondary)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Adicionar custo
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
