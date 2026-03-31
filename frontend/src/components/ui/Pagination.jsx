import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Pagination({ page, totalPages, totalItems, setPage, nextPage, prevPage, isFirstPage, isLastPage, perPage = 15 }) {
  if (totalItems <= perPage) return null;

  const start = (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, totalItems);

  // Generate page numbers to show
  const pages = [];
  const maxVisible = 5;
  let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);
  if (endPage - startPage + 1 < maxVisible) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4">
      <span className="text-xs text-[var(--color-text-tertiary)]">
        {start}–{end} de {totalItems}
      </span>

      <div className="flex items-center gap-1">
        <button
          onClick={prevPage}
          disabled={isFirstPage}
          className="flex items-center justify-center h-8 w-8 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {startPage > 1 && (
          <>
            <button
              onClick={() => setPage(1)}
              className="flex items-center justify-center h-8 min-w-[2rem] rounded-lg border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] transition-colors cursor-pointer"
            >
              1
            </button>
            {startPage > 2 && <span className="text-[var(--color-text-tertiary)] px-1">...</span>}
          </>
        )}

        {pages.map(p => (
          <button
            key={p}
            onClick={() => setPage(p)}
            className={`flex items-center justify-center h-8 min-w-[2rem] rounded-lg border text-xs transition-colors cursor-pointer ${
              p === page
                ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-white font-medium'
                : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'
            }`}
          >
            {p}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="text-[var(--color-text-tertiary)] px-1">...</span>}
            <button
              onClick={() => setPage(totalPages)}
              className="flex items-center justify-center h-8 min-w-[2rem] rounded-lg border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] transition-colors cursor-pointer"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={nextPage}
          disabled={isLastPage}
          className="flex items-center justify-center h-8 w-8 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
