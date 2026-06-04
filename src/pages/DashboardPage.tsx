// ============================================================
// Benim Kalorim – Dashboard Page
// Ana panel: günlük özet, kalori ring, makrolar, son kayıtlar
// ============================================================

import { useState } from 'react';
import { Plus, Flame, TrendingUp, Apple, Droplets, UtensilsCrossed, X, Scale } from 'lucide-react';
import { useFoodEntries }      from '../hooks/useFoodEntries';
import { useProfile }          from '../hooks/useProfile';
import { useToast }            from '../hooks/useToast';
import { useSmartSuggestions } from '../hooks/useSmartSuggestions';
import { useFoodLibrary }      from '../hooks/useFoodLibrary';
import { CalorieRing }         from '../components/CalorieRing';
import { MacroBar }            from '../components/MacroBar';
import { FoodEntryCard }       from '../components/FoodEntryCard';
import { FoodEntryModal }      from '../components/FoodEntryModal';
import { LibraryFoodModal }    from '../components/LibraryFoodModal';
import { ConfirmDialog }       from '../components/ConfirmDialog';
import { ToastContainer }      from '../components/ToastContainer';
import { SmartSuggestions }    from '../components/SmartSuggestions';
import { WaterTracker }        from '../components/WaterTracker';
import { formatDate, getWaterIntake, saveWaterIntake } from '../utils/storage';
import type { FoodEntry, NewFoodEntry, MealType, FoodCategory } from '../interfaces';

const DEFAULT_GOAL = { calories: 2000, protein: 150, carbs: 225, fat: 55 };

export function DashboardPage() {
  const { entries, today, addEntry, updateEntry, deleteEntry, getDailyTotals } = useFoodEntries();
  const { profile, updateProfile } = useProfile();
  const toast       = useToast();
  const { foods, addFood } = useFoodLibrary();

  const [showModal,   setShowModal]   = useState(false);
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [defaultMealType, setDefaultMealType] = useState<MealType | undefined>(undefined);
  const [editEntry,   setEditEntry]   = useState<FoodEntry | null>(null);
  const [deleteId,    setDeleteId]    = useState<string | null>(null);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [checkinWeight, setCheckinWeight] = useState('');
  const [dismissedWeightPrompt, setDismissedWeightPrompt] = useState(false);

  const goal       = profile?.dailyGoal ?? DEFAULT_GOAL;
  const totals     = getDailyTotals(today);

  const [water, setWater] = useState(() => getWaterIntake(today));

  const handleAddWater = (amount: number) => {
    const nextVal = water + amount;
    setWater(nextVal);
    saveWaterIntake(today, nextVal);
    toast.success(`💧 ${amount} ml su eklendi!`);
  };

  const handleRemoveWater = (amount: number) => {
    const nextVal = Math.max(water - amount, 0);
    setWater(nextVal);
    saveWaterIntake(today, nextVal);
    toast.success(`💧 250 ml su çıkarıldı.`);
  };

  // Akıllı öneriler (kural tabanlı analiz)
  const suggestions = useSmartSuggestions({
    entries:    entries.filter(e => e.date === today),
    allEntries: entries,
    goal,
    today,
    waterIntake: water,
    waterGoal: profile?.waterGoal ?? 2500,
  });

  // Haftalık Tartı Kontrolü
  const lastWeightUpdate = profile?.weightUpdatedAt || profile?.updatedAt;
  const isSevenDaysPassed = lastWeightUpdate
    ? (Date.now() - new Date(lastWeightUpdate).getTime()) / (1000 * 60 * 60 * 24) >= 7
    : true;

  const showWeightPrompt = isSevenDaysPassed && !dismissedWeightPrompt;

  const handleOpenWeightModal = () => {
    setCheckinWeight(profile?.weight ? String(profile.weight) : '');
    setShowWeightModal(true);
  };

  const handleDismissWeightPrompt = () => {
    setDismissedWeightPrompt(true);
  };

  const handleSaveWeeklyWeight = () => {
    const weightNum = parseFloat(checkinWeight);
    if (isNaN(weightNum) || weightNum < 30 || weightNum > 250) {
      toast.error('Lütfen geçerli bir kilo girin (30 - 250 kg)');
      return;
    }

    if (!profile) return;

    updateProfile({
      weight: weightNum,
      weightUpdatedAt: new Date().toISOString(),
    });

    setShowWeightModal(false);
    setDismissedWeightPrompt(true);
    toast.success(`Kilonuz ${weightNum} kg olarak güncellendi ve hedefleriniz otomatik optimize edildi! 🎯`);
  };

  const handleOpenAddModal = (mealType?: MealType) => {
    setDefaultMealType(mealType);
    setShowModal(true);
  };

  // CREATE
  const handleAdd = (data: NewFoodEntry) => {
    addEntry(data);
    setShowModal(false);
    toast.success(`"${data.name}" eklendi! 🎉`);
  };

  // CREATE LIBRARY FOOD
  const handleAddLibraryFood = (data: {
    name: string;
    category: FoodCategory;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    servingSize: number;
    servingUnit: string;
  }) => {
    const alreadyExists = foods.some(f => f.name.toLowerCase() === data.name.toLowerCase());
    if (alreadyExists) {
      toast.error(`"${data.name}" zaten kütüphanede mevcut!`);
      return;
    }
    addFood(data);
    setShowLibraryModal(false);
    toast.success(`"${data.name}" kütüphaneye eklendi! 📚`);
  };

  // UPDATE
  const handleUpdate = (id: string, data: Partial<NewFoodEntry>) => {
    updateEntry(id, data);
    setEditEntry(null);
    toast.success('Kayıt güncellendi ✅');
  };

  // DELETE
  const handleDelete = () => {
    if (!deleteId) return;
    const entry = entries.find(e => e.id === deleteId);
    deleteEntry(deleteId);
    setDeleteId(null);
    toast.success(`"${entry?.name}" silindi`);
  };

  const statCards = [
    {
      label: 'Kalori',
      value: totals.calories,
      goal:  goal.calories,
      unit:  'kcal',
      icon:  <Flame size={20} />,
      color: '#00C853',
    },
    {
      label: 'Protein',
      value: totals.protein,
      goal:  goal.protein,
      unit:  'g',
      icon:  <TrendingUp size={20} />,
      color: '#00C853',
    },
    {
      label: 'Karbonhidrat',
      value: totals.carbs,
      goal:  goal.carbs,
      unit:  'g',
      icon:  <Apple size={20} />,
      color: '#3b82f6',
    },
    {
      label: 'Yağ',
      value: totals.fat,
      goal:  goal.fat,
      unit:  'g',
      icon:  <Droplets size={20} />,
      color: '#f59e0b',
    },
  ];

  return (
    <main className="max-w-6xl mx-auto px-4 py-6 pb-24 md:pb-6">
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 border-b pb-4 border-surface-border" style={{ borderColor: 'var(--color-border)' }}>
        <div className="animate-fade-in min-w-0">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2 flex-wrap">
            <span>👋</span>
            <span>Merhaba,</span>
            <span className="bg-gradient-to-r from-[#00C853] to-[#3b82f6] bg-clip-text text-transparent font-black">
              {profile?.name ? profile.name : 'Misafir'}!
            </span>
          </h1>
          <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            {formatDate(today)}
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            id="dashboard-add-btn"
            className="btn-primary w-full sm:w-auto px-5 py-3 rounded-xl justify-center flex-shrink-0"
            onClick={() => handleOpenAddModal()}
            title="Öğün Ekle"
          >
            <Plus size={18} />
            <span>Öğün Ekle</span>
          </button>
        </div>
      </div>

      {/* Weekly Weight Check-in Prompt */}
      {showWeightPrompt && (
        <div className="card border border-blue-500/30 bg-blue-500/5 flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 animate-scale-in">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-500/10 border border-blue-500/25 flex-shrink-0">
              <Scale className="text-blue-400" size={24} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                ⚖️ Haftalık Tartı Zamanı!
                <span className="badge-green text-[9px] px-1.5 py-0.5 rounded-full font-bold">Asistan</span>
              </h3>
              <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                Kilonuzu güncelleyerek bazal metabolizma hızınızı ve günlük kalori/su hedeflerinizi otomatik olarak optimize edin.
              </p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto flex-shrink-0">
            <button
              className="btn-secondary text-xs py-2 px-4 rounded-lg flex-1 sm:flex-none justify-center"
              onClick={handleDismissWeightPrompt}
            >
              Daha Sonra
            </button>
            <button
              className="btn-primary text-xs py-2 px-4 rounded-lg flex-1 sm:flex-none justify-center"
              onClick={handleOpenWeightModal}
            >
              Kilo Güncelle
            </button>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* Left – Calorie Ring + Macros + Smart Suggestions */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="card flex flex-col items-center gap-6">
            <CalorieRing
              consumed={totals.calories}
              goal={goal.calories}
              size={180}
            />
            <div className="w-full flex flex-col gap-3">
              <MacroBar
                label="Protein"
                consumed={totals.protein}
                goal={goal.protein}
                color="#00C853"
              />
              <MacroBar
                label="Karbonhidrat"
                consumed={totals.carbs}
                goal={goal.carbs}
                color="#3b82f6"
              />
              <MacroBar
                label="Yağ"
                consumed={totals.fat}
                goal={goal.fat}
                color="#f59e0b"
              />
            </div>
          </div>

          {/* Su Takibi */}
          <WaterTracker
            consumed={water}
            goal={profile?.waterGoal ?? 2500}
            onAdd={handleAddWater}
            onRemove={handleRemoveWater}
          />
 
          {/* Akıllı Vücut Analizi & Öngörü */}
          {profile && (() => {
            const bmi = profile.weight / ((profile.height / 100) ** 2);
            const bmiLabel =
              bmi < 18.5 ? { label: 'Zayıf',     color: '#3b82f6' } :
              bmi < 25   ? { label: 'Normal',     color: '#00C853' } :
              bmi < 30   ? { label: 'Fazla Kilo', color: '#f59e0b' } :
                           { label: 'Obez',       color: '#ef4444' };

            const bmr = Math.round(10 * profile.weight + 6.25 * profile.height - 5 * profile.age + (profile.gender === 'erkek' ? 5 : -161));
            const activityMultiplier = {
              'hareketsiz':    1.2,
              'az-aktif':      1.375,
              'orta-aktif':    1.55,
              'çok-aktif':     1.725,
              'ekstra-aktif':  1.9,
            }[profile.activityLevel] || 1.2;
            const tdee = Math.round(bmr * activityMultiplier);
            const calorieDiff = goal.calories - tdee;

            return (
              <div className="card flex flex-col gap-3">
                <div className="flex items-center gap-2 border-b pb-2" style={{ borderColor: 'var(--color-border)' }}>
                  <span className="text-base">🧠</span>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Akıllı Vücut Analizi & Öngörü</h3>
                </div>
                
                {/* VKE / BMI */}
                <div className="flex items-center justify-between text-xs">
                  <span style={{ color: 'var(--color-text-muted)' }}>Vücut Kitle İndeksi (VKE):</span>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-white">{bmi.toFixed(1)}</span>
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{
                        color: bmiLabel.color,
                        background: `${bmiLabel.color}15`,
                        border: `1px solid ${bmiLabel.color}35`,
                      }}
                    >
                      {bmiLabel.label}
                    </span>
                  </div>
                </div>

                {/* Öngörü */}
                <div className="pt-2 border-t text-[11px] leading-relaxed" style={{ borderColor: 'rgba(255,255,255,0.03)' }}>
                  {calorieDiff < -100 ? (
                    <div style={{ color: 'var(--color-text-muted)' }}>
                      🔥 Günlük <b className="text-white">{Math.abs(calorieDiff)} kcal</b> kalori açığı ile haftalık ortalama <b className="text-green-400 font-bold">{((Math.abs(calorieDiff) * 7) / 9000).toFixed(2)} - {((Math.abs(calorieDiff) * 7) / 7000).toFixed(2)} kg</b> vermeniz öngörülüyor.
                    </div>
                  ) : calorieDiff > 100 ? (
                    <div style={{ color: 'var(--color-text-muted)' }}>
                      ⚡ Günlük <b className="text-white">{calorieDiff} kcal</b> kalori fazlası ile haftalık ortalama <b className="text-blue-400 font-bold">{((calorieDiff * 7) / 9000).toFixed(2)} - {((calorieDiff * 7) / 7000).toFixed(2)} kg</b> almanız öngörülüyor.
                    </div>
                  ) : (
                    <div style={{ color: 'var(--color-text-muted)' }}>
                      ⚖️ Kalori alımınız metabolizma hızınızla dengede. Kilonuzun sabit kalması beklenir.
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Akıllı Öneriler */}
          <SmartSuggestions suggestions={suggestions} />
        </div>

        {/* Right – Stats + Today's entries */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {statCards.map(stat => (
              <div key={stat.label} className="stat-card">
                <div className="flex items-center gap-2">
                  <span style={{ color: stat.color }}>{stat.icon}</span>
                  <span className="text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>
                    {stat.label}
                  </span>
                </div>
                <p className="text-xl font-black text-white">
                  {Math.round(stat.value)}
                  <span className="text-xs font-normal ml-1" style={{ color: 'var(--color-text-muted)' }}>
                    {stat.unit}
                  </span>
                </p>
                <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                  Hedef: {stat.goal}{stat.unit}
                </p>
              </div>
            ))}
          </div>

          {/* Today's Entries Grouped by Meals */}
          <div className="card flex flex-col gap-5">
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--color-border)' }}>
              <div>
                <h2 className="section-title text-base">Bugünkü Öğünler</h2>
                <p className="section-subtitle text-xs">{totals.count} kayıt · Toplam {totals.calories} kcal</p>
              </div>
              <button
                id="dashboard-view-all-btn"
                className="btn-secondary text-xs px-3 py-1.5"
                onClick={() => window.location.href = '/yemekler'}
              >
                Günlüğe Git
              </button>
            </div>

            <div className="flex flex-col gap-5">
              {[
                { type: 'kahvaltı' as MealType, label: 'Kahvaltı',  emoji: '🌅' },
                { type: 'öğle'     as MealType, label: 'Öğle',      emoji: '☀️' },
                { type: 'akşam'    as MealType, label: 'Akşam',     emoji: '🌙' },
                { type: 'ara-öğün' as MealType, label: 'Ara Öğün',  emoji: '🍎' },
              ].map(meal => {
                const mealEntries = entries.filter(e => e.date === today && e.mealType === meal.type);
                const mealCalories = mealEntries.reduce((sum, e) => sum + e.calories, 0);

                return (
                  <div key={meal.type} className="flex flex-col gap-2">
                    {/* Meal Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{meal.emoji}</span>
                        <h3 className="text-sm font-bold text-white">{meal.label}</h3>
                        {mealCalories > 0 && (
                          <span className="text-xs font-semibold" style={{ color: 'var(--color-brand)' }}>
                            · {mealCalories} kcal
                          </span>
                        )}
                      </div>
                      <button
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:bg-opacity-80"
                        style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-muted)' }}
                        onClick={() => handleOpenAddModal(meal.type)}
                        onMouseEnter={e => {
                          e.currentTarget.style.color = 'var(--color-brand)';
                          e.currentTarget.style.background = 'rgba(0, 200, 83, 0.1)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.color = 'var(--color-text-muted)';
                          e.currentTarget.style.background = 'var(--color-surface-2)';
                        }}
                        aria-label={`${meal.label} için öğün ekle`}
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    {/* Meal Items */}
                    {mealEntries.length === 0 ? (
                      <div
                        className="border border-dashed rounded-xl p-3 flex items-center justify-center gap-2 transition-all text-xs cursor-pointer select-none"
                        style={{
                          borderColor: 'var(--color-border)',
                          color: 'var(--color-text-muted)',
                          background: 'rgba(255,255,255,0.01)',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = 'var(--color-brand)';
                          e.currentTarget.style.color = 'var(--color-brand)';
                          e.currentTarget.style.background = 'rgba(0, 200, 83, 0.03)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = 'var(--color-border)';
                          e.currentTarget.style.color = 'var(--color-text-muted)';
                          e.currentTarget.style.background = 'rgba(255,255,255,0.01)';
                        }}
                        onClick={() => handleOpenAddModal(meal.type)}
                      >
                        <Plus size={12} /> {meal.label} için öğün ekle
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {mealEntries.map(entry => (
                          <FoodEntryCard
                            key={entry.id}
                            entry={entry}
                            onEdit={e => setEditEntry(e)}
                            onDelete={id => setDeleteId(id)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showModal && (
        <FoodEntryModal
          onSave={handleAdd}
          onUpdate={handleUpdate}
          onClose={() => setShowModal(false)}
          defaultDate={today}
          defaultMealType={defaultMealType}
        />
      )}

      {showLibraryModal && (
        <LibraryFoodModal
          onClose={() => setShowLibraryModal(false)}
          onSave={handleAddLibraryFood}
        />
      )}

      {editEntry && (
        <FoodEntryModal
          entry={editEntry}
          onSave={handleAdd}
          onUpdate={handleUpdate}
          onClose={() => setEditEntry(null)}
        />
      )}

      {deleteId && (
        <ConfirmDialog
          title="Kaydı Sil"
          message="Bu öğün kaydını silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}

      {/* Weekly Weight Check-in Modal */}
      {showWeightModal && (
        <div className="modal-overlay animate-fade-in" onClick={e => { if (e.target === e.currentTarget) setShowWeightModal(false); }}>
          <div className="modal-box max-w-sm animate-scale-in" role="dialog" aria-modal="true">
            <div className="flex items-center justify-between mb-4 border-b pb-2.5" style={{ borderColor: 'var(--color-border)' }}>
              <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                <Scale size={18} className="text-brand" />
                <span>Kilo Güncelle & Hesapla</span>
              </h2>
              <button
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-muted)' }}
                onClick={() => setShowWeightModal(false)}
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="flex flex-col gap-4">
              <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                Güncel kilonuzu girdiğinizde bazal metabolizma hızınız ve günlük kalori/su hedefleriniz otomatik olarak yeniden hesaplanacaktır.
              </p>
              
              <div className="input-group">
                <label htmlFor="checkin-weight" className="input-label">Güncel Kilo (kg)</label>
                <div className="relative">
                  <input
                    id="checkin-weight"
                    type="number"
                    step="0.1"
                    min="30"
                    max="250"
                    className="input-field pr-12"
                    placeholder="Örn: 72.5"
                    value={checkinWeight}
                    onChange={e => setCheckinWeight(e.target.value)}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>
                    kg
                  </span>
                </div>
              </div>
              
              <button
                className="btn-primary w-full py-2.5 rounded-xl justify-center font-bold text-xs"
                onClick={handleSaveWeeklyWeight}
              >
                Kilo Güncelle ve Yeniden Hesapla
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
