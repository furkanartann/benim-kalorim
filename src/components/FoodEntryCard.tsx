// ============================================================
// Benim Kalorim – FoodEntryCard Component
// Yemek kaydı liste öğesi
// ============================================================

import { Pencil, Trash2, Clock, Tag } from 'lucide-react';
import type { FoodEntry } from '../interfaces';

const MEAL_LABELS: Record<FoodEntry['mealType'], string> = {
  'kahvaltı':  'Kahvaltı',
  'öğle':      'Öğle',
  'akşam':     'Akşam',
  'ara-öğün':  'Ara Öğün',
};

const MEAL_COLORS: Record<FoodEntry['mealType'], string> = {
  'kahvaltı':  '#f59e0b',
  'öğle':      '#3b82f6',
  'akşam':     '#8b5cf6',
  'ara-öğün':  '#00C853',
};

const CATEGORY_EMOJIS: Record<FoodEntry['category'], string> = {
  'protein':       '🥩',
  'karbonhidrat':  '🍞',
  'sağlıklı-yağ': '🥑',
  'meyve-sebze':  '🥦',
  'süt-ürünü':    '🥛',
  'içecek':        '🥤',
  'atıştırmalık':  '🍪',
  'diğer':         '🍽️',
};

interface FoodEntryCardProps {
  entry: FoodEntry;
  onEdit:   (entry: FoodEntry) => void;
  onDelete: (id: string)        => void;
}

function formatPortion(quantity: number, servingUnit: string): string {
  const unit = servingUnit.trim();
  
  // If it starts with "1 " (e.g., "1 adet", "1 porsiyon")
  if (/^1\s+/i.test(unit)) {
    const stripped = unit.replace(/^1\s+/i, '');
    return `${quantity} ${stripped}`;
  }
  
  // If it's a number followed by space (e.g., "100 gram")
  if (/^\d+(\.\d+)?\s+/i.test(unit)) {
    return `${quantity} x ${unit}`;
  }
  
  // Otherwise
  return `${quantity} ${unit}`;
}

export function FoodEntryCard({ entry, onEdit, onDelete }: FoodEntryCardProps) {
  const mealColor = MEAL_COLORS[entry.mealType];

  return (
    <article
      className="card-sm flex items-center gap-3 group animate-slide-up"
      style={{ transition: 'border-color 0.2s' }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border-light)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)';
      }}
    >
      {/* Category Emoji */}
      <div className="text-2xl w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: 'var(--color-surface-2)' }}>
        {CATEGORY_EMOJIS[entry.category]}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <h3 className="text-sm font-semibold text-white truncate max-w-[150px] sm:max-w-none">{entry.name}</h3>
          {entry.quantity && entry.servingUnit && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ color: 'var(--color-text-muted)', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
              {formatPortion(entry.quantity, entry.servingUnit)}
            </span>
          )}
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
            style={{
              color: mealColor,
              background: `${mealColor}22`,
              border: `1px solid ${mealColor}44`,
            }}
          >
            {MEAL_LABELS[entry.mealType]}
          </span>
        </div>

        {/* Macros */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
            P: <b className="text-white">{entry.protein}g</b>
          </span>
          <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
            K: <b className="text-white">{entry.carbs}g</b>
          </span>
          <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
            Y: <b className="text-white">{entry.fat}g</b>
          </span>
        </div>

        {entry.note && (
          <p className="text-xs mt-1 truncate" style={{ color: 'var(--color-text-muted)' }}>
            {entry.note}
          </p>
        )}
      </div>

      {/* Calories */}
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span className="text-lg font-black" style={{ color: 'var(--color-brand)' }}>
          {entry.calories}
        </span>
        <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>kal</span>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          id={`edit-${entry.id}`}
          className="btn-edit px-2 py-1.5 text-xs"
          onClick={() => onEdit(entry)}
          aria-label={`${entry.name} düzenle`}
        >
          <Pencil size={13} />
        </button>
        <button
          id={`delete-${entry.id}`}
          className="btn-danger px-2 py-1.5 text-xs"
          onClick={() => onDelete(entry.id)}
          aria-label={`${entry.name} sil`}
        >
          <Trash2 size={13} />
        </button>
      </div>
    </article>
  );
}
