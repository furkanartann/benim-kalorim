// ============================================================
// Benim Kalorim – useToast Custom Hook
// Bildirim sistemi
// ============================================================

import { useState, useCallback } from 'react';
import type { Toast } from '../interfaces';
import { generateId } from '../utils/storage';

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((
    type: Toast['type'],
    message: string,
    duration = 3500
  ) => {
    const id = generateId();
    const toast: Toast = { id, type, message };

    setToasts(prev => [...prev, toast]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return {
    toasts,
    success: (msg: string) => addToast('success', msg),
    error:   (msg: string) => addToast('error',   msg),
    warning: (msg: string) => addToast('warning', msg),
    removeToast,
  };
}
