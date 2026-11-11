import React, { createContext, useCallback, useContext, useState } from 'react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import type { ToastMessage, ToastVariant } from '../types';

interface ToastInput {
  title: string;
  description?: string;
  variant?: ToastVariant;
}

interface ToastContextValue {
  showToast: (input: ToastInput) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const VARIANT_STYLES: Record<
  ToastVariant,
  { icon: React.ReactNode; accentBorder: string }
> = {
  success: {
    icon: <CheckCircle2 className="h-4 w-4 text-[var(--status-success)] shrink-0" />,
    accentBorder: 'border-l-[3px] border-l-[var(--status-success)]',
  },
  info: {
    icon: <Info className="h-4 w-4 text-[var(--brand-primary)] shrink-0" />,
    accentBorder: 'border-l-[3px] border-l-[var(--brand-primary)]',
  },
  warning: {
    icon: <AlertTriangle className="h-4 w-4 text-[var(--status-warning)] shrink-0" />,
    accentBorder: 'border-l-[3px] border-l-[var(--status-warning)]',
  },
  error: {
    icon: <XCircle className="h-4 w-4 text-[var(--status-danger)] shrink-0" />,
    accentBorder: 'border-l-[3px] border-l-[var(--status-danger)]',
  },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ title, description, variant = 'success' }: ToastInput) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev.slice(-3), { id, title, description, variant }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3600);
    },
    [],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        aria-live="polite"
        aria-label="Notifications"
        className="fixed top-4 right-4 left-4 sm:left-auto z-[80] flex flex-col gap-2.5 sm:w-[360px] pointer-events-none"
      >
        {toasts.map((toast) => {
          const style = VARIANT_STYLES[toast.variant];
          return (
            <div
              key={toast.id}
              role="status"
              className={`pointer-events-auto animate-toast-in flex items-start gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] px-4 py-3 shadow-[var(--shadow-md)] ${style.accentBorder}`}
            >
              <div className="mt-0.5">{style.icon}</div>
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] font-medium text-[var(--text-primary)] leading-snug">
                  {toast.title}
                </p>
                {toast.description && (
                  <p className="mt-0.5 text-[12.5px] text-[var(--text-secondary)] leading-snug">
                    {toast.description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                aria-label="Dismiss notification"
                className="rounded-md p-1 text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
