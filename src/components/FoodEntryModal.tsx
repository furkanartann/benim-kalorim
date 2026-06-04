// ============================================================
// Benim Kalorim – FoodEntryModal Component
// Yemek ekleme / düzenleme modal formu
// ============================================================

import { useState, useEffect, useRef } from 'react';
import { X, Plus, Save, Info } from 'lucide-react';
import type { FoodEntry, NewFoodEntry, FoodCategory, MealType, FoodItem } from '../interfaces';
import { useFoodLibrary } from '../hooks/useFoodLibrary';

interface FoodEntryModalProps {
  entry?:    FoodEntry | null;   // null = yeni kayıt, FoodEntry = düzenleme
  onSave:    (data: NewFoodEntry)           => void;
  onUpdate:  (id: string, data: Partial<NewFoodEntry>) => void;
  onClose:   () => void;
  defaultDate?: string;
  defaultMealType?: MealType;
}

const CATEGORIES: { value: FoodCategory; label: string; emoji: string }[] = [
  { value: 'protein',      label: 'Protein',       emoji: '🥩' },
  { value: 'karbonhidrat', label: 'Karbonhidrat',  emoji: '🍞' },
  { value: 'sağlıklı-yağ',label: 'Sağlıklı Yağ',  emoji: '🥑' },
  { value: 'meyve-sebze',  label: 'Meyve/Sebze',   emoji: '🥦' },
  { value: 'süt-ürünü',   label: 'Süt Ürünü',     emoji: '🥛' },
  { value: 'içecek',       label: 'İçecek',         emoji: '🥤' },
  { value: 'atıştırmalık', label: 'Atıştırmalık',  emoji: '🍪' },
  { value: 'diğer',        label: 'Diğer',          emoji: '🍽️' },
];

const MEAL_TYPES: { value: MealType; label: string }[] = [
  { value: 'kahvaltı', label: '🌅 Kahvaltı' },
  { value: 'öğle',     label: '☀️ Öğle'    },
  { value: 'akşam',    label: '🌙 Akşam'   },
  { value: 'ara-öğün', label: '🍎 Ara Öğün'},
];

type FormData = {
  name:     string;
  calories: string;
  protein:  string;
  carbs:    string;
  fat:      string;
  category: FoodCategory;
  mealType: MealType;
  date:     string;
  note:     string;
  quantity: string;
  servingUnit: string;
};

const EMPTY: FormData = {
  name: '', calories: '', protein: '', carbs: '', fat: '',
  category: 'diğer', mealType: 'öğle',
  date: new Date().toISOString().split('T')[0],
  note: '',
  quantity: '1',
  servingUnit: 'porsiyon',
};

interface BaseValues {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: number;
  servingUnit: string;
}

interface ServingOption {
  label: string; // Örn: "100 gram", "1 gram"
  size: number;  // Temel birime göre çarpan boyutu (örn: 100, 1)
  unit: string;  // Birim ismi
}

function getServingOptions(baseUnit: string, baseSize: number): ServingOption[] {
  const unit = baseUnit.toLowerCase().trim();
  const options: ServingOption[] = [];

  if (unit === 'g' || unit === 'gram' || unit === 'gr') {
    options.push({ label: `${baseSize} gram`, size: baseSize, unit: 'g' });
    if (baseSize !== 1) {
      options.push({ label: '1 gram', size: 1, unit: 'g' });
    }
    options.push({ label: '1 porsiyon', size: baseSize, unit: 'porsiyon' });
  } else if (unit === 'ml' || unit === 'mililitre') {
    options.push({ label: `${baseSize} ml`, size: baseSize, unit: 'ml' });
    if (baseSize !== 1) {
      options.push({ label: '1 ml', size: 1, unit: 'ml' });
    }
    options.push({ label: '1 bardak (200 ml)', size: 200, unit: 'ml' });
    options.push({ label: '1 porsiyon', size: baseSize, unit: 'porsiyon' });
  } else if (unit === 'adet' || unit === 'tane') {
    options.push({ label: '1 adet', size: 1, unit: 'adet' });
    options.push({ label: '1 porsiyon', size: 1, unit: 'porsiyon' });
  } else if (unit === 'yemek kaşığı') {
    options.push({ label: '1 yemek kaşığı', size: 1, unit: 'yemek kaşığı' });
    options.push({ label: '1 porsiyon', size: 1, unit: 'porsiyon' });
  } else if (unit === 'fincan') {
    options.push({ label: '1 fincan', size: 1, unit: 'fincan' });
    options.push({ label: '1 porsiyon', size: 1, unit: 'porsiyon' });
  } else {
    options.push({ label: `1 ${baseUnit}`, size: baseSize, unit: baseUnit });
    if (baseUnit !== 'porsiyon') {
      options.push({ label: '1 porsiyon', size: baseSize, unit: 'porsiyon' });
    }
  }

  return options;
}

export function FoodEntryModal({
  entry, onSave, onUpdate, onClose, defaultDate, defaultMealType,
}: FoodEntryModalProps) {
  const isEditing = !!entry;
  const { foods, addFood } = useFoodLibrary();

  const [form, setForm]             = useState<FormData>(EMPTY);
  const [errors, setErrors]         = useState<Partial<FormData & { quantity?: string }>>({});
  const [showDropdown, setShowDropdown] = useState(false);
  const [showManualMacros, setShowManualMacros] = useState(false);
  const [baseValues, setBaseValues] = useState<BaseValues | null>(null);

  const [servingOptions, setServingOptions] = useState<ServingOption[]>([]);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number>(0);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Düzenleme modunda formu doldur
  useEffect(() => {
    if (entry) {
      setForm({
        name:     entry.name,
        calories: String(entry.calories),
        protein:  String(entry.protein),
        carbs:    String(entry.carbs),
        fat:      String(entry.fat),
        category: entry.category,
        mealType: entry.mealType,
        date:     entry.date,
        note:     entry.note ?? '',
        quantity: entry.quantity ? String(entry.quantity) : '1',
        servingUnit: entry.servingUnit ?? 'porsiyon',
      });

      // Kütüphanede eşleşen besin var mı bul ve baseValues olarak belirle
      const matchingFood = foods.find(f => f.name.toLowerCase() === entry.name.toLowerCase());
      if (matchingFood) {
        setBaseValues({
          name:        matchingFood.name,
          calories:    matchingFood.calories,
          protein:     matchingFood.protein,
          carbs:       matchingFood.carbs,
          fat:         matchingFood.fat,
          servingSize: matchingFood.servingSize,
          servingUnit: matchingFood.servingUnit,
        });

        const opts = getServingOptions(matchingFood.servingUnit, matchingFood.servingSize);
        setServingOptions(opts);

        // Eşleşen opsiyonun indeksini bulalım
        const idx = opts.findIndex(o => o.label.toLowerCase() === (entry.servingUnit || '').toLowerCase() || o.unit.toLowerCase() === (entry.servingUnit || '').toLowerCase());
        setSelectedOptionIndex(idx >= 0 ? idx : 0);

        // Eğer kayıt değerleri kütüphanedekilerden farklıysa manuel modu aç
        const qtyVal = entry.quantity || 1;
        const optVal = opts[idx >= 0 ? idx : 0] || opts[0];
        const multiplier = (qtyVal * (optVal?.size || 1)) / matchingFood.servingSize;
        const expectedCal = Math.round(matchingFood.calories * multiplier);
        if (entry.calories !== expectedCal) {
          setShowManualMacros(true);
        }
      } else {
        // Kütüphanede yoksa direkt manuel girişi göster
        setShowManualMacros(true);
      }
    } else {
      setForm(f => ({
        ...f,
        date: defaultDate ?? EMPTY.date,
        mealType: defaultMealType ?? EMPTY.mealType,
      }));
    }
  }, [entry, defaultDate, defaultMealType, foods]);

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const recalculateValues = (qtyStr: string, optIndex: number, base: BaseValues | null) => {
    if (!base) return;
    const qty = parseFloat(qtyStr) || 0;
    const opt = servingOptions[optIndex];
    if (!opt) return;

    // Multiplier = (Quantity * Selected Option Size) / Base Serving Size
    const multiplier = (qty * opt.size) / base.servingSize;

    setForm(f => ({
      ...f,
      calories: String(Math.round(base.calories * multiplier)),
      protein:  String(Math.round(base.protein * multiplier * 10) / 10),
      carbs:    String(Math.round(base.carbs * multiplier * 10) / 10),
      fat:      String(Math.round(base.fat * multiplier * 10) / 10),
    }));
  };

  const set = (field: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const val = e.target.value;
      setForm(f => ({ ...f, [field]: val }));

      // Miktar değiştiğinde hesaplama yap
      if (field === 'quantity' && baseValues) {
        recalculateValues(val, selectedOptionIndex, baseValues);
      }
    };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setForm(f => ({ ...f, name: val }));
    setShowDropdown(true);

    // Kütüphane eşleşmesi bozulduysa baseValues'ı sıfırla
    if (baseValues && val.trim().toLowerCase() !== baseValues.name.toLowerCase()) {
      setBaseValues(null);
      setServingOptions([]);
    }
  };

  const handleSelectFood = (item: FoodItem) => {
    const opts = getServingOptions(item.servingUnit, item.servingSize);
    setServingOptions(opts);
    setSelectedOptionIndex(0);
    setShowManualMacros(false); // Kütüphaneden seçildiği için manuel giriş kapansın

    setForm(f => ({
      ...f,
      name:        item.name,
      category:    item.category,
      calories:    String(item.calories),
      protein:     String(item.protein),
      carbs:       String(item.carbs),
      fat:         String(item.fat),
      quantity:    '1',
      servingUnit: opts[0]?.label || item.servingUnit,
    }));

    setBaseValues({
      name:        item.name,
      calories:    item.calories,
      protein:     item.protein,
      carbs:       item.carbs,
      fat:         item.fat,
      servingSize: item.servingSize,
      servingUnit: item.servingUnit,
    });

    setShowDropdown(false);
  };

  // Eşleşen kütüphane besinlerini filtrele
  const matchingFoods = form.name.trim()
    ? foods.filter(f => f.name.toLowerCase().includes(form.name.toLowerCase()))
    : [];

  const validate = (): boolean => {
    const errs: Partial<FormData & { quantity?: string }> = {};
    if (!form.name.trim())         errs.name     = 'İsim gerekli';

    if (!baseValues && !showManualMacros) {
      errs.name = 'Kütüphanede eşleşen besin bulunamadı. Lütfen listeden seçin veya aşağıdaki "Manuel kalori ve makro girmek istiyorum" kutucuğunu işaretleyin.';
      setErrors(errs);
      return false;
    }

    if (!form.calories || isNaN(+form.calories) || +form.calories < 0)
                                   errs.calories = 'Geçerli kalori girin';
    if (!form.protein  || isNaN(+form.protein)  || +form.protein  < 0)
                                   errs.protein  = 'Geçerli protein girin';
    if (!form.carbs    || isNaN(+form.carbs)    || +form.carbs    < 0)
                                   errs.carbs    = 'Geçerli karbonhidrat girin';
    if (!form.fat      || isNaN(+form.fat)      || +form.fat      < 0)
                                   errs.fat      = 'Geçerli yağ girin';
    if (!form.quantity || isNaN(+form.quantity) || +form.quantity <= 0)
                                   errs.quantity = 'Geçerli miktar girin';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const quantityNum = Number(form.quantity);
    const selectedOpt = baseValues ? servingOptions[selectedOptionIndex] : null;

    const data: NewFoodEntry = {
      name:        form.name.trim(),
      calories:    Number(form.calories),
      protein:     Number(form.protein),
      carbs:       Number(form.carbs),
      fat:         Number(form.fat),
      category:    form.category,
      mealType:    form.mealType,
      date:        form.date,
      note:        form.note.trim() || undefined,
      quantity:    quantityNum,
      servingUnit: selectedOpt ? selectedOpt.label : form.servingUnit.trim() || 'porsiyon',
    };

    // Eğer manuel girilmişse (kütüphanede eşleşme yoksa) besin kütüphanesine otomatik kaydet
    if (!isEditing && !baseValues) {
      const alreadyExists = foods.some(f => f.name.toLowerCase() === form.name.trim().toLowerCase());
      if (!alreadyExists) {
        addFood({
          name:        form.name.trim(),
          category:    form.category,
          calories:    Number(form.calories),
          protein:     Number(form.protein),
          carbs:       Number(form.carbs),
          fat:         Number(form.fat),
          servingSize: Number(form.quantity) || 1,
          servingUnit: form.servingUnit.trim() || 'porsiyon',
        });
      }
    }

    if (isEditing && entry) {
      onUpdate(entry.id, data);
    } else {
      onSave(data);
    }
  };

  // ESC ile kapat
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const shouldShowManual = showManualMacros;

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box" role="dialog" aria-modal="true"
        aria-label={isEditing ? 'Öğün Düzenle' : 'Öğün Kaydet'}>

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-white">
              {isEditing ? '✏️ Öğün Düzenle' : '➕ Öğün Kaydet'}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              Yediğiniz besinleri günlüğünüze kaydedin
            </p>
          </div>
          <button
            id="modal-close-btn"
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
            style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-muted)' }}
            onClick={onClose}
            aria-label="Kapat"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Besin adı (Autocomplete) */}
          <div className="input-group relative" ref={dropdownRef}>
            <label htmlFor="food-name" className="input-label">Besin Adı *</label>
            <input
              id="food-name"
              type="text"
              className="input-field"
              placeholder="Örn: Tavuk Göğsü, Yulaf Ezmesi..."
              value={form.name}
              onChange={handleNameChange}
              onFocus={() => setShowDropdown(true)}
              autoComplete="off"
            />
            {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}

            {/* Dropdown list */}
            {showDropdown && matchingFoods.length > 0 && (
              <div
                className="absolute left-0 right-0 top-full mt-1 max-h-48 overflow-y-auto rounded-xl border z-50 shadow-lg"
                style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)' }}
              >
                {matchingFoods.map(item => (
                  <div
                    key={item.id}
                    className="px-4 py-2 hover:bg-opacity-80 cursor-pointer flex items-center justify-between transition-all"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', color: 'var(--color-text)' }}
                    onClick={() => handleSelectFood(item)}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-border)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div>
                      <p className="text-xs font-semibold text-white">{item.name}</p>
                      <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                        {item.servingSize} {item.servingUnit} · {item.calories} kcal
                      </p>
                    </div>
                    <span className="text-[10px] font-semibold badge-green">{item.category}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Öğün & Kategori */}
          <div className={`grid ${shouldShowManual ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
            <div className="input-group">
              <label htmlFor="meal-type" className="input-label">Öğün</label>
              <select
                id="meal-type"
                className="input-field"
                value={form.mealType}
                onChange={set('mealType')}
              >
                {MEAL_TYPES.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            {shouldShowManual && (
              <div className="input-group">
                <label htmlFor="food-category" className="input-label">Kategori</label>
                <select
                  id="food-category"
                  className="input-field"
                  value={form.category}
                  onChange={set('category')}
                >
                  {CATEGORIES.map(c => (
                    <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Miktar ve Birim */}
          <div className="grid grid-cols-2 gap-3">
            <div className="input-group">
              <label htmlFor="food-quantity" className="input-label">
                Miktar *
              </label>
              <input
                id="food-quantity"
                type="number"
                min="0"
                step="any"
                className="input-field"
                placeholder="Örn: 100, 1.5, 1"
                value={form.quantity}
                onChange={set('quantity')}
              />
              {errors.quantity && <p className="text-xs text-red-400 mt-1">{errors.quantity}</p>}
            </div>
            <div className="input-group">
              <label htmlFor="food-serving-unit" className="input-label">Birim</label>
              {baseValues ? (
                <select
                  id="food-serving-unit"
                  className="input-field"
                  value={selectedOptionIndex}
                  onChange={e => {
                    const idx = Number(e.target.value);
                    setSelectedOptionIndex(idx);
                    recalculateValues(form.quantity, idx, baseValues);
                  }}
                >
                  {servingOptions.map((opt, i) => (
                    <option key={i} value={i}>{opt.label}</option>
                  ))}
                </select>
              ) : (
                <select
                  id="food-serving-unit"
                  className="input-field"
                  value={form.servingUnit}
                  onChange={set('servingUnit')}
                >
                  <option value="g">g (Gram)</option>
                  <option value="adet">adet (Adet/Tane)</option>
                  <option value="ml">ml (Mililitre)</option>
                  <option value="porsiyon">porsiyon (Porsiyon)</option>
                  <option value="yemek kaşığı">yemek kaşığı</option>
                  <option value="fincan">fincan</option>
                </select>
              )}
            </div>
          </div>

          {/* Kalori & Makrolar (Koşullu Gösterim veya Özet Kartı) */}
          {shouldShowManual ? (
            <>
              {/* Kalori */}
              <div className="input-group">
                <label htmlFor="food-calories" className="input-label">Kalori (kcal) *</label>
                <input
                  id="food-calories"
                  type="number"
                  min="0"
                  step="1"
                  className="input-field"
                  placeholder="0"
                  value={form.calories}
                  onChange={set('calories')}
                />
                {errors.calories && <p className="text-xs text-red-400 mt-1">{errors.calories}</p>}
              </div>

              {/* Makrolar */}
              <div>
                <div className="flex items-center gap-1 mb-2">
                  <Info size={12} style={{ color: 'var(--color-text-muted)' }} />
                  <span className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--color-text-muted)' }}>
                    Makro Besinler (gram)
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'food-protein', label: 'Protein',       field: 'protein'  as const, color: '#00C853' },
                    { id: 'food-carbs',   label: 'Karbonhidrat',  field: 'carbs'    as const, color: '#3b82f6' },
                    { id: 'food-fat',     label: 'Yağ',           field: 'fat'      as const, color: '#f59e0b' },
                  ].map(({ id, label, field, color }) => (
                    <div key={field} className="input-group">
                      <label htmlFor={id} className="input-label" style={{ color }}>
                        {label}
                      </label>
                      <input
                        id={id}
                        type="number"
                        min="0"
                        step="0.1"
                        className="input-field"
                        placeholder="0"
                        value={form[field]}
                        onChange={set(field)}
                      />
                      {errors[field] && (
                        <p className="text-xs text-red-400 mt-1">{errors[field]}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Özet Kartı */}
              {baseValues && (
                <div className="p-3.5 rounded-xl border flex flex-col gap-2 bg-[rgba(255,255,255,0.02)]" style={{ borderColor: 'var(--color-border)' }}>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-center" style={{ color: 'var(--color-text-muted)' }}>
                    📊 Bu Porsiyon İçin Besin Değerleri
                  </p>
                  <div className="grid grid-cols-4 gap-2 text-center mt-1">
                    <div>
                      <span className="text-sm font-black text-white">{form.calories || 0}</span>
                      <p className="text-[9px]" style={{ color: 'var(--color-text-muted)' }}>kcal</p>
                    </div>
                    <div>
                      <span className="text-sm font-black text-[#00C853]">{form.protein || 0}g</span>
                      <p className="text-[9px]" style={{ color: 'var(--color-text-muted)' }}>Protein</p>
                    </div>
                    <div>
                      <span className="text-sm font-black text-[#3b82f6]">{form.carbs || 0}g</span>
                      <p className="text-[9px]" style={{ color: 'var(--color-text-muted)' }}>Karb.</p>
                    </div>
                    <div>
                      <span className="text-sm font-black text-[#f59e0b]">{form.fat || 0}g</span>
                      <p className="text-[9px]" style={{ color: 'var(--color-text-muted)' }}>Yağ</p>
                    </div>
                  </div>
                </div>
              )}
              {/* Kütüphaneden seçilmediğinde bilgi placeholder'ı */}
              {!baseValues && (
                <div className="p-3.5 rounded-xl border flex flex-col gap-2 bg-[rgba(255,255,255,0.01)] text-center animate-pulse-slow" style={{ borderColor: 'var(--color-border)' }}>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    💡 Kütüphaneden bir besin seçin veya değerleri kendiniz girmek için aşağıdaki <b>Manuel kalori ve makro girmek istiyorum</b> kutucuğunu işaretleyin.
                  </p>
                </div>
              )}
            </>
          )}

          {/* Not */}
          <div className="input-group">
            <label htmlFor="food-note" className="input-label">Not (isteğe bağlı)</label>
            <textarea
              id="food-note"
              className="input-field resize-none"
              rows={2}
              placeholder="Ek bilgi, porsiyon miktarı..."
              value={form.note}
              onChange={set('note')}
            />
          </div>

          {/* Manuel Makro Giriş Seçeneği */}
          <label className="flex items-center gap-2 cursor-pointer py-1 select-none">
            <input
              type="checkbox"
              checked={showManualMacros}
              onChange={e => setShowManualMacros(e.target.checked)}
              className="rounded border-gray-600 text-green-500 focus:ring-green-500 focus:ring-opacity-25"
              style={{ width: '16px', height: '16px', accentColor: 'var(--color-brand)' }}
            />
            <span className="text-xs font-semibold text-white">
              ⚙️ Manuel kalori ve makro girmek istiyorum
            </span>
          </label>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              id="modal-cancel-btn"
              className="btn-secondary flex-1"
              onClick={onClose}
            >
              İptal
            </button>
            <button
              type="submit"
              id="modal-submit-btn"
              className="btn-primary flex-1"
            >
              {isEditing ? <><Save size={16} /> Güncelle</> : <><Plus size={16} /> Günlüğe Kaydet</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
