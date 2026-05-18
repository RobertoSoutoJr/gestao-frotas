import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { TrendingUp, X, CheckCircle, Zap, Rocket, Crown } from 'lucide-react';
import { Button } from '../components/ui/Button';

const PlanLimitContext = createContext(null);

const WHATSAPP_NUMBER = '5500000000000';

const PLANS_INFO = {
  free: {
    nome: 'Gratuito',
    preco: 'R$ 0',
    icon: Zap,
    color: 'text-zinc-400',
    bg: 'bg-zinc-500/10',
    border: 'border-zinc-500/20',
  },
  pro: {
    nome: 'Profissional',
    preco: 'R$ 49,90/mês',
    icon: Rocket,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
  },
  enterprise: {
    nome: 'Empresarial',
    preco: 'R$ 149,90/mês',
    icon: Crown,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
};

const UPGRADE_FEATURES = [
  { plan: 'pro', features: ['Até 20 caminhões', 'Até 20 motoristas', 'Até 500 viagens/mês', '10 contas de motorista', 'Relatórios avançados', 'Exportação PDF/Excel'] },
  { plan: 'enterprise', features: ['Caminhões ilimitados', 'Motoristas ilimitados', 'Viagens ilimitadas', 'Contas ilimitadas', 'API access', 'Suporte dedicado'] },
];

function PlanLimitModal({ isOpen, message, onClose }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => dialogRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => { if (e.key === 'Escape' && isOpen) onClose(); };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleUpgrade = (planKey) => {
    const planName = PLANS_INFO[planKey]?.nome || planKey;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Olá! Gostaria de fazer upgrade para o plano ${planName} do FuelTrack.`)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center sm:p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" aria-hidden="true" />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Limite do plano atingido"
        tabIndex={-1}
        className="relative w-full sm:max-w-lg outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-border-hover)] rounded-t-2xl sm:rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.5)]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/15">
                <TrendingUp className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[var(--color-text)]">Limite do plano atingido</h2>
                <p className="text-xs text-[var(--color-text-secondary)]">Faça upgrade para continuar</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer"
              aria-label="Fechar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <div className="px-5 py-5 space-y-5">
            {/* Message */}
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/8 px-4 py-3">
              <p className="text-sm text-amber-300 leading-relaxed">{message}</p>
            </div>

            {/* Plan cards */}
            <div className="grid grid-cols-2 gap-3">
              {UPGRADE_FEATURES.map(({ plan, features }) => {
                const info = PLANS_INFO[plan];
                const Icon = info.icon;
                return (
                  <div
                    key={plan}
                    className={`rounded-xl border ${info.border} ${info.bg} p-4 flex flex-col gap-3`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${info.color}`} />
                      <span className={`text-sm font-semibold ${info.color}`}>{info.nome}</span>
                    </div>
                    <p className="text-xs font-medium text-[var(--color-text-secondary)]">{info.preco}</p>
                    <ul className="space-y-1.5">
                      {features.map((f) => (
                        <li key={f} className="flex items-start gap-1.5 text-xs text-[var(--color-text-secondary)]">
                          <CheckCircle className="mt-0.5 h-3 w-3 shrink-0 text-emerald-400" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Button
                      variant={plan === 'enterprise' ? 'primary' : 'outline'}
                      size="sm"
                      className="w-full mt-auto"
                      onClick={() => handleUpgrade(plan)}
                    >
                      Quero este plano
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-[var(--color-border)] px-5 py-3 flex justify-end">
            <button
              onClick={onClose}
              className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
            >
              Continuar no plano atual
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PlanLimitProvider({ children }) {
  const [state, setState] = useState({ isOpen: false, message: '' });

  const showPlanLimit = useCallback((message) => {
    setState({ isOpen: true, message });
  }, []);

  const hidePlanLimit = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  // Listen for global plan limit events dispatched by the API interceptor
  useEffect(() => {
    const handler = (e) => showPlanLimit(e.detail?.message || 'Limite do plano atingido.');
    window.addEventListener('planLimitReached', handler);
    return () => window.removeEventListener('planLimitReached', handler);
  }, [showPlanLimit]);

  return (
    <PlanLimitContext.Provider value={{ showPlanLimit }}>
      {children}
      <PlanLimitModal isOpen={state.isOpen} message={state.message} onClose={hidePlanLimit} />
    </PlanLimitContext.Provider>
  );
}

export function usePlanLimit() {
  const ctx = useContext(PlanLimitContext);
  if (!ctx) throw new Error('usePlanLimit must be used within PlanLimitProvider');
  return ctx;
}
