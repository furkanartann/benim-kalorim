// ============================================================
// Benim Kalorim – LocalStorage Utility
// Tüm veri okuma/yazma işlemleri bu modülden yapılır
// ============================================================

import type { FoodEntry, UserProfile, FoodItem } from '../interfaces';

const KEYS = {
  ENTRIES:  'benim_kalorim_entries',
  PROFILE:  'benim_kalorim_profile',
  FOODS:    'benim_kalorim_foods',
  WATER:    'benim_kalorim_water',
} as const;

// -------- Food Entries --------

/** Tüm yemek kayıtlarını getirir */
export function getAllEntries(): FoodEntry[] {
  try {
    const raw = localStorage.getItem(KEYS.ENTRIES);
    if (!raw) return [];
    return JSON.parse(raw) as FoodEntry[];
  } catch {
    return [];
  }
}

/** Yemek kayıtlarını kaydeder */
export function saveEntries(entries: FoodEntry[]): void {
  localStorage.setItem(KEYS.ENTRIES, JSON.stringify(entries));
}

/** Yeni yemek kaydı ekler */
export function addEntry(entry: FoodEntry): FoodEntry[] {
  const entries = getAllEntries();
  const updated = [entry, ...entries];
  saveEntries(updated);
  return updated;
}

/** Yemek kaydını günceller */
export function updateEntry(id: string, data: Partial<FoodEntry>): FoodEntry[] {
  const entries = getAllEntries();
  const updated = entries.map(e =>
    e.id === id
      ? { ...e, ...data, updatedAt: new Date().toISOString() }
      : e
  );
  saveEntries(updated);
  return updated;
}

/** Yemek kaydını siler */
export function deleteEntry(id: string): FoodEntry[] {
  const entries = getAllEntries();
  const updated = entries.filter(e => e.id !== id);
  saveEntries(updated);
  return updated;
}

/** Belirli bir tarihe ait kayıtları getirir */
export function getEntriesByDate(date: string): FoodEntry[] {
  return getAllEntries().filter(e => e.date === date);
}

// -------- User Profile --------

/** Kullanıcı profilini getirir */
export function getProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(KEYS.PROFILE);
    if (!raw) return null;
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

/** Kullanıcı profilini kaydeder */
export function saveProfile(profile: UserProfile): void {
  localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
}

// -------- Food Library (Besin Kütüphanesi) --------

const DEFAULT_FOOD_ITEMS: FoodItem[] = [
  { id: 'def-1', name: 'Yumurta (Haşlanmış)', category: 'protein', calories: 75, protein: 6.3, carbs: 0.6, fat: 5.3, servingSize: 1, servingUnit: 'adet', isDefault: true },
  { id: 'def-2', name: 'Tavuk Göğsü (Izgara)', category: 'protein', calories: 165, protein: 31, carbs: 0, fat: 3.6, servingSize: 100, servingUnit: 'g', isDefault: true },
  { id: 'def-3', name: 'Yulaf Ezmesi', category: 'karbonhidrat', calories: 389, protein: 16.9, carbs: 66.3, fat: 6.9, servingSize: 100, servingUnit: 'g', isDefault: true },
  { id: 'def-4', name: 'Muz', category: 'meyve-sebze', calories: 105, protein: 1.3, carbs: 27, fat: 0.3, servingSize: 1, servingUnit: 'adet', isDefault: true },
  { id: 'def-5', name: 'Elma', category: 'meyve-sebze', calories: 95, protein: 0.5, carbs: 25, fat: 0.3, servingSize: 1, servingUnit: 'adet', isDefault: true },
  { id: 'def-6', name: 'Süt (%3.1 Yağlı)', category: 'süt-ürünü', calories: 120, protein: 6.6, carbs: 9.4, fat: 6.2, servingSize: 200, servingUnit: 'ml', isDefault: true },
  { id: 'def-7', name: 'Pirinç Pilavı (Beyaz)', category: 'karbonhidrat', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, servingSize: 100, servingUnit: 'g', isDefault: true },
  { id: 'def-8', name: 'Zeytinyağı', category: 'sağlıklı-yağ', calories: 119, protein: 0, carbs: 0, fat: 13.5, servingSize: 1, servingUnit: 'yemek kaşığı', isDefault: true },
  { id: 'def-9', name: 'Fıstık Ezmesi', category: 'sağlıklı-yağ', calories: 94, protein: 3.8, carbs: 3, fat: 8, servingSize: 1, servingUnit: 'yemek kaşığı', isDefault: true },
  { id: 'def-10', name: 'Filtre Kahve (Siyah)', category: 'içecek', calories: 2, protein: 0.2, carbs: 0, fat: 0, servingSize: 1, servingUnit: 'fincan', isDefault: true },
  { id: 'def-11', name: 'Dana Bonfile (Izgara)', category: 'protein', calories: 220, protein: 26, carbs: 0, fat: 12, servingSize: 100, servingUnit: 'g', isDefault: true },
  { id: 'def-12', name: 'Somon Izgara', category: 'protein', calories: 200, protein: 22, carbs: 0, fat: 12, servingSize: 100, servingUnit: 'g', isDefault: true },
  { id: 'def-13', name: 'Hindi Füme', category: 'protein', calories: 100, protein: 18, carbs: 1, fat: 2, servingSize: 100, servingUnit: 'g', isDefault: true },
  { id: 'def-14', name: 'Lor Peyniri (Yağsız)', category: 'protein', calories: 90, protein: 17, carbs: 3, fat: 1, servingSize: 100, servingUnit: 'g', isDefault: true },
  { id: 'def-15', name: 'Süzme Tam Yağlı Peynir', category: 'süt-ürünü', calories: 250, protein: 12, carbs: 2, fat: 21, servingSize: 100, servingUnit: 'g', isDefault: true },
  { id: 'def-16', name: 'Taze Kaşar Peyniri', category: 'süt-ürünü', calories: 350, protein: 27, carbs: 2, fat: 26, servingSize: 100, servingUnit: 'g', isDefault: true },
  { id: 'def-17', name: 'Yoğurt (Tam Yağlı)', category: 'süt-ürünü', calories: 60, protein: 3.5, carbs: 4.7, fat: 3, servingSize: 100, servingUnit: 'g', isDefault: true },
  { id: 'def-18', name: 'Süzme Yoğurt', category: 'süt-ürünü', calories: 100, protein: 8, carbs: 4, fat: 6, servingSize: 100, servingUnit: 'g', isDefault: true },
  { id: 'def-19', name: 'Tam Buğday Ekmek', category: 'karbonhidrat', calories: 65, protein: 2.5, carbs: 12, fat: 0.8, servingSize: 1, servingUnit: 'dilim', isDefault: true },
  { id: 'def-20', name: 'Bulgur Pilavı', category: 'karbonhidrat', calories: 150, protein: 4, carbs: 32, fat: 1.5, servingSize: 100, servingUnit: 'g', isDefault: true },
  { id: 'def-21', name: 'Fırınlanmış Patates', category: 'karbonhidrat', calories: 93, protein: 2, carbs: 21, fat: 0.1, servingSize: 100, servingUnit: 'g', isDefault: true },
  { id: 'def-22', name: 'Mercimek Çorbası', category: 'diğer', calories: 140, protein: 8, carbs: 22, fat: 3, servingSize: 1, servingUnit: 'kase (250 ml)', isDefault: true },
  { id: 'def-23', name: 'Avokado', category: 'sağlıklı-yağ', calories: 240, protein: 3, carbs: 12, fat: 22, servingSize: 1, servingUnit: 'adet', isDefault: true },
  { id: 'def-24', name: 'Çiğ Badem', category: 'sağlıklı-yağ', calories: 150, protein: 5.3, carbs: 5.4, fat: 13, servingSize: 25, servingUnit: 'g (1 avuç)', isDefault: true },
  { id: 'def-25', name: 'Çiğ Ceviz', category: 'sağlıklı-yağ', calories: 164, protein: 3.8, carbs: 3.4, fat: 16, servingSize: 25, servingUnit: 'g (1 avuç)', isDefault: true },
  { id: 'def-26', name: 'Çilek', category: 'meyve-sebze', calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, servingSize: 100, servingUnit: 'g', isDefault: true },
  { id: 'def-27', name: 'Siyah Zeytin', category: 'sağlıklı-yağ', calories: 45, protein: 0.2, carbs: 1, fat: 4.5, servingSize: 5, servingUnit: 'adet', isDefault: true },
  { id: 'def-28', name: 'Salatalık', category: 'meyve-sebze', calories: 15, protein: 0.8, carbs: 3.6, fat: 0.2, servingSize: 1, servingUnit: 'adet', isDefault: true },
  { id: 'def-29', name: 'Domates', category: 'meyve-sebze', calories: 22, protein: 1, carbs: 4.8, fat: 0.2, servingSize: 1, servingUnit: 'adet', isDefault: true },
  { id: 'def-30', name: 'Türk Kahvesi (Sade)', category: 'içecek', calories: 2, protein: 0.1, carbs: 0.1, fat: 0, servingSize: 1, servingUnit: 'fincan', isDefault: true },
  { id: 'def-31', name: 'Yeşil Çay', category: 'içecek', calories: 1, protein: 0, carbs: 0.2, fat: 0, servingSize: 1, servingUnit: 'bardak', isDefault: true },
  { id: 'def-32', name: 'Şekersiz Kola', category: 'içecek', calories: 1, protein: 0, carbs: 0, fat: 0, servingSize: 330, servingUnit: 'ml (1 kutu)', isDefault: true },
  { id: 'def-33', name: 'Bitter Çikolata (%70)', category: 'atıştırmalık', calories: 550, protein: 7, carbs: 46, fat: 37, servingSize: 100, servingUnit: 'g', isDefault: true },
  { id: 'def-34', name: 'Whey Protein Tozu', category: 'protein', calories: 120, protein: 24, carbs: 2, fat: 1.5, servingSize: 30, servingUnit: 'g (1 ölçek)', isDefault: true },
  { id: 'def-35', name: 'Nohut (Haşlanmış)', category: 'karbonhidrat', calories: 164, protein: 9, carbs: 27, fat: 2.6, servingSize: 100, servingUnit: 'g', isDefault: true },
  { id: 'def-36', name: 'Brokoli (Haşlanmış)', category: 'meyve-sebze', calories: 35, protein: 2.8, carbs: 7, fat: 0.4, servingSize: 100, servingUnit: 'g', isDefault: true },
  { id: 'def-37', name: 'Kinoa (Pişmiş)', category: 'karbonhidrat', calories: 120, protein: 4.4, carbs: 21.3, fat: 1.9, servingSize: 100, servingUnit: 'g', isDefault: true },
  { id: 'def-38', name: 'Chia Tohumu', category: 'sağlıklı-yağ', calories: 60, protein: 2, carbs: 5, fat: 4, servingSize: 1, servingUnit: 'yemek kaşığı', isDefault: true },
  { id: 'def-39', name: 'Konserve Ton Balığı', category: 'protein', calories: 144, protein: 20, carbs: 0, fat: 7, servingSize: 80, servingUnit: 'g (1 kutu)', isDefault: true },
  { id: 'def-40', name: 'Tam Buğday Makarna', category: 'karbonhidrat', calories: 124, protein: 5.3, carbs: 25, fat: 0.5, servingSize: 100, servingUnit: 'g', isDefault: true },
  { id: 'def-41', name: 'Kuru Fasulye (Etli)', category: 'karbonhidrat', calories: 140, protein: 8, carbs: 22, fat: 2.5, servingSize: 100, servingUnit: 'g', isDefault: true },
  { id: 'def-42', name: 'Mercimek Çorbası (Süzme)', category: 'diğer', calories: 140, protein: 8, carbs: 22, fat: 3, servingSize: 250, servingUnit: 'ml', isDefault: true },
  { id: 'def-43', name: 'Tavuk Döner', category: 'protein', calories: 220, protein: 22, carbs: 14, fat: 8, servingSize: 100, servingUnit: 'g', isDefault: true },
  { id: 'def-44', name: 'Adana Kebap', category: 'protein', calories: 340, protein: 18, carbs: 2, fat: 28, servingSize: 100, servingUnit: 'g', isDefault: true },
  { id: 'def-45', name: 'Lahmacun', category: 'karbonhidrat', calories: 220, protein: 10, carbs: 28, fat: 8, servingSize: 1, servingUnit: 'adet', isDefault: true },
  { id: 'def-46', name: 'Etli Nohut', category: 'protein', calories: 150, protein: 8, carbs: 18, fat: 5, servingSize: 100, servingUnit: 'g', isDefault: true },
  { id: 'def-47', name: 'Karnıyarık', category: 'diğer', calories: 135, protein: 6, carbs: 8, fat: 9, servingSize: 100, servingUnit: 'g', isDefault: true },
  { id: 'def-48', name: 'Mercimek Köftesi', category: 'karbonhidrat', calories: 60, protein: 2, carbs: 10, fat: 1.5, servingSize: 1, servingUnit: 'adet', isDefault: true },
  { id: 'def-49', name: 'Yaprak Sarması (Zeytinyağlı)', category: 'karbonhidrat', calories: 35, protein: 0.5, carbs: 6, fat: 1.2, servingSize: 1, servingUnit: 'adet', isDefault: true },
  { id: 'def-50', name: 'Ispanak Yemeği', category: 'meyve-sebze', calories: 50, protein: 2, carbs: 5, fat: 2.5, servingSize: 100, servingUnit: 'g', isDefault: true },
  { id: 'def-51', name: 'Taze Fasulye (Zeytinyağlı)', category: 'meyve-sebze', calories: 65, protein: 1.5, carbs: 8, fat: 3, servingSize: 100, servingUnit: 'g', isDefault: true },
  { id: 'def-52', name: 'Cacık', category: 'süt-ürünü', calories: 80, protein: 4, carbs: 5, fat: 4.5, servingSize: 200, servingUnit: 'ml', isDefault: true },
  { id: 'def-53', name: 'Yayla Çorbası', category: 'diğer', calories: 120, protein: 3, carbs: 18, fat: 4, servingSize: 250, servingUnit: 'ml', isDefault: true },
  { id: 'def-54', name: 'Domates Çorbası', category: 'diğer', calories: 90, protein: 2, carbs: 14, fat: 3, servingSize: 250, servingUnit: 'ml', isDefault: true },
  { id: 'def-55', name: 'Tarhana Çorbası', category: 'diğer', calories: 150, protein: 5, carbs: 22, fat: 4.5, servingSize: 250, servingUnit: 'ml', isDefault: true },
  { id: 'def-56', name: 'Ezogelin Çorbası', category: 'diğer', calories: 160, protein: 6, carbs: 24, fat: 4, servingSize: 250, servingUnit: 'ml', isDefault: true },
  { id: 'def-57', name: 'Menemen', category: 'protein', calories: 180, protein: 10, carbs: 8, fat: 12, servingSize: 1, servingUnit: 'porsiyon', isDefault: true },
  { id: 'def-58', name: 'Patates Kızartması', category: 'atıştırmalık', calories: 312, protein: 3.4, carbs: 41, fat: 15, servingSize: 100, servingUnit: 'g', isDefault: true },
  { id: 'def-59', name: 'Hamburger', category: 'diğer', calories: 295, protein: 17, carbs: 30, fat: 12, servingSize: 1, servingUnit: 'adet', isDefault: true },
  { id: 'def-60', name: 'Pizza (Margarita)', category: 'diğer', calories: 250, protein: 10, carbs: 30, fat: 8, servingSize: 1, servingUnit: 'dilim', isDefault: true },
  { id: 'def-61', name: 'Simit', category: 'karbonhidrat', calories: 280, protein: 9, carbs: 57, fat: 4, servingSize: 1, servingUnit: 'adet', isDefault: true },
  { id: 'def-62', name: 'Poğaça (Peynirli)', category: 'karbonhidrat', calories: 260, protein: 6, carbs: 28, fat: 14, servingSize: 1, servingUnit: 'adet', isDefault: true },
  { id: 'def-63', name: 'Baklava', category: 'atıştırmalık', calories: 160, protein: 1.5, carbs: 22, fat: 7.5, servingSize: 1, servingUnit: 'adet', isDefault: true },
  { id: 'def-64', name: 'Sütlaç', category: 'atıştırmalık', calories: 260, protein: 6, carbs: 48, fat: 5, servingSize: 1, servingUnit: 'porsiyon', isDefault: true },
  { id: 'def-65', name: 'Tavuklu Pilav', category: 'karbonhidrat', calories: 340, protein: 18, carbs: 52, fat: 6, servingSize: 1, servingUnit: 'porsiyon', isDefault: true },
  { id: 'def-66', name: 'Kırmızı Mercimek (Pişmiş)', category: 'karbonhidrat', calories: 116, protein: 9, carbs: 20, fat: 0.4, servingSize: 100, servingUnit: 'g', isDefault: true },
  { id: 'def-67', name: 'Yulaf Lapası (Su ile)', category: 'karbonhidrat', calories: 71, protein: 2.5, carbs: 12, fat: 1.4, servingSize: 100, servingUnit: 'g', isDefault: true },
  { id: 'def-68', name: 'Süzme Peynir (Yarım Yağlı)', category: 'süt-ürünü', calories: 180, protein: 11, carbs: 3.5, fat: 14, servingSize: 100, servingUnit: 'g', isDefault: true },
  { id: 'def-69', name: 'Beyaz Peynir (Tam Yağlı)', category: 'süt-ürünü', calories: 289, protein: 16, carbs: 2, fat: 24, servingSize: 100, servingUnit: 'g', isDefault: true },
  { id: 'def-70', name: 'Labne Peyniri', category: 'süt-ürünü', calories: 200, protein: 6, carbs: 4, fat: 18, servingSize: 100, servingUnit: 'g', isDefault: true },
  { id: 'def-71', name: 'Kefir', category: 'süt-ürünü', calories: 105, protein: 6, carbs: 8, fat: 5.5, servingSize: 200, servingUnit: 'ml', isDefault: true },
  { id: 'def-72', name: 'Ayran', category: 'süt-ürünü', calories: 76, protein: 3.2, carbs: 4, fat: 4, servingSize: 200, servingUnit: 'ml', isDefault: true },
  { id: 'def-73', name: 'Portakal Suyu (Taze)', category: 'içecek', calories: 90, protein: 1.4, carbs: 21, fat: 0.4, servingSize: 200, servingUnit: 'ml', isDefault: true },
  { id: 'def-74', name: 'Limonata', category: 'içecek', calories: 100, protein: 0.2, carbs: 25, fat: 0.1, servingSize: 200, servingUnit: 'ml', isDefault: true },
  { id: 'def-75', name: 'Soda / Maden Suyu', category: 'içecek', calories: 0, protein: 0, carbs: 0, fat: 0, servingSize: 1, servingUnit: 'adet', isDefault: true },
  { id: 'def-76', name: 'Şalgam Suyu', category: 'içecek', calories: 10, protein: 0.4, carbs: 2, fat: 0.1, servingSize: 200, servingUnit: 'ml', isDefault: true },
  { id: 'def-77', name: 'Fındık (Çiğ)', category: 'sağlıklı-yağ', calories: 160, protein: 3.8, carbs: 4.2, fat: 15, servingSize: 25, servingUnit: 'g', isDefault: true },
  { id: 'def-78', name: 'Fıstık (Tuzlu)', category: 'sağlıklı-yağ', calories: 145, protein: 6.5, carbs: 5.3, fat: 12, servingSize: 25, servingUnit: 'g', isDefault: true },
  { id: 'def-79', name: 'Kaju (Kavrulmuş)', category: 'sağlıklı-yağ', calories: 147, protein: 4.5, carbs: 7.5, fat: 11, servingSize: 25, servingUnit: 'g', isDefault: true },
  { id: 'def-80', name: 'Kabak Çekirdeği', category: 'sağlıklı-yağ', calories: 140, protein: 7, carbs: 4, fat: 12, servingSize: 25, servingUnit: 'g', isDefault: true },
  { id: 'def-81', name: 'Chia Tohumu (1 Yemek Kaşığı)', category: 'sağlıklı-yağ', calories: 49, protein: 1.7, carbs: 4.2, fat: 3.1, servingSize: 1, servingUnit: 'yemek kaşığı', isDefault: true },
  { id: 'def-82', name: 'Keten Tohumu', category: 'sağlıklı-yağ', calories: 53, protein: 1.8, carbs: 3, fat: 4.2, servingSize: 1, servingUnit: 'yemek kaşığı', isDefault: true },
  { id: 'def-83', name: 'Bal', category: 'atıştırmalık', calories: 64, protein: 0.1, carbs: 17, fat: 0, servingSize: 1, servingUnit: 'yemek kaşığı', isDefault: true },
  { id: 'def-84', name: 'Reçel (Çilek)', category: 'atıştırmalık', calories: 50, protein: 0.1, carbs: 13, fat: 0.1, servingSize: 1, servingUnit: 'yemek kaşığı', isDefault: true },
  { id: 'def-85', name: 'Tahin', category: 'sağlıklı-yağ', calories: 89, protein: 2.6, carbs: 3.2, fat: 8, servingSize: 1, servingUnit: 'yemek kaşığı', isDefault: true },
  { id: 'def-86', name: 'Pekmez', category: 'atıştırmalık', calories: 44, protein: 0, carbs: 11, fat: 0, servingSize: 1, servingUnit: 'yemek kaşığı', isDefault: true },
  { id: 'def-87', name: 'Izgara Köfte', category: 'protein', calories: 60, protein: 5.5, carbs: 1, fat: 4, servingSize: 1, servingUnit: 'adet', isDefault: true },
  { id: 'def-88', name: 'Tavuk Baget (Fırında)', category: 'protein', calories: 170, protein: 18, carbs: 0, fat: 10, servingSize: 1, servingUnit: 'adet', isDefault: true },
  { id: 'def-89', name: 'Kırmızı Et (Dana Kıyma)', category: 'protein', calories: 250, protein: 24, carbs: 0, fat: 17, servingSize: 100, servingUnit: 'g', isDefault: true },
  { id: 'def-90', name: 'Levrek Izgara', category: 'protein', calories: 124, protein: 23, carbs: 0, fat: 3, servingSize: 100, servingUnit: 'g', isDefault: true },
  { id: 'def-91', name: 'Karides (Haşlanmış)', category: 'protein', calories: 99, protein: 24, carbs: 0.2, fat: 0.3, servingSize: 100, servingUnit: 'g', isDefault: true },
  { id: 'def-92', name: 'Portakal', category: 'meyve-sebze', calories: 62, protein: 1.2, carbs: 15, fat: 0.2, servingSize: 1, servingUnit: 'adet', isDefault: true },
  { id: 'def-93', name: 'Mandalina', category: 'meyve-sebze', calories: 47, protein: 0.8, carbs: 12, fat: 0.3, servingSize: 1, servingUnit: 'adet', isDefault: true },
  { id: 'def-94', name: 'Armut', category: 'meyve-sebze', calories: 101, protein: 0.6, carbs: 27, fat: 0.2, servingSize: 1, servingUnit: 'adet', isDefault: true },
  { id: 'def-95', name: 'Şeftali', category: 'meyve-sebze', calories: 59, protein: 1.4, carbs: 14, fat: 0.4, servingSize: 1, servingUnit: 'adet', isDefault: true },
  { id: 'def-96', name: 'Karpuz', category: 'meyve-sebze', calories: 60, protein: 1.2, carbs: 15, fat: 0.3, servingSize: 200, servingUnit: 'g', isDefault: true },
  { id: 'def-97', name: 'Kavun', category: 'meyve-sebze', calories: 70, protein: 1.6, carbs: 16, fat: 0.4, servingSize: 200, servingUnit: 'g', isDefault: true },
  { id: 'def-98', name: 'Üzüm', category: 'meyve-sebze', calories: 69, protein: 0.7, carbs: 18, fat: 0.2, servingSize: 100, servingUnit: 'g', isDefault: true },
  { id: 'def-99', name: 'Kayısı', category: 'meyve-sebze', calories: 17, protein: 0.5, carbs: 3.9, fat: 0.1, servingSize: 1, servingUnit: 'adet', isDefault: true },
  { id: 'def-100', name: 'Havuç', category: 'meyve-sebze', calories: 25, protein: 0.6, carbs: 6, fat: 0.1, servingSize: 1, servingUnit: 'adet', isDefault: true },
  { id: 'def-101', name: 'Patates Püresi', category: 'karbonhidrat', calories: 113, protein: 2, carbs: 16, fat: 4.5, servingSize: 100, servingUnit: 'g', isDefault: true },
  { id: 'def-102', name: 'Mısır (Haşlanmış)', category: 'karbonhidrat', calories: 96, protein: 3.4, carbs: 21, fat: 1.5, servingSize: 1, servingUnit: 'adet', isDefault: true },
  { id: 'def-103', name: 'Pirinç Patlağı', category: 'atıştırmalık', calories: 35, protein: 0.7, carbs: 7.3, fat: 0.3, servingSize: 1, servingUnit: 'adet', isDefault: true },
  { id: 'def-104', name: 'Grissini (Sade)', category: 'atıştırmalık', calories: 15, protein: 0.5, carbs: 3, fat: 0.2, servingSize: 1, servingUnit: 'adet', isDefault: true },
  { id: 'def-105', name: 'Kurabiye (Yulaflı)', category: 'atıştırmalık', calories: 65, protein: 1, carbs: 9, fat: 3, servingSize: 1, servingUnit: 'adet', isDefault: true },
  { id: 'def-106', name: 'Dondurma (Sade)', category: 'atıştırmalık', calories: 104, protein: 1.8, carbs: 12, fat: 5.5, servingSize: 1, servingUnit: 'porsiyon', isDefault: true }
];

/** Tüm besin kütüphanesini getirir (Varsayılanlar + Özel Ekleşenler) */
export function getAllFoodItems(): FoodItem[] {
  try {
    const raw = localStorage.getItem(KEYS.FOODS);
    if (!raw) return DEFAULT_FOOD_ITEMS;
    const custom = JSON.parse(raw) as FoodItem[];
    return [...DEFAULT_FOOD_ITEMS, ...custom];
  } catch {
    return DEFAULT_FOOD_ITEMS;
  }
}

/** Besin kütüphanesine yeni besin ekler */
export function addFoodItem(item: FoodItem): FoodItem[] {
  try {
    const raw = localStorage.getItem(KEYS.FOODS);
    const custom = raw ? (JSON.parse(raw) as FoodItem[]) : [];
    const updated = [...custom, item];
    localStorage.setItem(KEYS.FOODS, JSON.stringify(updated));
    return [...DEFAULT_FOOD_ITEMS, ...updated];
  } catch {
    return DEFAULT_FOOD_ITEMS;
  }
}

/** Besin kütüphanesindeki besini günceller (Sadece özel besinler) */
export function updateFoodItem(id: string, data: Partial<FoodItem>): FoodItem[] {
  try {
    const raw = localStorage.getItem(KEYS.FOODS);
    const custom = raw ? (JSON.parse(raw) as FoodItem[]) : [];
    const updated = custom.map(f =>
      f.id === id ? { ...f, ...data } : f
    );
    localStorage.setItem(KEYS.FOODS, JSON.stringify(updated));
    return [...DEFAULT_FOOD_ITEMS, ...updated];
  } catch {
    return DEFAULT_FOOD_ITEMS;
  }
}

/** Besin kütüphanesinden besin siler (Sadece özel besinler) */
export function deleteFoodItem(id: string): FoodItem[] {
  try {
    const raw = localStorage.getItem(KEYS.FOODS);
    const custom = raw ? (JSON.parse(raw) as FoodItem[]) : [];
    const updated = custom.filter(f => f.id !== id);
    localStorage.setItem(KEYS.FOODS, JSON.stringify(updated));
    return [...DEFAULT_FOOD_ITEMS, ...updated];
  } catch {
    return DEFAULT_FOOD_ITEMS;
  }
}

// -------- Helpers --------

/** Benzersiz ID üretir */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Bugünün tarihini YYYY-MM-DD formatında döner */
export function todayString(): string {
  return new Date().toISOString().split('T')[0];
}

/** Tarihi okunabilir formata çevirir (Türkçe) */
export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('tr-TR', {
    weekday: 'long',
    day:     'numeric',
    month:   'long',
    year:    'numeric',
  });
}

/** Kalori değerine göre renk sınıfı döner */
export function calorieColor(pct: number): string {
  if (pct < 60)  return '#00C853';
  if (pct < 85)  return '#f59e0b';
  if (pct < 100) return '#f97316';
  return '#ef4444';
}

// -------- Water Tracker (Su Takibi) --------

/** Belirli bir tarihteki su tüketimini ml cinsinden döner */
export function getWaterIntake(date: string): number {
  try {
    const raw = localStorage.getItem(KEYS.WATER);
    if (!raw) return 0;
    const data = JSON.parse(raw) as Record<string, number>;
    return data[date] || 0;
  } catch {
    return 0;
  }
}

/** Belirli bir tarihteki su tüketimini kaydeder */
export function saveWaterIntake(date: string, amount: number): void {
  try {
    const raw = localStorage.getItem(KEYS.WATER);
    const data = raw ? (JSON.parse(raw) as Record<string, number>) : {};
    data[date] = amount;
    localStorage.setItem(KEYS.WATER, JSON.stringify(data));
  } catch {}
}
