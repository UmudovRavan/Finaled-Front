import React, { useEffect, useState, useCallback } from 'react';
import { Check, AlertCircle, Info, X } from 'lucide-react';
import { toast, type ToastItem } from '../utils/toast';

interface ActiveToast extends ToastItem {
  leaving?: boolean;
}

export const IosToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ActiveToast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 240);
  }, []);

  useEffect(() => {
    const unsubscribe = toast.subscribe((item) => {
      setToasts((prev) => [...prev.slice(-3), item]);
      const duration = item.duration ?? 3500;
      setTimeout(() => {
        dismiss(item.id);
      }, duration);
    });
    return unsubscribe;
  }, [dismiss]);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 pointer-events-none w-[calc(100vw-2.5rem)] max-w-[360px]"
    >
      <style>{`
        @keyframes iosToastSlideIn {
          0% {
            opacity: 0;
            transform: translateY(14px) scale(0.96);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
      {toasts.map((item) => {
        const isSuccess = item.variant === 'success';
        const isError = item.variant === 'error';

        return (
          <div
            key={item.id}
            style={{
              animation: item.leaving
                ? undefined
                : 'iosToastSlideIn 0.28s cubic-bezier(0.22, 1, 0.36, 1) forwards',
            }}
            className={`pointer-events-auto flex items-start gap-3 rounded-[20px] px-4 py-3.5 border backdrop-blur-2xl shadow-[0_14px_40px_-10px_rgba(0,0,0,0.22)] transition-all duration-200 ${
              item.leaving
                ? 'opacity-0 translate-y-2 scale-95'
                : 'opacity-100 translate-y-0 scale-100'
            } bg-white/88 dark:bg-[#1C1C1E]/88 border-black/[0.08] dark:border-white/[0.12] text-slate-900 dark:text-white`}
          >
            {/* iOS Circular Icon Badge */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                isSuccess
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                  : isError
                  ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                  : 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
              }`}
            >
              {isSuccess ? (
                <Check className="w-4 h-4 stroke-[2.6]" />
              ) : isError ? (
                <AlertCircle className="w-4 h-4 stroke-[2.2]" />
              ) : (
                <Info className="w-4 h-4 stroke-[2.2]" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold leading-snug tracking-[-0.01em]">
                {item.title}
              </p>
              {item.message && (
                <p className="text-[12px] text-slate-500 dark:text-zinc-400 mt-0.5 leading-snug break-words">
                  {item.message}
                </p>
              )}
            </div>

            {/* Close button */}
            <button
              type="button"
              onClick={() => dismiss(item.id)}
              aria-label="Bağla"
              className="p-1 -mr-1 -mt-0.5 rounded-full text-slate-400 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-zinc-200 hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default IosToastContainer;
