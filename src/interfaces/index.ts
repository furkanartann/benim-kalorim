// ============================================================
// Benim Kalorim – Interfaces
// Uygulama genelinde kullanılan TypeScript tip tanımları
// ============================================================

/**
 * Yemek kaydı arayüzü
 */
export interface FoodEntry {
  id: string;
  name: string;
  calories: number;
  protein: number;    // gram
  carbs: number;      // gram
  fat: number;        // gram
  category: FoodCategory;
  mealType: MealType;
  date: string;       // ISO date string (YYYY-MM-DD)
  createdAt: string;  // ISO datetime string
  updatedAt: string;  // ISO datetime string
  note?: string;
  quantity?: number;  // Tüketilen miktar
  servingUnit?: string; // Tüketim birimi (örn: adet, g, porsiyon)
}

/**
 * Yeni yemek kaydı oluşturmak için veri tipi (id ve tarihler hariç)
 */
export type NewFoodEntry = Omit<FoodEntry, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Yemek kaydını güncellemek için veri tipi
 */
export type UpdateFoodEntry = Partial<NewFoodEntry>;

/**
 * Besin Kütüphanesindeki bir yiyeceğin yapısı
 */
export interface FoodItem {
  id: string;
  name: string;
  category: FoodCategory;
  calories: number;     // 1 birim/servis boyutu için kalori
  protein: number;      // 1 birim/servis boyutu için protein (g)
  carbs: number;        // 1 birim/servis boyutu için karbonhidrat (g)
  fat: number;          // 1 birim/servis boyutu için yağ (g)
  servingSize: number;  // Varsayılan servis büyüklüğü (örn: 100, 1)
  servingUnit: string;  // Varsayılan servis birimi (örn: 'g', 'adet', 'porsiyon')
  isDefault?: boolean;  // Hazır gelen sistem besini mi?
  createdAt?: string;
}

/**
 * Yeni besin kütüphanesi kaydı tipi
 */
export type NewFoodItem = Omit<FoodItem, 'id' | 'isDefault' | 'createdAt'>;

/**
 * Yemek kategorileri
 */
export type FoodCategory =
  | 'protein'
  | 'karbonhidrat'
  | 'sağlıklı-yağ'
  | 'meyve-sebze'
  | 'süt-ürünü'
  | 'içecek'
  | 'atıştırmalık'
  | 'diğer';

/**
 * Öğün türleri
 */
export type MealType =
  | 'kahvaltı'
  | 'öğle'
  | 'akşam'
  | 'ara-öğün';

/**
 * Günlük kalori hedefi
 */
export interface DailyGoal {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

/**
 * Günlük özet istatistikleri
 */
export interface DailySummary {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  entryCount: number;
}

/**
 * Kullanıcı profili
 */
export interface UserProfile {
  name: string;
  age: number;
  weight: number;    // kg
  height: number;    // cm
  gender: 'erkek' | 'kadın';
  activityLevel: ActivityLevel;
  goal: WeightGoal;
  dailyGoal: DailyGoal;
  waterGoal?: number; // ml
  updatedAt: string;
  weightUpdatedAt?: string;
}

/**
 * Aktivite seviyesi
 */
export type ActivityLevel =
  | 'hareketsiz'
  | 'az-aktif'
  | 'orta-aktif'
  | 'çok-aktif'
  | 'ekstra-aktif';

/**
 * Kilo hedefi
 */
export type WeightGoal = 'kilo-ver' | 'kilo-koru' | 'kilo-al';

/**
 * Toast bildirim tipi
 */
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning';
  message: string;
}

/**
 * LocalStorage'da saklanan veri yapısı
 */
export interface AppStorage {
  foodEntries: FoodEntry[];
  userProfile: UserProfile | null;
  lastUpdated: string;
}

/**
 * Form doğrulama hataları
 */
export interface FormErrors {
  [key: string]: string | undefined;
}

/**
 * Filtre seçenekleri
 */
export interface FilterOptions {
  date: string;
  mealType: MealType | 'tümü';
  category: FoodCategory | 'tümü';
  searchQuery: string;
}
