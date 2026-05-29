import { Search, X, Trash2, Download } from 'lucide-react';
import { Button } from './Button';

/**
 * Inline toolbar for power tables.
 * Shows search, active filter chips, bulk actions, and export.
 *
 * @param {string} searchTerm
 * @param {function} onSearchChange
 * @param {string} searchPlaceholder
 * @param {Array<{label, active, onClear}>} filterChips — active filters as removable chips
 * @param {number} selectionCount — number of selected rows
 * @param {function} onBulkDelete — handler for bulk delete
 * @param {function} onClearSelection
 * @param {function} onExport — CSV export handler
 * @param {React.ReactNode} children — extra filter controls (selects, etc.)
 */
export function TableToolbar({
  searchTerm,
  onSearchChange,
  searchPlaceholder = 'Buscar...',
  filterChips = [],
  selectionCount = 0,
  onBulkDelete,
  onClearSelection,
  onExport,
  children,
}) {
  const activeChips = filterChips.filter(c => c.active);
  const hasSelection = selectionCount > 0;

  return (
    <div className="space-y-2">
      {/* Main row: search + actions */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] pl-9 pr-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Inline filter controls */}
        {children && (
          <div className="flex items-center gap-2 flex-wrap">
            {children}
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Export */}
        {onExport && !hasSelection && (
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="h-3.5 w-3.5 mr-1.5" />
            <span className="hidden sm:inline">Exportar</span>
          </Button>
        )}
      </div>

      {/* Bulk action bar */}
      {hasSelection && (
        <div className="flex items-center gap-3 rounded-lg border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 px-4 py-2">
          <span className="text-sm font-medium text-[var(--color-accent)]">
            {selectionCount} selecionado{selectionCount > 1 ? 's' : ''}
          </span>
          <div className="flex-1" />
          {onBulkDelete && (
            <Button variant="danger" size="sm" onClick={onBulkDelete}>
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Excluir
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onClearSelection}>
            Cancelar
          </Button>
        </div>
      )}

      {/* Active filter chips */}
      {activeChips.length > 0 && !hasSelection && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wider mr-1">Filtros:</span>
          {activeChips.map((chip, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 rounded-md bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 px-2 py-0.5 text-xs font-medium text-[var(--color-accent)]"
            >
              {chip.label}
              <button onClick={chip.onClear} className="hover:text-[var(--color-text)] transition-colors ml-0.5">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {activeChips.length > 1 && (
            <button
              onClick={() => activeChips.forEach(c => c.onClear())}
              className="text-[10px] text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors ml-1"
            >
              Limpar todos
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Inline filter select (compact, no label)
 */
export function FilterSelect({ value, onChange, placeholder, children, className = '' }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-xs text-[var(--color-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] transition-colors cursor-pointer ${value ? 'border-[var(--color-accent)]/40' : ''} ${className}`}
    >
      <option value="">{placeholder}</option>
      {children}
    </select>
  );
}
