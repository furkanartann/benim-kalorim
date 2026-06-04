// ============================================================
// Benim Kalorim – MacroBar Component
// Makro besin değerleri ilerleme çubuğu
// ============================================================

interface MacroBarProps {
  label: string;
  consumed: number;
  goal: number;
  unit?: string;
  color: string;
}

export function MacroBar({ label, consumed, goal, unit = 'g', color }: MacroBarProps) {
  const pct = Math.min((consumed / (goal || 1)) * 100, 100);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>
          {label}
        </span>
        <span className="text-xs font-bold text-white">
          {Math.round(consumed)}{unit}
          <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>
            {' '}/ {goal}{unit}
          </span>
        </span>
      </div>

      <div className="progress-bar-track">
        <div
          className="progress-bar-fill"
          style={{
            width: `${pct}%`,
            background: color,
          }}
        />
      </div>
    </div>
  );
}
