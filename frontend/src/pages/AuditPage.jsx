import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { Pagination } from '../components/ui/Pagination';
import { PageSkeleton } from '../components/ui/Skeleton';
import { ClipboardList, User, Clock, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { auditService } from '../services/audit';
import { formatDate } from '../lib/utils';

const ENTITY_LABELS = {
  caminhao: 'Caminhao',
  motorista: 'Motorista',
  abastecimento: 'Abastecimento',
  manutencao: 'Manutencao',
  viagem: 'Viagem',
};

const ACTION_LABELS = {
  criar: 'Criou',
  editar: 'Editou',
  excluir: 'Excluiu',
  finalizar: 'Finalizou',
};

const ACTION_COLORS = {
  criar: 'success',
  editar: 'warning',
  excluir: 'danger',
  finalizar: 'info',
};

export function AuditPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState(null);
  const limit = 20;

  // Filters
  const [filters, setFilters] = useState({
    entidade_tipo: '',
    acao: '',
    start_date: '',
    end_date: '',
  });

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (filters.entidade_tipo) params.entidade_tipo = filters.entidade_tipo;
      if (filters.acao) params.acao = filters.acao;
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;

      const res = await auditService.list(params);
      setLogs(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleFilterChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setPage(1);
  };

  const totalPages = Math.ceil(total / limit);

  if (loading && logs.length === 0) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-accent)]/10">
          <ClipboardList className="h-5 w-5 text-[var(--color-accent)]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Auditoria</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Historico de acoes no sistema ({total} registros)
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Select
              name="entidade_tipo"
              label="Entidade"
              value={filters.entidade_tipo}
              onChange={handleFilterChange}
            >
              <option value="">Todas</option>
              <option value="caminhao">Caminhao</option>
              <option value="motorista">Motorista</option>
              <option value="abastecimento">Abastecimento</option>
              <option value="manutencao">Manutencao</option>
              <option value="viagem">Viagem</option>
            </Select>

            <Select
              name="acao"
              label="Acao"
              value={filters.acao}
              onChange={handleFilterChange}
            >
              <option value="">Todas</option>
              <option value="criar">Criar</option>
              <option value="editar">Editar</option>
              <option value="excluir">Excluir</option>
              <option value="finalizar">Finalizar</option>
            </Select>

            <Input
              name="start_date"
              label="Data inicio"
              type="date"
              value={filters.start_date}
              onChange={handleFilterChange}
            />

            <Input
              name="end_date"
              label="Data fim"
              type="date"
              value={filters.end_date}
              onChange={handleFilterChange}
            />
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      {logs.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Nenhum registro encontrado"
          description="Nenhuma acao registrada com os filtros selecionados."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)]">
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Data/Hora</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Usuario</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Acao</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Entidade</th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">ID</th>
                    <th className="px-4 py-3 text-center font-medium text-[var(--color-text-secondary)]">Detalhes</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <AuditRow
                      key={log.id}
                      log={log}
                      expanded={expandedId === log.id}
                      onToggle={() => setExpandedId(expandedId === log.id ? null : log.id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}

function AuditRow({ log, expanded, onToggle }) {
  const actionLabel = ACTION_LABELS[log.acao] || log.acao;
  const actionColor = ACTION_COLORS[log.acao] || 'default';
  const entityLabel = ENTITY_LABELS[log.entidade_tipo] || log.entidade_tipo;

  return (
    <>
      <tr
        className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg-elevated)]/50 cursor-pointer transition-colors"
        onClick={onToggle}
      >
        <td className="px-4 py-3">
          <div className="flex items-center gap-1.5 text-[var(--color-text-secondary)]">
            <Clock className="h-3.5 w-3.5" />
            <span className="tabular-nums">{formatDateTime(log.created_at)}</span>
          </div>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-[var(--color-text-secondary)]" />
            <span className="text-[var(--color-text)]">{log.user_nome || 'Sistema'}</span>
          </div>
        </td>
        <td className="px-4 py-3">
          <Badge variant={actionColor}>{actionLabel}</Badge>
        </td>
        <td className="px-4 py-3 text-[var(--color-text)]">
          {entityLabel}
        </td>
        <td className="px-4 py-3 text-[var(--color-text-secondary)] tabular-nums">
          #{log.entidade_id || '-'}
        </td>
        <td className="px-4 py-3 text-center">
          {(log.dados_antes || log.dados_depois) ? (
            expanded ? (
              <ChevronUp className="h-4 w-4 text-[var(--color-text-secondary)] mx-auto" />
            ) : (
              <ChevronDown className="h-4 w-4 text-[var(--color-text-secondary)] mx-auto" />
            )
          ) : (
            <span className="text-[var(--color-text-secondary)]">-</span>
          )}
        </td>
      </tr>

      {/* Expanded details */}
      {expanded && (log.dados_antes || log.dados_depois) && (
        <tr className="bg-[var(--color-bg-elevated)]/30">
          <td colSpan={6} className="px-4 py-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {log.dados_antes && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-red-400">Antes</p>
                  <pre className="rounded-lg bg-[var(--color-bg)] p-3 text-xs text-[var(--color-text-secondary)] overflow-auto max-h-48">
                    {JSON.stringify(log.dados_antes, null, 2)}
                  </pre>
                </div>
              )}
              {log.dados_depois && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-green-400">Depois</p>
                  <pre className="rounded-lg bg-[var(--color-bg)] p-3 text-xs text-[var(--color-text-secondary)] overflow-auto max-h-48">
                    {JSON.stringify(log.dados_depois, null, 2)}
                  </pre>
                </div>
              )}
            </div>
            {log.ip && (
              <p className="mt-2 text-xs text-[var(--color-text-secondary)]">IP: {log.ip}</p>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

function formatDateTime(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}
