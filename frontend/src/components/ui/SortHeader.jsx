import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

/**
 * Clickable table header cell for sorting.
 *
 * @param {string}  column    – the key used by useSortable
 * @param {string}  label     – visible text
 * @param {string}  sortKey   – current sort key from useSortable
 * @param {string}  sortDir   – current direction from useSortable
 * @param {Function} onSort   – requestSort from useSortable
 * @param {'left'|'right'|'center'} [align='left']
 * @param {string}  [className] – extra classes (e.g. responsive hiding)
 */
export function SortHeader({ column, label, sortKey, sortDir, onSort, align = 'left', className = '' }) {
  const active = sortKey === column;

  const alignClass = align === 'right' ? 'text-right justify-end' : align === 'center' ? 'text-center justify-center' : 'text-left';

  return (
    <th
      className={`px-4 py-3 font-medium text-[var(--color-text-secondary)] select-none cursor-pointer hover:text-[var(--color-text)] transition-colors ${alignClass} ${className}`}
      onClick={() => onSort(column)}
    >
      <span className={`inline-flex items-center gap-1 ${align === 'right' ? 'flex-row-reverse' : ''}`}>
        {label}
        <span className={`transition-opacity ${active ? 'opacity-100' : 'opacity-30'}`}>
          {active ? (
            sortDir === 'asc' ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )
          ) : (
            <ChevronsUpDown className="h-3 w-3" />
          )}
        </span>
      </span>
    </th>
  );
}
