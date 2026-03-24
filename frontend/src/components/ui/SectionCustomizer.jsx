import { useState } from 'react';
import { Modal } from './Modal';
import { Settings, Eye, EyeOff, ChevronUp, ChevronDown, RotateCcw } from 'lucide-react';

/**
 * SectionCustomizer — modal de personalização reutilizável
 *
 * Props:
 * - storageKey: string — chave no localStorage
 * - sections: Array<{ id, label, description, icon? }> — seções disponíveis
 * - defaultOrder: string[] — ordem padrão dos IDs
 * - defaultVisibility: Record<string, boolean> — visibilidade padrão
 * - children: (prefs) => ReactNode — render prop
 * - title?: string — título do modal
 * - extraControls?: (prefs, setPrefs) => ReactNode — controles extras no modal (ex: período)
 */

const STORAGE_VERSION = 1;

function loadPrefs(storageKey, defaultOrder, defaultVisibility) {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    if (saved._v !== STORAGE_VERSION) return null;
    return saved;
  } catch {
    return null;
  }
}

export function useSectionPrefs(storageKey, defaultOrder, defaultVisibility) {
  const [prefs, setPrefsState] = useState(() => {
    const saved = loadPrefs(storageKey, defaultOrder, defaultVisibility);
    if (saved) {
      // Merge: add new sections that didn't exist when user saved
      const order = [...saved.order];
      const visibility = { ...defaultVisibility, ...saved.visibility };
      defaultOrder.forEach(id => {
        if (!order.includes(id)) order.push(id);
      });
      // Remove sections that no longer exist
      const validOrder = order.filter(id => defaultOrder.includes(id));
      return { order: validOrder, visibility, _v: STORAGE_VERSION, ...(saved.extra || {}) };
    }
    return { order: [...defaultOrder], visibility: { ...defaultVisibility }, _v: STORAGE_VERSION };
  });

  const setPrefs = (updater) => {
    setPrefsState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      localStorage.setItem(storageKey, JSON.stringify({ ...next, _v: STORAGE_VERSION }));
      return next;
    });
  };

  const isVisible = (id) => prefs.visibility[id] !== false;
  const getOrder = () => prefs.order;

  const moveUp = (id) => {
    setPrefs(prev => {
      const order = [...prev.order];
      const idx = order.indexOf(id);
      if (idx <= 0) return prev;
      [order[idx - 1], order[idx]] = [order[idx], order[idx - 1]];
      return { ...prev, order };
    });
  };

  const moveDown = (id) => {
    setPrefs(prev => {
      const order = [...prev.order];
      const idx = order.indexOf(id);
      if (idx < 0 || idx >= order.length - 1) return prev;
      [order[idx], order[idx + 1]] = [order[idx + 1], order[idx]];
      return { ...prev, order };
    });
  };

  const toggleVisibility = (id) => {
    setPrefs(prev => ({
      ...prev,
      visibility: { ...prev.visibility, [id]: !prev.visibility[id] }
    }));
  };

  const reset = () => {
    setPrefs({ order: [...defaultOrder], visibility: { ...defaultVisibility }, _v: STORAGE_VERSION });
  };

  return { prefs, setPrefs, isVisible, getOrder, moveUp, moveDown, toggleVisibility, reset };
}

export function SectionCustomizerButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:border-[var(--color-border-hover)] transition-all duration-200"
    >
      <Settings className="h-4 w-4" />
      <span className="hidden sm:inline">Personalizar</span>
    </button>
  );
}

export function SectionCustomizerModal({
  isOpen,
  onClose,
  title = 'Personalizar',
  sections,
  prefs,
  moveUp,
  moveDown,
  toggleVisibility,
  reset,
  extraControls
}) {
  const orderedSections = prefs.order
    .map(id => sections.find(s => s.id === id))
    .filter(Boolean);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-5">
        {extraControls && extraControls}

        {/* Section order + visibility */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
              Seções (arraste para reordenar)
            </p>
            <button
              onClick={reset}
              className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              Resetar
            </button>
          </div>
          <div className="space-y-1">
            {orderedSections.map((section, idx) => {
              const visible = prefs.visibility[section.id] !== false;
              const IconComp = section.icon;
              return (
                <div
                  key={section.id}
                  className={`flex items-center gap-2 rounded-xl px-2 py-2.5 transition-colors duration-150 ${
                    visible ? 'bg-[var(--color-bg-elevated)]' : 'opacity-50'
                  }`}
                >
                  {/* Reorder buttons */}
                  <div className="flex flex-col gap-0.5 shrink-0">
                    <button
                      onClick={() => moveUp(section.id)}
                      disabled={idx === 0}
                      className="flex h-5 w-5 items-center justify-center rounded text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)] disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => moveDown(section.id)}
                      disabled={idx === orderedSections.length - 1}
                      className="flex h-5 w-5 items-center justify-center rounded text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)] disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Icon */}
                  {IconComp && (
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors ${
                      visible ? 'bg-[var(--color-accent)]/15 text-[var(--color-accent)]' : 'bg-[var(--color-bg)] text-[var(--color-text-secondary)]'
                    }`}>
                      <IconComp className="h-3.5 w-3.5" />
                    </div>
                  )}

                  {/* Label */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate transition-colors ${
                      visible ? 'text-[var(--color-text)]' : 'text-[var(--color-text-secondary)]'
                    }`}>
                      {section.label}
                    </p>
                    {section.description && (
                      <p className="text-[10px] text-[var(--color-text-secondary)] truncate">
                        {section.description}
                      </p>
                    )}
                  </div>

                  {/* Toggle switch */}
                  <button
                    onClick={() => toggleVisibility(section.id)}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${
                      visible ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]'
                    }`}
                  >
                    <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                      visible ? 'translate-x-[22px]' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
}
