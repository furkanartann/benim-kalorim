// ============================================================
// Benim Kalorim – SmartSuggestions Component
// Akıllı öneri kartları — Dashboard'da gösterilir
// ============================================================

import type { Suggestion, SuggestionType } from '../hooks/useSmartSuggestions';

interface SmartSuggestionsProps {
  suggestions: Suggestion[];
}

const TYPE_STYLES: Record<SuggestionType, {
  border: string;
  bg:     string;
  dot:    string;
  badge:  string;
  label:  string;
}> = {
  warning: {
    border: 'rgba(245, 158, 11, 0.35)',
    bg:     'rgba(245, 158, 11, 0.06)',
    dot:    '#f59e0b',
    badge:  'rgba(245,158,11,0.15)',
    label:  'Uyarı',
  },
  success: {
    border: 'rgba(0, 200, 83, 0.35)',
    bg:     'rgba(0, 200, 83, 0.06)',
    dot:    '#00C853',
    badge:  'rgba(0,200,83,0.15)',
    label:  'Harika',
  },
  tip: {
    border: 'rgba(59, 130, 246, 0.35)',
    bg:     'rgba(59, 130, 246, 0.06)',
    dot:    '#3b82f6',
    badge:  'rgba(59,130,246,0.15)',
    label:  'İpucu',
  },
  info: {
    border: 'rgba(139, 92, 246, 0.35)',
    bg:     'rgba(139, 92, 246, 0.06)',
    dot:    '#8b5cf6',
    badge:  'rgba(139,92,246,0.15)',
    label:  'Bilgi',
  },
};

export function SmartSuggestions({ suggestions }: SmartSuggestionsProps) {
  if (suggestions.length === 0) return null;

  return (
    <section aria-label="Akıllı Öneriler" className="animate-slide-up">
      {/* Section header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">🧠</span>
        <h2 className="text-sm font-bold text-white">Akıllı Öneriler</h2>
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto"
          style={{ background: 'rgba(0,200,83,0.15)', color: 'var(--color-brand)', border: '1px solid rgba(0,200,83,0.3)' }}
        >
          {suggestions.length} öneri
        </span>
      </div>

      {/* Suggestion cards */}
      <div className="flex flex-col gap-2">
        {suggestions.map((s, i) => {
          const style = TYPE_STYLES[s.type];
          return (
            <div
              key={s.id}
              className="flex items-start gap-3 p-3 rounded-xl transition-all duration-200"
              style={{
                background:   style.bg,
                border:       `1px solid ${style.border}`,
                animationDelay: `${i * 60}ms`,
              }}
              role="listitem"
            >
              {/* Emoji icon */}
              <span
                className="text-xl flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: style.badge }}
                aria-hidden="true"
              >
                {s.emoji}
              </span>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-bold text-white leading-tight">{s.title}</p>
                  {/* Type badge */}
                  <span
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: style.badge, color: style.dot }}
                  >
                    {style.label}
                  </span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                  {s.message}
                </p>
              </div>

              {/* Color accent dot */}
              <div
                className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5 animate-pulse-slow"
                style={{ background: style.dot }}
                aria-hidden="true"
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
