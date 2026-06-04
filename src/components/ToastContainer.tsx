// ============================================================
// Benim Kalorim – Toast Component
// Bildirim görüntüleme bileşeni
// ============================================================

import { CheckCircle2, XCircle, AlertTriangle, X } from 'lucide-react';
import type { Toast } from '../interfaces';

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const ICONS = {
  success: <CheckCircle2 size={18} />,
  error:   <XCircle size={18} />,
  warning: <AlertTriangle size={18} />,
};

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type}`}
          role="alert"
        >
          <span>{ICONS[toast.type]}</span>
          <span className="flex-1 text-sm font-medium">{toast.message}</span>
          <button
            onClick={() => onRemove(toast.id)}
            className="ml-2 opacity-70 hover:opacity-100 transition-opacity"
            aria-label="Kapat"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
