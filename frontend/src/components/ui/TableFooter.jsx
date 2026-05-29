import { formatCurrency, formatNumber } from '../../lib/utils';

/**
 * Table footer with aggregated totals.
 *
 * @param {Array<{label, value, format?}>} totals — array of total items
 *   format: 'currency' | 'number' | 'text' (default: 'text')
 * @param {number} totalItems — total count of items
 * @param {number} filteredItems — filtered count
 */
export function TableFooter({ totals = [], totalItems, filteredItems }) {
  if (totals.length === 0 && !totalItems) return null;

  const formatValue = (value, format) => {
    switch (format) {
      case 'currency': return formatCurrency(value);
      case 'number': return formatNumber(value);
      case 'liters': return `${formatNumber(value)} L`;
      case 'km': return `${formatNumber(value, 0)} km`;
      default: return value;
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[var(--color-border)] px-4 py-3 bg-[var(--color-surface)]/50">
      {/* Record count */}
      <span className="text-xs text-[var(--color-text-secondary)]">
        {filteredItems !== undefined && filteredItems !== totalItems
          ? `${filteredItems} de ${totalItems} registros`
          : `${totalItems} registro${totalItems !== 1 ? 's' : ''}`
        }
      </span>

      {/* Separator */}
      {totals.length > 0 && (
        <div className="h-3.5 w-px bg-[var(--color-border)]" />
      )}

      {/* Totals */}
      {totals.map((t, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <span className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wider">{t.label}:</span>
          <span className={`text-xs font-semibold tabular-nums ${t.color || 'text-[var(--color-text)]'}`}>
            {formatValue(t.value, t.format)}
          </span>
        </div>
      ))}
    </div>
  );
}
