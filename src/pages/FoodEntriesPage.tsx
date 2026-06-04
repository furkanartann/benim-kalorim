// ============================================================
// Benim Kalorim – Food Entries Page (Yemekler)
// Tüm kayıtların listelenmesi, arama, filtreleme, CRUD
// ============================================================

import { useState, useMemo } from 'react';
import { Plus, Search, Filter, X, ChevronLeft, ChevronRight, Trash2, BookOpen, Info } from 'lucide-react';
import { useFoodEntries } from '../hooks/useFoodEntries';
import { useProfile }     from '../hooks/useProfile';
import { useToast }       from '../hooks/useToast';
import { useFoodLibrary } from '../hooks/useFoodLibrary';
import { FoodEntryCard }  from '../components/FoodEntryCard';
import { FoodEntryModal } from '../components/FoodEntryModal';
import { ConfirmDialog }  from '../components/ConfirmDialog';
import { LibraryFoodModal } from '../components/LibraryFoodModal';
import { ToastContainer } from '../components/ToastContainer';
import { formatDate, getWaterIntake }     from '../utils/storage';
import type { FoodEntry, NewFoodEntry, FilterOptions, MealType, FoodCategory, FoodItem } from '../interfaces';

const MEAL_OPTIONS: { value: MealType | 'tümü'; label: string }[] = [
  { value: 'tümü',    label: 'Tüm Öğünler' },
  { value: 'kahvaltı',label: '🌅 Kahvaltı'  },
  { value: 'öğle',    label: '☀️ Öğle'     },
  { value: 'akşam',   label: '🌙 Akşam'    },
  { value: 'ara-öğün',label: '🍎 Ara Öğün' },
];

const CATEGORY_EMOJIS: Record<FoodCategory, string> = {
  'protein':       '🥩',
  'karbonhidrat':  '🍞',
  'sağlıklı-yağ': '🥑',
  'meyve-sebze':  '🥦',
  'süt-ürünü':    '🥛',
  'içecek':        '🥤',
  'atıştırmalık':  '🍪',
  'diğer':         '🍽️',
};

export function FoodEntriesPage() {
  const { entries, today, addEntry, updateEntry, deleteEntry, getDailyTotals } = useFoodEntries();
  const { profile } = useProfile();
  const toast       = useToast();

  const { foods, addFood, deleteFood } = useFoodLibrary();

  const [activeTab, setActiveTab] = useState<'log' | 'library'>('log');
  const [showModal, setShowModal]   = useState(false);
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [editEntry, setEditEntry]   = useState<FoodEntry | null>(null);
  const [deleteId,  setDeleteId]    = useState<string | null>(null);
  const [deleteLibraryId, setDeleteLibraryId] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterOptions>({
    date:        today,
    mealType:    'tümü',
    category:    'tümü',
    searchQuery: '',
  });

  const [librarySearchQuery, setLibrarySearchQuery] = useState('');
  const [libraryCategoryFilter, setLibraryCategoryFilter] = useState<'tümü' | FoodCategory>('tümü');

  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({});

  const setFilter = <K extends keyof FilterOptions>(key: K, val: FilterOptions[K]) =>
    setFilters(f => ({ ...f, [key]: val }));

  const toggleDate = (date: string) => {
    setExpandedDates(prev => ({
      ...prev,
      [date]: !prev[date],
    }));
  };

  const isExpanded = (date: string, index: number) => {
    if (expandedDates[date] !== undefined) {
      return expandedDates[date];
    }
    return index === 0;
  };

  // Filtered and grouped entries
  const groupedLog = useMemo(() => {
    const filteredEntries = entries.filter(entry => {
      if (filters.mealType !== 'tümü' && entry.mealType !== filters.mealType) return false;
      if (filters.category !== 'tümü' && entry.category !== filters.category) return false;
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        if (!entry.name.toLowerCase().includes(q)) return false;
      }
      return true;
    });

    const groups: Record<string, FoodEntry[]> = {};
    filteredEntries.forEach(entry => {
      if (!groups[entry.date]) {
        groups[entry.date] = [];
      }
      groups[entry.date].push(entry);
    });

    const sortedDates = Object.keys(groups).sort((a, b) => b.localeCompare(a));

    return sortedDates.map(date => {
      const dayEntries = groups[date];
      const totalCalories = dayEntries.reduce((sum, e) => sum + e.calories, 0);
      const totalProtein = dayEntries.reduce((sum, e) => sum + e.protein, 0);
      const totalCarbs = dayEntries.reduce((sum, e) => sum + e.carbs, 0);
      const totalFat = dayEntries.reduce((sum, e) => sum + e.fat, 0);
      const waterIntake = getWaterIntake(date);

      return {
        date,
        entries: dayEntries,
        waterIntake,
        totals: {
          calories: totalCalories,
          protein: totalProtein,
          carbs: totalCarbs,
          fat: totalFat,
        },
      };
    });
  }, [entries, filters.mealType, filters.category, filters.searchQuery]);

  const totalFilteredEntriesCount = useMemo(() => {
    return groupedLog.reduce((acc, g) => acc + g.entries.length, 0);
  }, [groupedLog]);

  // Filtered library items
  const filteredLibrary = useMemo(() => {
    return foods.filter(item => {
      if (libraryCategoryFilter !== 'tümü' && item.category !== libraryCategoryFilter) return false;
      if (librarySearchQuery.trim()) {
        const q = librarySearchQuery.toLowerCase();
        if (!item.name.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [foods, librarySearchQuery, libraryCategoryFilter]);

  // CREATE
  const handleAdd = (data: NewFoodEntry) => {
    addEntry(data);
    setShowModal(false);
    toast.success(`"${data.name}" eklendi! 🎉`);
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

  // DELETE LIBRARY FOOD
  const handleDeleteLibraryFood = () => {
    if (!deleteLibraryId) return;
    const item = foods.find(f => f.id === deleteLibraryId);
    if (item?.isDefault) {
      toast.error('Varsayılan sistem besinleri silinemez.');
      return;
    }
    deleteFood(deleteLibraryId);
    setDeleteLibraryId(null);
    toast.success(`"${item?.name}" kütüphaneden silindi`);
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-6">
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 border-b pb-4 border-surface-border" style={{ borderColor: 'var(--color-border)' }}>
        <div className="animate-fade-in min-w-0">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {activeTab === 'log' ? '🍽️ Besin Günlüğü' : '📚 Besin Kütüphanesi'}
          </h1>
          <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            {activeTab === 'log' 
              ? `${totalFilteredEntriesCount} kayıt · ${groupedLog.length} gün` 
              : `${filteredLibrary.length} besin tanımlı`}
          </p>
        </div>
        <button
          id={activeTab === 'log' ? 'food-add-btn' : 'library-add-btn'}
          className="btn-primary w-full sm:w-auto px-5 py-3 rounded-xl justify-center flex-shrink-0"
          onClick={() => activeTab === 'log' ? setShowModal(true) : setShowLibraryModal(true)}
          title={activeTab === 'log' ? 'Öğün Ekle' : 'Yeni Besin Ekle'}
        >
          <Plus size={18} />
          <span>
            {activeTab === 'log' ? 'Öğün Ekle' : 'Yeni Besin Ekle'}
          </span>
        </button>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 mb-6 p-1 rounded-xl" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
        <button
          className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all"
          style={{
            background: activeTab === 'log' ? 'var(--color-surface)' : 'transparent',
            color: activeTab === 'log' ? 'var(--color-brand)' : 'var(--color-text-muted)',
            border: activeTab === 'log' ? '1px solid var(--color-border)' : '1px solid transparent',
          }}
          onClick={() => setActiveTab('log')}
        >
          📅 Günlük Kayıtlar
        </button>
        <button
          className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all"
          style={{
            background: activeTab === 'library' ? 'var(--color-surface)' : 'transparent',
            color: activeTab === 'library' ? 'var(--color-brand)' : 'var(--color-text-muted)',
            border: activeTab === 'library' ? '1px solid var(--color-border)' : '1px solid transparent',
          }}
          onClick={() => setActiveTab('library')}
        >
          📚 Besin Kütüphanesi
        </button>
      </div>

      {/* TAB CONTENT: DAILY LOG */}
      {activeTab === 'log' && (
        <div className="flex flex-col gap-4">
          {/* Filters */}
          <div className="card flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--color-text-muted)' }} />
              <input
                id="search-input"
                type="text"
                className="input-field pl-9 py-2"
                placeholder="Besin günlüğümde ara..."
                value={filters.searchQuery}
                onChange={e => setFilter('searchQuery', e.target.value)}
              />
              {filters.searchQuery && (
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  onClick={() => setFilter('searchQuery', '')}
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Meal filter */}
            <select
              id="meal-filter"
              className="input-field py-2 sm:max-w-[160px]"
              value={filters.mealType}
              onChange={e => setFilter('mealType', e.target.value as MealType | 'tümü')}
            >
              {MEAL_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Grouped Collapsible Date Logs */}
          {groupedLog.length === 0 ? (
            <div className="card flex flex-col items-center justify-center py-16 gap-4">
              <span className="text-6xl">🔍</span>
              <p className="font-bold text-white text-lg">Kayıt bulunamadı</p>
              <p className="text-sm text-center" style={{ color: 'var(--color-text-muted)' }}>
                {filters.searchQuery
                  ? `"${filters.searchQuery}" için sonuç yok`
                  : 'Henüz hiçbir besin kaydı girmemişsiniz.'}
              </p>
              <button
                id="empty-add-btn"
                className="btn-primary mt-2"
                onClick={() => setShowModal(true)}
              >
                <Plus size={16} /> Öğün Ekle
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {groupedLog.map((group, idx) => {
                const expanded = isExpanded(group.date, idx);
                const { date, entries: dayEntries, totals: dayTotals } = group;

                // Calculate macro percentages for visual distribution bar
                const totalMacros = dayTotals.protein + dayTotals.carbs + dayTotals.fat;
                const proteinPct = totalMacros > 0 ? (dayTotals.protein / totalMacros) * 100 : 0;
                const carbsPct = totalMacros > 0 ? (dayTotals.carbs / totalMacros) * 100 : 0;
                const fatPct = totalMacros > 0 ? (dayTotals.fat / totalMacros) * 100 : 0;

                return (
                  <div key={date} className="card flex flex-col gap-3 overflow-hidden transition-all duration-200" style={{ borderColor: 'var(--color-border)' }}>
                    {/* Header (Clickable) */}
                    <div 
                      className="flex items-center justify-between cursor-pointer select-none"
                      onClick={() => toggleDate(date)}
                    >
                      <div className="flex flex-col gap-0.5">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <span>📅 {formatDate(date)}</span>
                          {date === today && (
                            <span className="badge-green text-[9px] px-1.5 py-0.5 font-bold rounded-full font-bold">Bugün</span>
                          )}
                        </h3>
                        <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                          {dayEntries.length} kayıt
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-sm font-black text-white">{dayTotals.calories} kcal</span>
                          <p className="text-[9px] mt-0.5 font-medium" style={{ color: 'var(--color-text-muted)' }}>
                            P: <span className="text-white font-semibold">{Math.round(dayTotals.protein)}g</span> · K: <span className="text-white font-semibold">{Math.round(dayTotals.carbs)}g</span> · Y: <span className="text-white font-semibold">{Math.round(dayTotals.fat)}g</span>
                          </p>
                        </div>
                        <ChevronRight 
                          size={16} 
                          style={{ 
                            color: 'var(--color-text-muted)',
                            transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)', 
                            transition: 'transform 0.2s' 
                          }} 
                        />
                      </div>
                    </div>

                    {/* Macro Ratio Bar */}
                    {totalMacros > 0 && (
                      <div className="flex h-1.5 rounded-full overflow-hidden bg-[rgba(255,255,255,0.05)] w-full">
                        <div style={{ width: `${proteinPct}%`, backgroundColor: '#00C853' }} title={`Protein: ${Math.round(dayTotals.protein)}g`} />
                        <div style={{ width: `${carbsPct}%`, backgroundColor: '#3b82f6' }} title={`Karbonhidrat: ${Math.round(dayTotals.carbs)}g`} />
                        <div style={{ width: `${fatPct}%`, backgroundColor: '#f59e0b' }} title={`Yağ: ${Math.round(dayTotals.fat)}g`} />
                      </div>
                    )}

                    {/* Water Progress Bar */}
                    {(group.waterIntake > 0 || totalMacros > 0) && (
                      <div className="flex items-center gap-2 mt-1 text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                        <span className="flex items-center gap-0.5 font-bold" style={{ color: '#60a5fa' }}>
                          💧 Su:
                        </span>
                        <span>
                          {group.waterIntake} ml / {profile?.waterGoal ?? 2500} ml
                        </span>
                        <div className="flex-1 h-1 rounded-full overflow-hidden bg-[rgba(255,255,255,0.05)] relative">
                          <div 
                            className="h-full bg-blue-500 rounded-full" 
                            style={{ 
                              width: `${Math.min((group.waterIntake / (profile?.waterGoal ?? 2500)) * 100, 100)}%`,
                              transition: 'width 0.4s ease'
                            }} 
                          />
                        </div>
                      </div>
                    )}

                    {/* Details List (Collapsible) */}
                    {expanded && (
                      <div className="flex flex-col gap-4 mt-2 pt-3 border-t animate-fade-in" style={{ borderColor: 'var(--color-border)' }}>
                        {[
                          { type: 'kahvaltı' as MealType, label: 'Kahvaltı',  emoji: '🌅' },
                          { type: 'öğle'     as MealType, label: 'Öğle',      emoji: '☀️' },
                          { type: 'akşam'    as MealType, label: 'Akşam',     emoji: '🌙' },
                          { type: 'ara-öğün' as MealType, label: 'Ara Öğün',  emoji: '🍎' },
                        ].map(meal => {
                          const mealEntries = dayEntries.filter(e => e.mealType === meal.type);
                          if (mealEntries.length === 0) return null;
                          const mealCalories = mealEntries.reduce((sum, e) => sum + e.calories, 0);

                          return (
                            <div key={meal.type} className="flex flex-col gap-2">
                              {/* Meal Type Sub-header */}
                              <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.03)] pb-1">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                                  <span>{meal.emoji}</span>
                                  <span>{meal.label}</span>
                                  <span className="font-normal" style={{ color: 'var(--color-text-muted)' }}>
                                    ({mealEntries.length})
                                  </span>
                                </div>
                                <span className="text-xs font-bold" style={{ color: 'var(--color-brand)' }}>
                                  {mealCalories} kcal
                                </span>
                              </div>

                              {/* Meal items */}
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
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: FOOD LIBRARY */}
      {activeTab === 'library' && (
        <div className="flex flex-col gap-4">
          {/* Search and category filters */}
          <div className="card flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--color-text-muted)' }} />
              <input
                id="library-search-input"
                type="text"
                className="input-field pl-9 py-2"
                placeholder="Kütüphanede besin ara..."
                value={librarySearchQuery}
                onChange={e => setLibrarySearchQuery(e.target.value)}
              />
              {librarySearchQuery && (
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  onClick={() => setLibrarySearchQuery('')}
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Category filter */}
            <select
              id="library-category-filter"
              className="input-field py-2 sm:max-w-[200px]"
              value={libraryCategoryFilter}
              onChange={e => setLibraryCategoryFilter(e.target.value as 'tümü' | FoodCategory)}
            >
              <option value="tümü">Tüm Kategoriler</option>
              <option value="protein">🥩 Protein</option>
              <option value="karbonhidrat">🍞 Karbonhidrat</option>
              <option value="sağlıklı-yağ">🥑 Sağlıklı Yağ</option>
              <option value="meyve-sebze">🥦 Meyve/Sebze</option>
              <option value="süt-ürünü">🥛 Süt Ürünü</option>
              <option value="içecek">🥤 İçecek</option>
              <option value="atıştırmalık">🍪 Atıştırmalık</option>
              <option value="diğer">🍽️ Diğer</option>
            </select>
          </div>

          {/* Library Food Items List */}
          {filteredLibrary.length === 0 ? (
            <div className="card flex flex-col items-center justify-center py-16 gap-4">
              <span className="text-6xl">📚</span>
              <p className="font-bold text-white text-lg">Kütüphanede besin yok</p>
              <p className="text-sm text-center" style={{ color: 'var(--color-text-muted)' }}>
                Aradığınız kriterlere uygun besin bulunamadı.
              </p>
              <button
                className="btn-primary mt-2"
                onClick={() => setShowLibraryModal(true)}
              >
                <Plus size={16} /> Yeni Besin Ekle
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filteredLibrary.map(item => (
                <div 
                  key={item.id} 
                  className="card-sm flex items-center justify-between group animate-slide-up"
                  style={{ transition: 'border-color 0.2s' }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--color-border-light)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--color-border)';
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'var(--color-surface-2)' }}>
                      {CATEGORY_EMOJIS[item.category] || '🍽️'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-white">{item.name}</p>
                        {item.isDefault ? (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.3)' }}>Sistem</span>
                        ) : (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6', border: '1px solid rgba(139, 92, 246, 0.3)' }}>Özel</span>
                        )}
                      </div>
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        Porsiyon: <b>{item.servingSize} {item.servingUnit}</b> · Kalori: <b className="text-white">{item.calories} kcal</b>
                      </p>
                      <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                        P: <span className="text-white font-medium">{item.protein}g</span> · K: <span className="text-white font-medium">{item.carbs}g</span> · Y: <span className="text-white font-medium">{item.fat}g</span>
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  {!item.isDefault && (
                    <button
                      className="btn-danger p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => setDeleteLibraryId(item.id)}
                      aria-label={`${item.name} sil`}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Daily Entry Modal */}
      {showModal && (
        <FoodEntryModal
          onSave={handleAdd}
          onUpdate={handleUpdate}
          onClose={() => setShowModal(false)}
          defaultDate={filters.date}
        />
      )}

      {/* Edit Entry Modal */}
      {editEntry && (
        <FoodEntryModal
          entry={editEntry}
          onSave={handleAdd}
          onUpdate={handleUpdate}
          onClose={() => setEditEntry(null)}
        />
      )}

      {/* Add to Library Modal */}
      {showLibraryModal && (
        <LibraryFoodModal
          onClose={() => setShowLibraryModal(false)}
          onSave={handleAddLibraryFood}
        />
      )}

      {/* Delete Entry Dialog */}
      {deleteId && (
        <ConfirmDialog
          title="Kaydı Sil"
          message="Bu öğün kaydını silmek istediğinize emin misiniz?"
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}

      {/* Delete Library Item Dialog */}
      {deleteLibraryId && (
        <ConfirmDialog
          title="Besini Kütüphaneden Sil"
          message="Bu özel besini kütüphanenizden kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
          onConfirm={handleDeleteLibraryFood}
          onCancel={() => setDeleteLibraryId(null)}
        />
      )}
    </main>
  );
}
