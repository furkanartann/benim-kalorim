// ============================================================
// Benim Kalorim – CalorieRing Component
// Dairesel kalori ilerleme göstergesi
// ============================================================

interface CalorieRingProps {
  consumed: number;
  goal: number;
  size?: number;
}

export function CalorieRing({ consumed, goal, size = 160 }: CalorieRingProps) {
  const pct        = Math.min(consumed / (goal || 1), 1);
  const radius     = (size / 2) - 14;
  const circ       = 2 * Math.PI * radius;
  const dash       = circ * pct;
  const remaining  = Math.max(goal - consumed, 0);

  // Renk geçişi: yeşil → turuncu → kırmızı
  const strokeColor = pct < 0.7 ? '#00C853' : pct < 0.9 ? '#f59e0b' : '#ef4444';

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth={10}
          />
          {/* Fill */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={10}
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.6s cubic-bezier(0.4,0,0.2,1), stroke 0.3s' }}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-black" style={{ color: strokeColor, lineHeight: 1 }}>
            {consumed.toLocaleString('tr-TR')}
          </span>
          <span className="text-xs font-semibold mt-1" style={{ color: 'var(--color-text-muted)' }}>
            kal
          </span>
          <span className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            / {goal.toLocaleString('tr-TR')}
          </span>
        </div>
      </div>

      {/* Labels */}
      <div className="flex gap-6 text-center">
        <div>
          <p className="text-lg font-bold text-white">{remaining.toLocaleString('tr-TR')}</p>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Kalan kal</p>
        </div>
        <div>
          <p className="text-lg font-bold" style={{ color: 'var(--color-brand)' }}>
            {Math.round(pct * 100)}%
          </p>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Tüketildi</p>
        </div>
      </div>
    </div>
  );
}
