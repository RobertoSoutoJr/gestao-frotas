import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, CheckCheck, AlertTriangle, Wrench, Fuel, IdCard, X } from 'lucide-react';
import { notificationsService } from '../../services/notifications';
import { cn } from '../../lib/utils';

const POLL_INTERVAL = 60_000; // 60s

const TIPO_CONFIG = {
  cnh_vencendo: { icon: IdCard, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  manutencao_atrasada: { icon: Wrench, color: 'text-red-500', bg: 'bg-red-500/10' },
  consumo_alto: { icon: Fuel, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  default: { icon: AlertTriangle, color: 'text-blue-500', bg: 'bg-blue-500/10' },
};

function getConfig(tipo) {
  return TIPO_CONFIG[tipo] || TIPO_CONFIG.default;
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'agora';
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);
  const navigate = useNavigate();

  const fetchCount = useCallback(async () => {
    try {
      const res = await notificationsService.countUnread();
      setUnreadCount(res?.data?.count || 0);
    } catch {
      // silent
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      // Generate automatic notifications first
      await notificationsService.checkAndGenerate();
      const res = await notificationsService.list({ limit: 30 });
      setNotifications(res?.data || []);
      // Recount unread
      const countRes = await notificationsService.countUnread();
      setUnreadCount(countRes?.data?.count || 0);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  // Poll unread count
  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchCount]);

  // Fetch full list when opening
  useEffect(() => {
    if (open) fetchNotifications();
  }, [open, fetchNotifications]);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleMarkRead = async (id) => {
    try {
      await notificationsService.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, lida: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // silent
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsService.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, lida: true })));
      setUnreadCount(0);
    } catch {
      // silent
    }
  };

  const handleClick = (notif) => {
    if (!notif.lida) handleMarkRead(notif.id);

    // Navigate to entity
    const routes = {
      motorista: '/motoristas',
      caminhao: '/caminhoes',
      manutencao: '/manutencoes',
      abastecimento: '/abastecimentos',
      viagem: '/viagens',
    };
    const route = routes[notif.entidade_tipo];
    if (route) {
      navigate(route);
      setOpen(false);
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative flex h-11 w-11 md:h-9 md:w-9 items-center justify-center rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] transition-all duration-200 hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-border-hover)] cursor-pointer"
        aria-label="Notificacoes"
        title="Notificacoes"
      >
        <Bell className="h-5 w-5 md:h-4 md:w-4 text-[var(--color-text-secondary)]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-[var(--color-bg)]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <>
          {/* Mobile backdrop */}
          <div
            className="md:hidden fixed inset-0 z-[60] bg-black/50 animate-fade-in"
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <div
            className={cn(
              // Desktop: dropdown
              'hidden md:block absolute right-0 z-20 mt-2 w-96 rounded-xl border border-[var(--color-border-hover)] bg-[var(--color-bg-elevated)] shadow-[0_16px_48px_var(--color-shadow)] animate-scale-in',
            )}
          >
            <NotificationPanel
              notifications={notifications}
              loading={loading}
              unreadCount={unreadCount}
              onMarkAllRead={handleMarkAllRead}
              onClick={handleClick}
              onClose={() => setOpen(false)}
            />
          </div>

          {/* Mobile: slide-up */}
          <div className="md:hidden fixed inset-x-0 bottom-0 z-[70] animate-slide-up">
            <div
              className="bg-[var(--color-bg-elevated)] border-t border-[var(--color-border-hover)] rounded-t-2xl max-h-[80vh] flex flex-col"
              style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
            >
              <NotificationPanel
                notifications={notifications}
                loading={loading}
                unreadCount={unreadCount}
                onMarkAllRead={handleMarkAllRead}
                onClick={handleClick}
                onClose={() => setOpen(false)}
                isMobile
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function NotificationPanel({ notifications, loading, unreadCount, onMarkAllRead, onClick, onClose, isMobile }) {
  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
        <div className="flex items-center gap-2">
          {isMobile && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 h-1 w-10 rounded-full bg-[var(--color-border)]" />
          )}
          <h3 className="text-sm font-semibold text-[var(--color-text)]">Notificacoes</h3>
          {unreadCount > 0 && (
            <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-500">
              {unreadCount} nova{unreadCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 transition-colors cursor-pointer"
              title="Marcar todas como lidas"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Ler todas</span>
            </button>
          )}
          {isMobile && (
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[var(--color-surface-hover)] cursor-pointer"
            >
              <X className="h-5 w-5 text-[var(--color-text-secondary)]" />
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className={cn('overflow-y-auto', isMobile ? 'max-h-[60vh]' : 'max-h-80')}>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-transparent" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-[var(--color-text-secondary)]">
            <Bell className="h-8 w-8 mb-2 opacity-30" />
            <p className="text-sm">Nenhuma notificacao</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {notifications.map((notif) => {
              const cfg = getConfig(notif.tipo);
              const Icon = cfg.icon;
              return (
                <button
                  key={notif.id}
                  onClick={() => onClick(notif)}
                  className={cn(
                    'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--color-surface-hover)] cursor-pointer',
                    !notif.lida && 'bg-[var(--color-accent)]/5'
                  )}
                >
                  <div className={cn('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', cfg.bg)}>
                    <Icon className={cn('h-4 w-4', cfg.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={cn(
                        'text-sm truncate',
                        notif.lida
                          ? 'text-[var(--color-text-secondary)]'
                          : 'font-medium text-[var(--color-text)]'
                      )}>
                        {notif.titulo}
                      </p>
                      {!notif.lida && (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--color-accent)]" />
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-[var(--color-text-secondary)] line-clamp-2">
                      {notif.mensagem}
                    </p>
                    <p className="mt-1 text-[10px] text-[var(--color-text-secondary)]/60">
                      {timeAgo(notif.created_at)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
