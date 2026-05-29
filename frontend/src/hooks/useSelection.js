import { useState, useCallback, useMemo } from 'react';

/**
 * Hook for bulk row selection in tables.
 *
 * @param {Array} items — the current visible/filtered items
 * @param {string} [idKey='id'] — property to use as unique identifier
 */
export function useSelection(items, idKey = 'id') {
  const [selectedIds, setSelectedIds] = useState(new Set());

  const toggle = useCallback((id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelectedIds(prev => {
      const allIds = items.map(i => i[idKey]);
      const allSelected = allIds.length > 0 && allIds.every(id => prev.has(id));
      if (allSelected) return new Set();
      return new Set(allIds);
    });
  }, [items, idKey]);

  const clear = useCallback(() => setSelectedIds(new Set()), []);

  const isSelected = useCallback((id) => selectedIds.has(id), [selectedIds]);

  const allSelected = useMemo(() => {
    if (items.length === 0) return false;
    return items.every(i => selectedIds.has(i[idKey]));
  }, [items, selectedIds, idKey]);

  const someSelected = useMemo(() => {
    return items.some(i => selectedIds.has(i[idKey])) && !allSelected;
  }, [items, selectedIds, idKey, allSelected]);

  const selectedItems = useMemo(() => {
    return items.filter(i => selectedIds.has(i[idKey]));
  }, [items, selectedIds, idKey]);

  const count = selectedIds.size;

  return {
    selectedIds, selectedItems, count,
    toggle, toggleAll, clear,
    isSelected, allSelected, someSelected,
  };
}
