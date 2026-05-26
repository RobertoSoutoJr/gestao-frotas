import { useState, useMemo } from 'react';

/**
 * Generic hook for sortable tables.
 *
 * @param {Array} items – the array to sort
 * @param {Object} [opts]
 * @param {string} [opts.defaultKey]   – initial sort column key
 * @param {'asc'|'desc'} [opts.defaultDir] – initial direction
 * @returns {{ sortedItems, sortKey, sortDir, requestSort, SortHeader }}
 *
 * Usage:
 *   const { sortedItems, SortHeader } = useSortable(filteredList);
 *   <SortHeader column="valor_total" label="Valor" align="right" />
 */
export function useSortable(items, { defaultKey = null, defaultDir = 'asc' } = {}) {
  const [sortKey, setSortKey] = useState(defaultKey);
  const [sortDir, setSortDir] = useState(defaultDir);

  const requestSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sortedItems = useMemo(() => {
    if (!sortKey) return items;

    return [...items].sort((a, b) => {
      let va = resolve(a, sortKey);
      let vb = resolve(b, sortKey);

      // Nulls / undefined always last
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;

      // Dates (ISO strings or Date objects)
      if (typeof va === 'string' && /^\d{4}-\d{2}/.test(va)) {
        va = new Date(va).getTime();
        vb = new Date(vb).getTime();
      }

      // Numbers
      if (typeof va === 'number' || (typeof va === 'string' && va !== '' && !isNaN(Number(va)))) {
        va = Number(va);
        vb = Number(vb);
        return sortDir === 'asc' ? va - vb : vb - va;
      }

      // Strings
      const sa = String(va).toLowerCase();
      const sb = String(vb).toLowerCase();
      const cmp = sa.localeCompare(sb, 'pt-BR');
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [items, sortKey, sortDir]);

  return { sortedItems, sortKey, sortDir, requestSort };
}

/** Resolve nested keys like "caminhoes.placa" */
function resolve(obj, path) {
  return path.split('.').reduce((o, k) => o?.[k], obj);
}
