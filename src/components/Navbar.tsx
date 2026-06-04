// ============================================================
// Benim Kalorim – Navbar Component
// Üst navigasyon çubuğu ve küresel mobil/masaüstü öğünler yan paneli (Drawer)
// ============================================================

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, UtensilsCrossed, BarChart3, User, Plus, X } from 'lucide-react';
import { useFoodEntries } from '../hooks/useFoodEntries';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from './ToastContainer';
import { FoodEntryCard } from './FoodEntryCard';
import { FoodEntryModal } from './FoodEntryModal';
import { ConfirmDialog } from './ConfirmDialog';
import type { MealType, NewFoodEntry, FoodEntry } from '../interfaces';

const NAV_LINKS = [
  { to: '/',         label: 'Panel',     icon: LayoutDashboard },
  { to: '/yemekler', label: 'Besinler',  icon: UtensilsCrossed },
  { to: '/istatistik', label: 'İstatistik', icon: BarChart3 },
  { to: '/profil',   label: 'Profil',    icon: User },
];

export function Navbar() {
  const { pathname } = useLocation();
  const { entries, today, addEntry, updateEntry, deleteEntry, getDailyTotals } = useFoodEntries();
  const toast = useToast();

  const [showMealsDrawer, setShowMealsDrawer] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [defaultMealType, setDefaultMealType] = useState<MealType | undefined>(undefined);
  const [editEntry, setEditEntry] = useState<FoodEntry | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const totals = getDailyTotals(today);

  useEffect(() => {
    const handleOpen = () => setShowMealsDrawer(true);
    window.addEventListener('open-meals-drawer', handleOpen);
    return () => window.removeEventListener('open-meals-drawer', handleOpen);
  }, []);

  const handleOpenAddModal = (mealType?: MealType) => {
    setDefaultMealType(mealType);
    setShowModal(true);
  };

  const handleAdd = (data: NewFoodEntry) => {
    addEntry(data);
    setShowModal(false);
    toast.success(`"${data.name}" eklendi! 🎉`);
  };

  const handleUpdate = (id: string, data: Partial<NewFoodEntry>) => {
    updateEntry(id, data);
    setEditEntry(null);
    toast.success('Kayıt güncellendi ✅');
  };

  const handleDelete = () => {
    if (!deleteId) return;
    const entry = entries.find(e => e.id === deleteId);
    deleteEntry(deleteId);
    setDeleteId(null);
    toast.success(`"${entry?.name}" silindi`);
  };

  return (
    <>
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />

      <header className="sticky top-0 z-40 w-full" style={{
        background: 'rgba(26, 31, 46, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo + Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/logo.png"
              alt="Benim Kalorim"
              className="w-10 h-10 rounded-full object-cover"
              style={{ flexShrink: 0 }}
              onError={e => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
            <div className="flex flex-col leading-none">
              <span className="text-base font-bold" style={{ color: 'var(--color-brand)' }}>
                Benim Kalorim
              </span>
              <span className="text-[10px] font-medium hidden sm:block" style={{ color: 'var(--color-text-muted)' }}>
                Akıllı Kalori Takip Uygulaması
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-2">
            {NAV_LINKS.map(({ to, label, icon: Icon }) => {
              const active = pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                  style={{
                    color: active ? 'var(--color-brand)' : 'var(--color-text-muted)',
                    background: active ? 'rgba(0,200,83,0.12)' : 'transparent',
                    border: active ? '1px solid rgba(0,200,83,0.25)' : '1px solid transparent',
                  }}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              );
            })}
            <button
              onClick={() => setShowMealsDrawer(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
              style={{
                color: 'var(--color-brand)',
                background: 'rgba(0, 200, 83, 0.08)',
                border: '1px solid rgba(0, 200, 83, 0.2)',
              }}
              title="Günün Öğün Özetleri"
            >
              <UtensilsCrossed size={16} />
              <span>Öğünlerim</span>
            </button>
          </nav>

          {/* Mobile Right Action Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setShowMealsDrawer(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95"
              style={{
                color: 'var(--color-brand)',
                background: 'rgba(0, 200, 83, 0.08)',
                border: '1px solid rgba(0, 200, 83, 0.2)',
              }}
              title="Öğünlerimi Göster"
            >
              <UtensilsCrossed size={14} />
              <span>Öğünlerim</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2"
        style={{
          background: 'rgba(26, 31, 46, 0.95)',
          backdropFilter: 'blur(16px)',
          borderTop: '1px solid var(--color-border)',
          paddingBottom: 'calc(8px + env(safe-area-inset-bottom, 0px))',
          paddingTop: '8px',
          height: 'calc(58px + env(safe-area-inset-bottom, 0px))',
        }}>
        {NAV_LINKS.map(({ to, label, icon: Icon }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className="flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all duration-200"
              style={{
                color: active ? 'var(--color-brand)' : 'var(--color-text-muted)',
              }}
            >
              <Icon size={20} />
              <span className="text-[10px] font-semibold">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Global Meals Drawer (Sliding Right Sidebar) */}
      {showMealsDrawer && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setShowMealsDrawer(false)}
          />

          {/* Drawer Content */}
          <div
            className="fixed right-0 top-0 bottom-0 w-[85%] max-w-[400px] p-6 shadow-2xl flex flex-col gap-4 animate-slide-left z-50"
            style={{
              background: 'var(--color-surface)',
              borderLeft: '1px solid var(--color-border)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-3 mb-2" style={{ borderColor: 'var(--color-border)' }}>
              <div>
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <UtensilsCrossed size={16} className="text-brand" />
                  <span>Bugünkü Öğünlerim</span>
                </h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  {totals.count} kayıt · Toplam {totals.calories} kcal
                </p>
              </div>
              <button
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-muted)' }}
                onClick={() => setShowMealsDrawer(false)}
                aria-label="Kapat"
              >
                <X size={16} />
              </button>
            </div>

            {/* Meals List (Scrollable) */}
            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-5">
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
                        <h3 className="text-xs sm:text-sm font-bold text-white">{meal.label}</h3>
                        {mealCalories > 0 && (
                          <span className="text-xs font-semibold" style={{ color: 'var(--color-brand)' }}>
                            · {mealCalories} kcal
                          </span>
                        )}
                      </div>
                      <button
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:bg-opacity-80"
                        style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-muted)' }}
                        onClick={() => {
                          setShowMealsDrawer(false);
                          handleOpenAddModal(meal.type);
                        }}
                        aria-label={`${meal.label} için öğün ekle`}
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    {/* Meal Items */}
                    {mealEntries.length === 0 ? (
                      <div
                        className="border border-dashed rounded-xl p-2.5 flex items-center justify-center gap-2 transition-all text-xs cursor-pointer select-none"
                        style={{
                          borderColor: 'var(--color-border)',
                          color: 'var(--color-text-muted)',
                          background: 'rgba(255,255,255,0.01)',
                        }}
                        onClick={() => {
                          setShowMealsDrawer(false);
                          handleOpenAddModal(meal.type);
                        }}
                      >
                        <Plus size={12} /> {meal.label} için öğün ekle
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {mealEntries.map(entry => (
                          <FoodEntryCard
                            key={entry.id}
                            entry={entry}
                            onEdit={e => {
                              setShowMealsDrawer(false);
                              setEditEntry(e);
                            }}
                            onDelete={id => {
                              setShowMealsDrawer(false);
                              setDeleteId(id);
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer inside Drawer */}
            <button
              className="btn-secondary w-full py-2.5 text-xs rounded-xl"
              onClick={() => {
                setShowMealsDrawer(false);
                window.location.href = '/yemekler';
              }}
            >
              Detaylı Günlüğe Git
            </button>
          </div>
        </div>
      )}

      {/* Drawer CRUD Modals */}
      {showModal && (
        <FoodEntryModal
          onSave={handleAdd}
          onUpdate={handleUpdate}
          onClose={() => setShowModal(false)}
          defaultDate={today}
          defaultMealType={defaultMealType}
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
    </>
  );
}
