import { useState, useMemo } from 'react';

const DEFAULT_PER_PAGE = 15;

export function usePagination(items, perPage = DEFAULT_PER_PAGE) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / perPage));

  // Reset to page 1 if items change and current page is out of range
  const safePage = page > totalPages ? 1 : page;

  const paginatedItems = useMemo(() => {
    const start = (safePage - 1) * perPage;
    return items.slice(start, start + perPage);
  }, [items, safePage, perPage]);

  return {
    page: safePage,
    totalPages,
    totalItems: items.length,
    paginatedItems,
    setPage,
    nextPage: () => setPage(p => Math.min(p + 1, totalPages)),
    prevPage: () => setPage(p => Math.max(p - 1, 1)),
    isFirstPage: safePage === 1,
    isLastPage: safePage === totalPages,
  };
}
