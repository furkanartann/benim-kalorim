// ============================================================
// Benim Kalorim – WaterTracker Component
// Su tüketimi takip arayüzü
// ============================================================

import { Droplets, Plus, Minus } from 'lucide-react';

interface WaterTrackerProps {
  consumed: number;
  goal: number;
  onAdd: (amount: number) => void;
  onRemove: (amount: number) => void;
}

export function WaterTracker({ consumed, goal, onAdd, onRemove }: WaterTrackerProps) {
  const pct = Math.min(consumed / (goal || 1), 1);
  const size = 150;
  const radius = (size / 2) - 12;
  const circ = 2 * Math.PI * radius;
  const dash = circ * pct;

  return (
    <section aria-label="Su Takibi" className="card flex flex-col items-center gap-4 animate-slide-up">
      {/* Header */}
      <div className="w-full flex items-center justify-between border-b pb-2 mb-1" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-2">
          <Droplets className="text-blue-400" size={18} />
          <h2 className="text-sm font-bold text-white">Su Takibi</h2>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)' }}>
          Hedef: {goal} ml
        </span>
      </div>

      {/* Progress Circle */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Base Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth={8}
          />
          {/* Active Water Progress */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#3b82f6"
            strokeWidth={8}
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <Droplets className="text-blue-500 animate-bounce-slow mb-1" size={24} />
          <span className="text-2xl font-black text-white leading-none">
            {consumed}
            <span className="text-xs font-normal text-gray-400 ml-0.5">ml</span>
          </span>
          <span className="text-[10px] text-gray-500 mt-1">
            %{Math.round(pct * 100)} tamamlandı
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full flex flex-col gap-2">
        <div className="grid grid-cols-3 gap-2">
          <button
            className="btn-secondary text-xs flex items-center justify-center gap-1 py-2 rounded-xl transition-all"
            onClick={() => onAdd(250)}
            style={{ border: '1px solid rgba(59,130,246,0.2)' }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'rgba(59,130,246,0.1)';
              e.currentTarget.style.borderColor = 'rgba(59,130,246,0.4)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = 'rgba(59,130,246,0.2)';
            }}
          >
            <Plus size={12} className="text-blue-400" />
            250 ml
          </button>
          <button
            className="btn-secondary text-xs flex items-center justify-center gap-1 py-2 rounded-xl transition-all"
            onClick={() => onAdd(500)}
            style={{ border: '1px solid rgba(59,130,246,0.2)' }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'rgba(59,130,246,0.1)';
              e.currentTarget.style.borderColor = 'rgba(59,130,246,0.4)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = 'rgba(59,130,246,0.2)';
            }}
          >
            <Plus size={12} className="text-blue-400" />
            500 ml
          </button>
          <button
            className="btn-secondary text-xs flex items-center justify-center gap-1 py-2 rounded-xl transition-all"
            onClick={() => onAdd(750)}
            style={{ border: '1px solid rgba(59,130,246,0.2)' }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'rgba(59,130,246,0.1)';
              e.currentTarget.style.borderColor = 'rgba(59,130,246,0.4)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = 'rgba(59,130,246,0.2)';
            }}
          >
            <Plus size={12} className="text-blue-400" />
            750 ml
          </button>
        </div>

        {consumed > 0 && (
          <button
            className="btn-secondary text-xs flex items-center justify-center gap-1 py-1.5 rounded-xl transition-all"
            onClick={() => onRemove(250)}
            style={{ color: 'var(--color-text-muted)', border: '1px solid rgba(239,68,68,0.1)' }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#ef4444';
              e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.05)';
              e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'var(--color-text-muted)';
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = 'rgba(239,68,68,0.1)';
            }}
          >
            <Minus size={12} />
            250 ml Azalt
          </button>
        )}
      </div>
    </section>
  );
}
