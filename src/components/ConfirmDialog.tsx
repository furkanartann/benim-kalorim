// ============================================================
// Benim Kalorim – ConfirmDialog Component
// Silme onay dialogu
// ============================================================

import { AlertTriangle, Trash2, X } from 'lucide-react';
import { useEffect } from 'react';

interface ConfirmDialogProps {
  title:    string;
  message:  string;
  onConfirm: () => void;
  onCancel:  () => void;
}

export function ConfirmDialog({ title, message, onConfirm, onCancel }: ConfirmDialogProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape')  onCancel();
      if (e.key === 'Enter')   onConfirm();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onCancel, onConfirm]);

  return (
    <div
      className="modal-overlay"
      onClick={e => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="modal-box max-w-sm" role="alertdialog" aria-modal="true">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
            <AlertTriangle size={28} className="text-red-400" />
          </div>
        </div>

        <h2 className="text-base font-bold text-white text-center mb-2">{title}</h2>
        <p className="text-sm text-center mb-6" style={{ color: 'var(--color-text-muted)' }}>
          {message}
        </p>

        <div className="flex gap-3">
          <button
            id="confirm-cancel-btn"
            className="btn-secondary flex-1"
            onClick={onCancel}
          >
            <X size={15} /> İptal
          </button>
          <button
            id="confirm-delete-btn"
            className="btn-danger flex-1 justify-center"
            onClick={onConfirm}
          >
            <Trash2 size={15} /> Sil
          </button>
        </div>
      </div>
    </div>
  );
}
