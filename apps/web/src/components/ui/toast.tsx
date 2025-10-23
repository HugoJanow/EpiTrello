import { forwardRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

type Toast = {
  id: string;
  title?: string;
  description?: string;
  type?: 'success' | 'error' | 'info';
};

let listeners: ((toasts: Toast[]) => void)[] = [];
let toasts: Toast[] = [];

export function createToast(t: Omit<Toast, 'id'>) {
  const id = String(Date.now()) + Math.random().toString(36).slice(2, 8);
  const toast = { id, ...t } as Toast;
  toasts = [toast, ...toasts];
  listeners.forEach((l) => l(toasts));
  setTimeout(() => {
    removeToast(id);
  }, 4000);
  return id;
}

export function removeToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  listeners.forEach((l) => l(toasts));
}

export function useToasts() {
  const [state, setState] = useState<Toast[]>(toasts);
  useEffect(() => {
    const l = (s: Toast[]) => setState(s);
    listeners.push(l);
    return () => {
      listeners = listeners.filter((x) => x !== l);
    };
  }, []);
  return state;
}

export const ToastViewport = ({ className = '' }: { className?: string }) => {
  const items = useToasts();
  return (
    <div className={cn('fixed right-4 bottom-4 z-50 flex flex-col gap-2', className)}>
      {items.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
};

const ToastItem = forwardRef<HTMLDivElement, { toast: Toast }>(({ toast }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'w-80 rounded-md p-3 shadow-lg border border-gray-200 bg-white',
        toast.type === 'success' && 'border-green-200',
        toast.type === 'error' && 'border-red-200'
      )}
    >
      {toast.title && <div className="font-semibold mb-1">{toast.title}</div>}
      {toast.description && <div className="text-sm text-gray-600">{toast.description}</div>}
    </div>
  );
});

ToastItem.displayName = 'ToastItem';
