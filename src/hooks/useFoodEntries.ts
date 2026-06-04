// ============================================================
// Benim Kalorim – useFoodEntries Custom Hook
// Yemek kayıtları için CRUD state yönetimi
// ============================================================

import { useState, useCallback, useEffect } from 'react';
import type { FoodEntry, NewFoodEntry, FilterOptions } from '../interfaces';
import {
  getAllEntries,
  addEntry as storageAdd,
  updateEntry as storageUpdate,
  deleteEntry as storageDelete,
  generateId,
  todayString,
} from '../utils/storage';

export function useFoodEntries() {
  const [entries, setEntries]   = useState<FoodEntry[]>([]);
  const [loading, setLoading]   = useState(true);

  const refresh = useCallback(() => {
    setEntries(getAllEntries());
  }, []);

  // İlk yükleme ve event tabanlı senkronizasyon
  useEffect(() => {
    refresh();
    setLoading(false);

    const handleUpdate = () => {
      refresh();
    };

    window.addEventListener('food-entries-updated', handleUpdate);
    return () => {
      window.removeEventListener('food-entries-updated', handleUpdate);
    };
  }, [refresh]);

  // Yeni kayıt ekleme (CREATE)
  const addEntry = useCallback((data: NewFoodEntry): FoodEntry => {
    const now   = new Date().toISOString();
    const entry: FoodEntry = {
      ...data,
      id:        generateId(),
      createdAt: now,
      updatedAt: now,
    };
    const updated = storageAdd(entry);
    setEntries(updated);
    window.dispatchEvent(new Event('food-entries-updated'));
    return entry;
  }, []);

  // Kayıt güncelleme (UPDATE)
  const updateEntry = useCallback((id: string, data: Partial<NewFoodEntry>): void => {
    const updated = storageUpdate(id, data);
    setEntries(updated);
    window.dispatchEvent(new Event('food-entries-updated'));
  }, []);

  // Kayıt silme (DELETE)
  const deleteEntry = useCallback((id: string): void => {
    const updated = storageDelete(id);
    setEntries(updated);
    window.dispatchEvent(new Event('food-entries-updated'));
  }, []);

  // Filtrelenmiş kayıtlar (READ/LIST)
  const getFilteredEntries = useCallback((filters: FilterOptions): FoodEntry[] => {
    return entries.filter(entry => {
      if (entry.date !== filters.date) return false;

      if (filters.mealType !== 'tümü' && entry.mealType !== filters.mealType)
        return false;

      if (filters.category !== 'tümü' && entry.category !== filters.category)
        return false;

      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        if (!entry.name.toLowerCase().includes(q)) return false;
      }

      return true;
    });
  }, [entries]);

  // Belirli tarih için günlük toplam
  const getDailyTotals = useCallback((date: string) => {
    const dayEntries = entries.filter(e => e.date === date);
    return dayEntries.reduce(
      (acc, e) => ({
        calories: acc.calories + e.calories,
        protein:  acc.protein  + e.protein,
        carbs:    acc.carbs    + e.carbs,
        fat:      acc.fat      + e.fat,
        count:    acc.count    + 1,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, count: 0 }
    );
  }, [entries]);

  // Son 7 günün özeti
  const getWeeklyData = useCallback(() => {
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const totals  = entries
        .filter(e => e.date === dateStr)
        .reduce((acc, e) => acc + e.calories, 0);
      result.push({ date: dateStr, calories: totals });
    }
    return result;
  }, [entries]);

  return {
    entries,
    loading,
    today: todayString(),
    addEntry,
    updateEntry,
    deleteEntry,
    getFilteredEntries,
    getDailyTotals,
    getWeeklyData,
  };
}
