import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Truck, Users, Building2, Factory, Route, Fuel, Wrench } from 'lucide-react';

const ENTITY_CONFIG = {
  trucks: { label: 'Caminhoes', icon: Truck, path: '/trucks', color: '#5E6AD2', fields: ['placa', 'modelo'] },
  drivers: { label: 'Motoristas', icon: Users, path: '/drivers', color: '#8B5CF6', fields: ['nome', 'telefone', 'numero_cnh'] },
  clients: { label: 'Clientes', icon: Building2, path: '/clients', color: '#06B6D4', fields: ['nome', 'cidade', 'cpf_cnpj', 'telefone'] },
  suppliers: { label: 'Fornecedores', icon: Factory, path: '/suppliers', color: '#F97316', fields: ['nome', 'cidade', 'cpf_cnpj', 'telefone'] },
  trips: { label: 'Viagens', icon: Route, path: '/trips', color: '#10B981', fields: ['produto', 'origem_cidade', 'destino_cidade', 'observacoes'] },
};

function getDisplayName(item, type) {
  switch (type) {
    case 'trucks': return `${item.placa} — ${item.modelo || 'Sem modelo'}`;
    case 'drivers': return item.nome;
    case 'clients': return `${item.nome}${item.cidade ? ` (${item.cidade})` : ''}`;
    case 'suppliers': return `${item.nome}${item.cidade ? ` (${item.cidade})` : ''}`;
    case 'trips': return `#${item.id} ${item.produto || ''} — ${item.origem_cidade || '?'} → ${item.destino_cidade || '?'}`;
    default: return item.nome || item.placa || `#${item.id}`;
  }
}

function getSubtext(item, type) {
  switch (type) {
    case 'trucks': return item.ano ? `Ano ${item.ano}` : null;
    case 'drivers': return item.telefone || null;
    case 'clients':
    case 'suppliers': return item.cpf_cnpj || item.telefone || null;
    case 'trips': return item.status === 'finalizada' ? 'Finalizada' : 'Em andamento';
    default: return null;
  }
}

export function GlobalSearch({ data, autoFocus, onSelect }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Keyboard shortcut: Ctrl+K or Cmd+K to focus
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const results = useMemo(() => {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase();
    const grouped = [];

    for (const [type, config] of Object.entries(ENTITY_CONFIG)) {
      const items = data[type] || [];
      const matches = items.filter(item =>
        config.fields.some(field => {
          const val = item[field];
          return val && String(val).toLowerCase().includes(q);
        })
      ).slice(0, 5);

      if (matches.length > 0) {
        grouped.push({ type, config, matches });
      }
    }

    return grouped;
  }, [query, data]);

  const flatResults = useMemo(() => {
    const flat = [];
    results.forEach(group => {
      group.matches.forEach(item => {
        flat.push({ item, type: group.type, config: group.config });
      });
    });
    return flat;
  }, [results]);

  // Auto-focus for mobile overlay
  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [autoFocus]);

  const handleSelect = useCallback((type, item) => {
    const config = ENTITY_CONFIG[type];
    navigate(config.path);
    setIsOpen(false);
    setQuery('');
    onSelect?.();
  }, [navigate, onSelect]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, flatResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && flatResults[selectedIndex]) {
      const { type, item } = flatResults[selectedIndex];
      handleSelect(type, item);
    }
  }, [flatResults, selectedIndex, handleSelect]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const totalResults = flatResults.length;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-tertiary)]" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Buscar... (Ctrl+K)"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] pl-9 pr-8 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] transition-colors"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setIsOpen(false); }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text)]"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Results dropdown */}
      {isOpen && query.length >= 2 && (
        <div className="absolute z-[100] mt-2 w-full min-w-[320px] max-h-[400px] overflow-y-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] shadow-[0_16px_48px_var(--color-shadow)]">
          {totalResults === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-[var(--color-text-secondary)]">
              Nenhum resultado para "{query}"
            </div>
          ) : (
            <>
              {results.map(group => {
                const Icon = group.config.icon;
                return (
                  <div key={group.type}>
                    <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--color-border)]">
                      <Icon className="h-3.5 w-3.5" style={{ color: group.config.color }} />
                      <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: group.config.color }}>
                        {group.config.label} ({group.matches.length})
                      </span>
                    </div>
                    {group.matches.map((item, i) => {
                      const flatIdx = flatResults.findIndex(f => f.item === item && f.type === group.type);
                      const isSelected = flatIdx === selectedIndex;
                      const subtext = getSubtext(item, group.type);
                      return (
                        <button
                          key={`${group.type}-${item.id}`}
                          onClick={() => handleSelect(group.type, item)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                            isSelected
                              ? 'bg-[var(--color-accent)]/10 text-[var(--color-text)]'
                              : 'text-[var(--color-text)] hover:bg-[var(--color-bg-hover)]'
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="truncate font-medium">{getDisplayName(item, group.type)}</p>
                            {subtext && <p className="text-xs text-[var(--color-text-secondary)] truncate">{subtext}</p>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
              <div className="px-3 py-2 border-t border-[var(--color-border)] text-[10px] text-[var(--color-text-tertiary)] text-center">
                {totalResults} resultado{totalResults > 1 ? 's' : ''} — Use setas e Enter para navegar
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
