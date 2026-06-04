// ============================================================
// Benim Kalorim – useFoodLibrary Hook
// Besin kütüphanesi CRUD işlemleri
// ============================================================

import { useState, useCallback, useEffect } from 'react';
import type { FoodItem, NewFoodItem } from '../interfaces';
import {
  getAllFoodItems,
  addFoodItem    as storageAdd,
  updateFoodItem as storageUpdate,
  deleteFoodItem as storageDelete,
  generateId,
} from '../utils/storage';

export function useFoodLibrary() {
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setFoods(getAllFoodItems());
    setLoading(false);
  }, []);

  // CREATE
  const addFood = useCallback((data: NewFoodItem): FoodItem => {
    const now  = new Date().toISOString();
    const item: FoodItem = {
      ...data,
      id:        generateId(),
      isDefault: false,
      createdAt: now,
    };
    const updated = storageAdd(item);
    setFoods(updated);
    return item;
  }, []);

  // UPDATE
  const updateFood = useCallback((id: string, data: Partial<NewFoodItem>): void => {
    const updated = storageUpdate(id, data);
    setFoods(updated);
  }, []);

  // DELETE
  const deleteFood = useCallback((id: string): void => {
    const updated = storageDelete(id);
    setFoods(updated);
  }, []);

  // SEARCH (READ / LİSTELE)
  const searchFoods = useCallback((query: string): FoodItem[] => {
    if (!query.trim()) return foods;
    const q = query.toLowerCase().trim();
    return foods.filter(f =>
      f.name.toLowerCase().includes(q) ||
      f.category.toLowerCase().includes(q)
    );
  }, [foods]);

  return { foods, loading, addFood, updateFood, deleteFood, searchFoods };
}
