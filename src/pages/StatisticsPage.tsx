// ============================================================
// Benim Kalorim – Statistics Page
// Haftalık/aylık istatistikler, grafikler, makro dağılım
// ============================================================

import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus, Award, Flame, Droplet, Droplets } from 'lucide-react';
import { useFoodEntries } from '../hooks/useFoodEntries';
import { useProfile }     from '../hooks/useProfile';
import { getWaterIntake } from '../utils/storage';

function WeeklyWaterBar({
  date, amount, goal, isToday,
}: { date: string; amount: number; goal: number; isToday: boolean }) {
  const pct  = Math.min((amount / (goal || 1)) * 100, 100);
  const day  = new Date(date + 'T00:00:00').toLocaleDateString('tr-TR', { weekday: 'short' });
  const color = pct >= 100 ? '#2563eb' : '#60a5fa';

  return (
    <div className="flex flex-col items-center gap-2" style={{ flex: 1 }}>
      <span className="text-[10px] font-bold text-[#60a5fa]">
        {amount > 0 ? `${amount}` : ''}
      </span>
      <div className="w-full flex flex-col justify-end rounded-lg overflow-hidden"
        style={{ height: 100, background: 'var(--color-border)' }}>
        <div
          className="w-full rounded-lg transition-all duration-700"
          style={{ height: `${pct}%`, background: color, minHeight: amount > 0 ? 4 : 0 }}
        />
      </div>
      <span
        className="text-[10px] font-semibold capitalize"
        style={{ color: isToday ? '#60a5fa' : 'var(--color-text-muted)' }}
      >
        {day}
      </span>
    </div>
  );
}

function WeeklyBar({
  date, calories, goal, isToday,
}: { date: string; calories: number; goal: number; isToday: boolean }) {
  const pct  = Math.min((calories / (goal || 1)) * 100, 100);
  const day  = new Date(date + 'T00:00:00').toLocaleDateString('tr-TR', { weekday: 'short' });
  const color = pct > 100 ? '#ef4444' : pct > 85 ? '#f59e0b' : '#00C853';

  return (
    <div className="flex flex-col items-center gap-2" style={{ flex: 1 }}>
      <span className="text-[10px] font-bold" style={{ color: '#00C853' }}>
        {calories > 0 ? calories : ''}
      </span>
      <div className="w-full flex flex-col justify-end rounded-lg overflow-hidden"
        style={{ height: 100, background: 'var(--color-border)' }}>
        <div
          className="w-full rounded-lg transition-all duration-700"
          style={{ height: `${pct}%`, background: color, minHeight: calories > 0 ? 4 : 0 }}
        />
      </div>
      <span
        className="text-[10px] font-semibold capitalize"
        style={{ color: isToday ? '#00C853' : 'var(--color-text-muted)' }}
      >
        {day}
      </span>
    </div>
  );
}

function PieChart({
  protein, carbs, fat,
}: { protein: number; carbs: number; fat: number }) {
  const total = protein + carbs + fat || 1;
  const pPct  = Math.round((protein / total) * 100);
  const cPct  = Math.round((carbs   / total) * 100);
  const fPct  = 100 - pPct - cPct;

  const size = 120;
  const r    = 48;
  const cx   = size / 2;
  const cy   = size / 2;

  function slice(startPct: number, pct: number, color: string) {
    if (pct <= 0) return null;
    const start = (startPct / 100) * 2 * Math.PI - Math.PI / 2;
    const end   = ((startPct + pct) / 100) * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + r * Math.cos(start);
    const y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end);
    const y2 = cy + r * Math.sin(end);
    const large = pct > 50 ? 1 : 0;
    return (
      <path
        key={color}
        d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`}
        fill={color}
        opacity={0.9}
      />
    );
  }

  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size}>
        {slice(0,      pPct, '#00C853')}
        {slice(pPct,   cPct, '#3b82f6')}
        {slice(pPct + cPct, fPct, '#f59e0b')}
        <circle cx={cx} cy={cy} r={28} fill="var(--color-surface)" />
      </svg>
      <div className="flex flex-col gap-2">
        {[
          { label: 'Protein',      pct: pPct, color: '#00C853', val: Math.round(protein) },
          { label: 'Karbonhidrat', pct: cPct, color: '#3b82f6', val: Math.round(carbs)   },
          { label: 'Yağ',          pct: fPct, color: '#f59e0b', val: Math.round(fat)      },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
            <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
              {item.label}
            </span>
            <span className="text-xs font-bold text-white ml-auto">
              {item.pct}% · {item.val}g
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function StatisticsPage() {
  const { entries, today, getDailyTotals, getWeeklyData } = useFoodEntries();
  const { profile } = useProfile();

  const goal = profile?.dailyGoal ?? { calories: 2000, protein: 150, carbs: 225, fat: 55 };

  const weeklyData = getWeeklyData();
  const todayTotals = getDailyTotals(today);

  // 7-günlük ortalama
  const weekAvg = useMemo(() => {
    const withData = weeklyData.filter(d => d.calories > 0);
    if (withData.length === 0) return 0;
    return Math.round(withData.reduce((sum, d) => sum + d.calories, 0) / withData.length);
  }, [weeklyData]);

  // Hedef tutturma oranı
  const goalHitDays = weeklyData.filter(d =>
    d.calories > 0 && Math.abs(d.calories - goal.calories) / goal.calories < 0.1
  ).length;

  const trend = weekAvg > goal.calories ? 'fazla' : weekAvg < goal.calories * 0.9 ? 'az' : 'dengeli';
  const TrendIcon = trend === 'fazla' ? TrendingUp : trend === 'az' ? TrendingDown : Minus;
  const trendColor = trend === 'fazla' ? '#ef4444' : trend === 'az' ? '#f59e0b' : '#00C853';

  // Son 30 günün en yüksek kalori günü
  const maxDay = useMemo(() => {
    const grouped: Record<string, number> = {};
    entries.forEach(e => {
      grouped[e.date] = (grouped[e.date] ?? 0) + e.calories;
    });
    let max = 0;
    Object.values(grouped).forEach(v => { if (v > max) max = v; });
    return max;
  }, [entries]);

  // Toplam kayıt sayısı
  const totalEntries = entries.length;

  // Son 7 günün su tüketimi
  const weeklyWaterData = useMemo(() => {
    return weeklyData.map(d => ({
      date: d.date,
      amount: getWaterIntake(d.date)
    }));
  }, [weeklyData]);

  const waterGoal = profile?.waterGoal ?? 2500;
  const todayWater = getWaterIntake(today);

  // Haftalık su ortalaması
  const waterWeekAvg = useMemo(() => {
    const total = weeklyWaterData.reduce((sum, d) => sum + d.amount, 0);
    return Math.round(total / 7);
  }, [weeklyWaterData]);

  // Su hedefi tutturulan gün sayısı
  const waterGoalHitDays = useMemo(() => {
    return weeklyWaterData.filter(d => d.amount >= waterGoal).length;
  }, [weeklyWaterData, waterGoal]);

  return (
    <main className="max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-6">
      <div className="animate-fade-in mb-6">
        <h1 className="text-2xl font-black text-white">📊 İstatistikler</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Beslenme alışkanlıklarını takip et
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {[
          {
            label:  'Haftalık Ortalama',
            value:  `${weekAvg}`,
            unit:   'kcal',
            icon:   <Flame size={18} />,
            color:  '#00C853',
          },
          {
            label:  'Hedef Günler (Kalori)',
            value:  `${goalHitDays}/7`,
            unit:   'gün',
            icon:   <Award size={18} />,
            color:  '#f59e0b',
          },
          {
            label:  'En Yüksek',
            value:  `${maxDay}`,
            unit:   'kcal',
            icon:   <TrendingUp size={18} />,
            color:  '#ef4444',
          },
          {
            label:  'Toplam Kayıt',
            value:  `${totalEntries}`,
            unit:   'öğün',
            icon:   <Award size={18} />,
            color:  '#3b82f6',
          },
          {
            label:  'Ortalama Su',
            value:  `${waterWeekAvg}`,
            unit:   'ml',
            icon:   <Droplets size={18} />,
            color:  '#3b82f6',
          },
          {
            label:  'Hedef Günler (Su)',
            value:  `${waterGoalHitDays}/7`,
            unit:   'gün',
            icon:   <Droplet size={18} />,
            color:  '#60a5fa',
          },
        ].map(stat => (
          <div key={stat.label} className="stat-card">
            <div className="flex items-center gap-2 mb-1">
              <span style={{ color: stat.color }}>{stat.icon}</span>
            </div>
            <p className="text-xl sm:text-2xl font-black text-white">
              {stat.value}
              <span className="text-xs font-normal ml-1" style={{ color: 'var(--color-text-muted)' }}>
                {stat.unit}
              </span>
            </p>
            <p className="text-[11px] sm:text-xs" style={{ color: 'var(--color-text-muted)' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Bar Chart */}
        <div className="card">
          <div className="mb-4">
            <h2 className="section-title text-base">Son 7 Gün</h2>
            <div className="flex items-center gap-2 mt-1">
              <TrendIcon size={14} style={{ color: trendColor }} />
              <span className="text-xs font-semibold" style={{ color: trendColor }}>
                Kalori dengesi {trend}
              </span>
            </div>
          </div>

          {/* Goal line reference */}
          <p className="text-[10px] mb-2" style={{ color: 'var(--color-text-muted)' }}>
            Hedef: {goal.calories} kcal
          </p>

          <div className="flex gap-2 items-end">
            {weeklyData.map(d => (
              <WeeklyBar
                key={d.date}
                date={d.date}
                calories={d.calories}
                goal={goal.calories}
                isToday={d.date === today}
              />
            ))}
          </div>
        </div>

        {/* Weekly Water Bar Chart */}
        <div className="card">
          <div className="mb-4">
            <h2 className="section-title text-base">Son 7 Gün (Su Takibi)</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-semibold text-blue-400">
                Haftalık ortalama: {waterWeekAvg} ml
              </span>
            </div>
          </div>

          {/* Goal line reference */}
          <p className="text-[10px] mb-2" style={{ color: 'var(--color-text-muted)' }}>
            Hedef: {waterGoal} ml
          </p>

          <div className="flex gap-2 items-end">
            {weeklyWaterData.map(d => (
              <WeeklyWaterBar
                key={d.date}
                date={d.date}
                amount={d.amount}
                goal={waterGoal}
                isToday={d.date === today}
              />
            ))}
          </div>
        </div>

        {/* Today's Macro Pie */}
        <div className="card">
          <h2 className="section-title text-base mb-4">Bugün Makro Dağılım</h2>
          {todayTotals.calories === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <span className="text-4xl">📊</span>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Bugün henüz öğün eklenmedi
              </p>
            </div>
          ) : (
            <PieChart
              protein={todayTotals.protein}
              carbs={todayTotals.carbs}
              fat={todayTotals.fat}
            />
          )}
        </div>

        {/* Meal Type Breakdown */}
        <div className="card">
          <h2 className="section-title text-base mb-4">Öğün Dağılımı (Bugün)</h2>
          {(['kahvaltı', 'öğle', 'akşam', 'ara-öğün'] as const).map(meal => {
            const mealEntries = entries.filter(e => e.date === today && e.mealType === meal);
            const mealCals    = mealEntries.reduce((s, e) => s + e.calories, 0);
            const pct         = Math.round((mealCals / (todayTotals.calories || 1)) * 100);
            const labels: Record<string, string> = {
              'kahvaltı': '🌅 Kahvaltı',
              'öğle':     '☀️ Öğle',
              'akşam':    '🌙 Akşam',
              'ara-öğün': '🍎 Ara Öğün',
            };
            return (
              <div key={meal} className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-white">{labels[meal]}</span>
                  <span style={{ color: 'var(--color-text-muted)' }}>
                    {mealCals} kcal · {pct}%
                  </span>
                </div>
                <div className="progress-bar-track">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${pct}%`, background: '#00C853' }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Calorie Goal Progress */}
        <div className="card">
          <h2 className="section-title text-base mb-4">Kalori Hedef Durumu</h2>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-3xl font-black text-white">
                  {todayTotals.calories}
                  <span className="text-base font-normal ml-1" style={{ color: 'var(--color-text-muted)' }}>
                    / {goal.calories} kcal
                  </span>
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  Kalan: <b className="text-white">{Math.max(goal.calories - todayTotals.calories, 0)} kcal</b>
                </p>
              </div>
              <div
                className="text-3xl font-black"
                style={{ color: todayTotals.calories > goal.calories ? '#ef4444' : '#00C853' }}
              >
                {Math.round((todayTotals.calories / (goal.calories || 1)) * 100)}%
              </div>
            </div>

            <div className="progress-bar-track" style={{ height: 12 }}>
              <div
                className="progress-bar-fill"
                style={{
                  width: `${Math.min((todayTotals.calories / (goal.calories || 1)) * 100, 100)}%`,
                  background: todayTotals.calories > goal.calories ? '#ef4444' : '#00C853',
                  height: 12,
                }}
              />
            </div>

            <div className="grid grid-cols-3 gap-3 mt-2">
              {[
                { label: 'Protein',       val: todayTotals.protein,  goal: goal.protein,  unit: 'g', color: '#00C853' },
                { label: 'Karbonhidrat',  val: todayTotals.carbs,    goal: goal.carbs,    unit: 'g', color: '#3b82f6' },
                { label: 'Yağ',           val: todayTotals.fat,       goal: goal.fat,      unit: 'g', color: '#f59e0b' },
              ].map(m => (
                <div key={m.label} className="card-sm text-center">
                  <p className="text-base font-black" style={{ color: m.color }}>
                    {Math.round(m.val)}{m.unit}
                  </p>
                  <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                    / {m.goal}{m.unit}
                  </p>
                  <p className="text-[10px] font-semibold" style={{ color: 'var(--color-text-muted)' }}>
                    {m.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Water Goal Progress */}
        <div className="card">
          <h2 className="section-title text-base mb-4">Su Hedef Durumu</h2>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-3xl font-black text-white">
                  {todayWater}
                  <span className="text-base font-normal ml-1" style={{ color: 'var(--color-text-muted)' }}>
                    / {waterGoal} ml
                  </span>
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  Kalan: <b className="text-white">{Math.max(waterGoal - todayWater, 0)} ml</b>
                </p>
              </div>
              <div
                className="text-3xl font-black"
                style={{ color: todayWater >= waterGoal ? '#00C853' : '#3b82f6' }}
              >
                {Math.round((todayWater / (waterGoal || 1)) * 100)}%
              </div>
            </div>

            <div className="progress-bar-track" style={{ height: 12 }}>
              <div
                className="progress-bar-fill"
                style={{
                  width: `${Math.min((todayWater / (waterGoal || 1)) * 100, 100)}%`,
                  background: todayWater >= waterGoal ? '#00C853' : '#3b82f6',
                  height: 12,
                }}
              />
            </div>

            <div className="flex items-center justify-center p-3 rounded-xl mt-2 text-xs font-semibold"
              style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
              {todayWater >= waterGoal ? (
                <span className="text-green-400 flex items-center gap-1.5">
                  🎉 Bugünlük su hedefinizi başarıyla tamamladınız!
                </span>
              ) : todayWater > 0 ? (
                <span className="text-blue-400 flex items-center gap-1.5">
                  💧 Harika gidiyorsunuz, hedefinize ulaşmak için içmeye devam edin!
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  😴 Bugün henüz su tüketimi kaydetmemişsiniz.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
