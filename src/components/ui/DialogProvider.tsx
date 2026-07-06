import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

interface DialogOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

interface DialogContextValue {
  alert: (options: DialogOptions) => Promise<void>;
  confirm: (options: DialogOptions) => Promise<boolean>;
}

interface PendingDialog extends DialogOptions {
  mode: 'alert' | 'confirm';
  resolve: (value: boolean) => void;
}

const DialogContext = createContext<DialogContextValue | null>(null);

export function DialogProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<PendingDialog | null>(null);

  const close = useCallback((value: boolean) => {
    setPending(current => {
      current?.resolve(value);
      return null;
    });
  }, []);

  const value = useMemo<DialogContextValue>(() => ({
    alert: options => new Promise<void>(resolve => {
      setPending({ ...options, mode: 'alert', resolve: () => resolve() });
    }),
    confirm: options => new Promise(resolve => {
      setPending({ ...options, mode: 'confirm', resolve });
    }),
  }), []);

  return (
    <DialogContext.Provider value={value}>
      {children}
      {pending && (
        <div
          role="presentation"
          className="fixed inset-0 z-[1000] grid place-items-center bg-slate-950/75 p-4 backdrop-blur-sm"
          onMouseDown={event => {
            if (event.target === event.currentTarget && pending.mode === 'confirm') close(false);
          }}
        >
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="app-dialog-title"
            aria-describedby="app-dialog-message"
            className="w-full max-w-md rounded-2xl border border-amber-500/20 bg-slate-900 p-6 text-white shadow-2xl"
          >
            <h2 id="app-dialog-title" className="font-display text-lg font-bold text-amber-300">
              {pending.title}
            </h2>
            <p id="app-dialog-message" className="mt-3 text-sm leading-6 text-slate-300">
              {pending.message}
            </p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              {pending.mode === 'confirm' && (
                <button
                  type="button"
                  autoFocus
                  onClick={() => close(false)}
                  className="min-h-11 rounded-xl border border-slate-700 px-4 text-sm font-bold text-slate-200 hover:bg-slate-800"
                >
                  {pending.cancelLabel || 'Cancel'}
                </button>
              )}
              <button
                type="button"
                autoFocus={pending.mode === 'alert'}
                onClick={() => close(true)}
                className={`min-h-11 rounded-xl px-4 text-sm font-black ${
                  pending.destructive
                    ? 'bg-rose-600 text-white hover:bg-rose-500'
                    : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                }`}
              >
                {pending.confirmLabel || (pending.mode === 'alert' ? 'Close' : 'Confirm')}
              </button>
            </div>
          </section>
        </div>
      )}
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const value = useContext(DialogContext);
  if (!value) throw new Error('useDialog must be used inside DialogProvider.');
  return value;
}
