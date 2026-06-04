// ============================================================
// Benim Kalorim – Profile Page
// Kullanıcı profili ve günlük hedef ayarları
// ============================================================

import { useState, useEffect } from 'react';
import { Save, User, Target, Zap, Scale } from 'lucide-react';
import { useProfile, calcDailyCalories } from '../hooks/useProfile';
import { useToast }   from '../hooks/useToast';
import { ToastContainer } from '../components/ToastContainer';
import type { UserProfile } from '../interfaces';

const ACTIVITY_OPTIONS: { value: UserProfile['activityLevel']; label: string; desc: string }[] = [
  { value: 'hareketsiz',   label: 'Hareketsiz',    desc: 'Ofis işi, egzersiz yok' },
  { value: 'az-aktif',     label: 'Az Aktif',       desc: 'Haftada 1-3 gün egzersiz' },
  { value: 'orta-aktif',   label: 'Orta Aktif',     desc: 'Haftada 3-5 gün egzersiz' },
  { value: 'çok-aktif',    label: 'Çok Aktif',      desc: 'Haftada 6-7 gün egzersiz' },
  { value: 'ekstra-aktif', label: 'Ekstra Aktif',   desc: 'Ağır iş & günlük egzersiz' },
];

const GOAL_OPTIONS: { value: UserProfile['goal']; label: string; emoji: string }[] = [
  { value: 'kilo-ver',  label: 'Kilo Ver',  emoji: '📉' },
  { value: 'kilo-koru', label: 'Koru',      emoji: '⚖️' },
  { value: 'kilo-al',   label: 'Kilo Al',   emoji: '📈' },
];

export function ProfilePage() {
  const { profile, updateProfile, updateDailyGoal } = useProfile();
  const toast = useToast();

  const [form, setForm] = useState({
    name:          '',
    age:           25,
    weight:        70,
    height:        170,
    gender:        'erkek' as 'erkek' | 'kadın',
    activityLevel: 'orta-aktif' as UserProfile['activityLevel'],
    goal:          'kilo-koru' as UserProfile['goal'],
  });

  const [goalForm, setGoalForm] = useState({
    calories: 2000,
    protein:  150,
    carbs:    225,
    fat:      55,
  });

  const [waterGoal, setWaterGoal] = useState(2500);

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        name:          profile.name,
        age:           profile.age,
        weight:        profile.weight,
        height:        profile.height,
        gender:        profile.gender,
        activityLevel: profile.activityLevel,
        goal:          profile.goal,
      });
      setGoalForm(profile.dailyGoal);
      setWaterGoal(profile.waterGoal ?? 2500);
    }
  }, [profile]);

  // Kalori önizleme (gerçek zamanlı)
  const previewCalories = calcDailyCalories({
    ...form,
    dailyGoal: goalForm,
    updatedAt: '',
  } as UserProfile);

  const set = <K extends keyof typeof form>(key: K, val: typeof form[K]) =>
    setForm(f => ({ ...f, [key]: val }));

  const setGoal = <K extends keyof typeof goalForm>(key: K, val: number) =>
    setGoalForm(f => ({ ...f, [key]: val }));

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(form);
    toast.success('Profil kaydedildi ✅');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleGoalSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateDailyGoal(goalForm, waterGoal);
    toast.success('Hedefler güncellendi 🎯');
  };

  const handleAutoCalc = () => {
    setGoalForm(g => ({
      ...g,
      calories: previewCalories,
      protein:  Math.round((previewCalories * 0.30) / 4),
      carbs:    Math.round((previewCalories * 0.45) / 4),
      fat:      Math.round((previewCalories * 0.25) / 9),
    }));
    setWaterGoal(Math.round((form.weight * 35) / 250) * 250);
    toast.success('Hedefler otomatik hesaplandı 🔢');
  };

  const bmi = form.weight / ((form.height / 100) ** 2);
  const bmiLabel =
    bmi < 18.5 ? { label: 'Zayıf',     color: '#3b82f6' } :
    bmi < 25   ? { label: 'Normal',     color: '#00C853' } :
    bmi < 30   ? { label: 'Fazla Kilo', color: '#f59e0b' } :
                 { label: 'Obez',       color: '#ef4444' };

  return (
    <main className="max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-6">
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />

      <div className="animate-fade-in mb-6">
        <h1 className="text-2xl font-black text-white">👤 Profilim</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Kişisel bilgilerini ve kalori hedefini ayarla
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Profile Form */}
        <form onSubmit={handleProfileSave} className="card flex flex-col gap-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(0,200,83,0.15)', border: '1px solid rgba(0,200,83,0.3)' }}>
              <User size={20} style={{ color: 'var(--color-brand)' }} />
            </div>
            <div>
              <h2 className="section-title text-base">Kişisel Bilgiler</h2>
              <p className="section-subtitle text-xs">BMI ve kalori hesabı için kullanılır</p>
            </div>
          </div>

          {/* Name */}
          <div className="input-group">
            <label htmlFor="profile-name" className="input-label">İsim</label>
            <input
              id="profile-name"
              type="text"
              className="input-field"
              placeholder="Adın ne?"
              value={form.name}
              onChange={e => set('name', e.target.value)}
            />
          </div>

          {/* Gender */}
          <div className="input-group">
            <label className="input-label">Cinsiyet</label>
            <div className="grid grid-cols-2 gap-2">
              {(['erkek', 'kadın'] as const).map(g => (
                <button
                  type="button"
                  key={g}
                  id={`gender-${g}`}
                  className="py-2.5 rounded-xl text-sm font-semibold transition-all"
                  onClick={() => set('gender', g)}
                  style={{
                    background: form.gender === g ? 'rgba(0,200,83,0.15)' : 'var(--color-surface-2)',
                    border: form.gender === g ? '1px solid rgba(0,200,83,0.5)' : '1px solid var(--color-border)',
                    color: form.gender === g ? 'var(--color-brand)' : 'var(--color-text-muted)',
                  }}
                >
                  {g === 'erkek' ? '👨 Erkek' : '👩 Kadın'}
                </button>
              ))}
            </div>
          </div>

          {/* Age / Weight / Height */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'profile-age',    label: 'Yaş',    key: 'age'    as const, unit: 'yıl', min: 10, max: 100 },
              { id: 'profile-weight', label: 'Kilo',   key: 'weight' as const, unit: 'kg',  min: 30, max: 250 },
              { id: 'profile-height', label: 'Boy',    key: 'height' as const, unit: 'cm',  min: 100, max: 250 },
            ].map(f => (
              <div key={f.key} className="input-group">
                <label htmlFor={f.id} className="input-label">{f.label} ({f.unit})</label>
                <input
                  id={f.id}
                  type="number"
                  min={f.min}
                  max={f.max}
                  className="input-field"
                  value={form[f.key]}
                  onChange={e => set(f.key, Number(e.target.value))}
                />
              </div>
            ))}
          </div>

          {/* BMI Display */}
          <div className="card-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scale size={16} style={{ color: 'var(--color-text-muted)' }} />
              <span className="text-sm font-semibold text-white">Vücut Kitle İndeksi</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black text-white">{bmi.toFixed(1)}</span>
              <span
                className="badge text-[10px]"
                style={{
                  color: bmiLabel.color,
                  background: `${bmiLabel.color}22`,
                  border: `1px solid ${bmiLabel.color}44`,
                }}
              >
                {bmiLabel.label}
              </span>
            </div>
          </div>

          {/* Activity Level */}
          <div className="input-group">
            <label htmlFor="activity-level" className="input-label">Aktivite Seviyesi</label>
            <select
              id="activity-level"
              className="input-field"
              value={form.activityLevel}
              onChange={e => set('activityLevel', e.target.value as UserProfile['activityLevel'])}
            >
              {ACTIVITY_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>
                  {o.label} – {o.desc}
                </option>
              ))}
            </select>
          </div>

          {/* Goal */}
          <div className="input-group">
            <label className="input-label">Kilo Hedefi</label>
            <div className="grid grid-cols-3 gap-2">
              {GOAL_OPTIONS.map(g => (
                <button
                  type="button"
                  key={g.value}
                  id={`goal-${g.value}`}
                  className="py-2.5 rounded-xl text-sm font-semibold transition-all"
                  onClick={() => set('goal', g.value)}
                  style={{
                    background: form.goal === g.value ? 'rgba(0,200,83,0.15)' : 'var(--color-surface-2)',
                    border: form.goal === g.value ? '1px solid rgba(0,200,83,0.5)' : '1px solid var(--color-border)',
                    color: form.goal === g.value ? 'var(--color-brand)' : 'var(--color-text-muted)',
                  }}
                >
                  {g.emoji} {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Estimated Calories */}
          <div className="card-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap size={16} style={{ color: '#f59e0b' }} />
              <span className="text-sm font-semibold text-white">Tahmini Günlük İhtiyaç</span>
            </div>
            <span className="text-lg font-black" style={{ color: '#f59e0b' }}>
              {previewCalories} kcal
            </span>
          </div>

          <button type="submit" id="save-profile-btn" className="btn-primary w-full justify-center">
            <Save size={16} /> {saved ? 'Kaydedildi ✓' : 'Profili Kaydet'}
          </button>
        </form>

        {/* Daily Goal Form */}
        <form onSubmit={handleGoalSave} className="card flex flex-col gap-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(0,200,83,0.15)', border: '1px solid rgba(0,200,83,0.3)' }}>
              <Target size={20} style={{ color: 'var(--color-brand)' }} />
            </div>
            <div>
              <h2 className="section-title text-base">Günlük Hedefler</h2>
              <p className="section-subtitle text-xs">Manuel veya otomatik ayarla</p>
            </div>
          </div>

          <button
            type="button"
            id="auto-calc-btn"
            className="btn-secondary w-full justify-center text-sm"
            onClick={handleAutoCalc}
          >
            <Zap size={15} /> Profil Verilerimden Hesapla ({previewCalories} kcal)
          </button>

          <hr className="divider" />

          {[
            { id: 'goal-calories', label: 'Kalori Hedefi',      key: 'calories' as const, unit: 'kcal', color: '#00C853' },
            { id: 'goal-protein',  label: 'Protein Hedefi',     key: 'protein'  as const, unit: 'g',    color: '#00C853' },
            { id: 'goal-carbs',    label: 'Karbonhidrat Hedefi',key: 'carbs'    as const, unit: 'g',    color: '#3b82f6' },
            { id: 'goal-fat',      label: 'Yağ Hedefi',         key: 'fat'      as const, unit: 'g',    color: '#f59e0b' },
          ].map(f => (
            <div key={f.key} className="input-group">
              <label htmlFor={f.id} className="input-label" style={{ color: f.color }}>
                {f.label} ({f.unit})
              </label>
              <input
                id={f.id}
                type="number"
                min="0"
                className="input-field"
                value={goalForm[f.key]}
                onChange={e => setGoal(f.key, Number(e.target.value))}
              />
            </div>
          ))}

          <div className="input-group">
            <label htmlFor="goal-water" className="input-label" style={{ color: '#3b82f6' }}>
              Su Hedefi (ml)
            </label>
            <input
              id="goal-water"
              type="number"
              min="0"
              step="250"
              className="input-field"
              value={waterGoal}
              onChange={e => setWaterGoal(Number(e.target.value))}
            />
          </div>

          {/* Macro Distribution Preview */}
          <div className="card-sm">
            <p className="text-xs font-semibold mb-3" style={{ color: 'var(--color-text-muted)' }}>
              Makro Dağılım Önizlemesi
            </p>
            <div className="flex gap-1 rounded-lg overflow-hidden" style={{ height: 8 }}>
              {[
                { val: goalForm.protein * 4, color: '#00C853' },
                { val: goalForm.carbs   * 4, color: '#3b82f6' },
                { val: goalForm.fat     * 9, color: '#f59e0b' },
              ].map((m, i) => {
                const total = goalForm.protein * 4 + goalForm.carbs * 4 + goalForm.fat * 9 || 1;
                return (
                  <div
                    key={i}
                    style={{ width: `${(m.val / total) * 100}%`, background: m.color }}
                  />
                );
              })}
            </div>
            <div className="flex justify-between mt-2">
              {[
                { label: 'P', val: Math.round((goalForm.protein * 4 / (goalForm.calories || 1)) * 100), color: '#00C853' },
                { label: 'K', val: Math.round((goalForm.carbs   * 4 / (goalForm.calories || 1)) * 100), color: '#3b82f6' },
                { label: 'Y', val: Math.round((goalForm.fat     * 9 / (goalForm.calories || 1)) * 100), color: '#f59e0b' },
              ].map(m => (
                <span key={m.label} className="text-[10px] font-bold" style={{ color: m.color }}>
                  {m.label}: {m.val}%
                </span>
              ))}
            </div>
          </div>

          <button type="submit" id="save-goals-btn" className="btn-primary w-full justify-center">
            <Save size={16} /> Hedefleri Kaydet
          </button>
        </form>
      </div>

      {/* Akıllı Ağırlık Öngörüsü & Sağlık Asistanı */}
      <div className="card lg:col-span-2 mt-6 animate-slide-up">
        <div className="flex items-center gap-3 border-b pb-3 mb-4" style={{ borderColor: 'var(--color-border)' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-500/15 border border-blue-500/30 flex-shrink-0">
            <Zap size={20} className="text-blue-400" />
          </div>
          <div>
            <h2 className="section-title text-base">🧠 Akıllı Ağırlık Öngörüsü & Sağlık Danışmanı</h2>
            <p className="section-subtitle text-xs">Hedeflerinize ve metabolizma hızınıza göre bilimsel vücut ağırlığı tahminleri</p>
          </div>
        </div>

        {(() => {
          const currentBmr = Math.round(10 * form.weight + 6.25 * form.height - 5 * form.age + (form.gender === 'erkek' ? 5 : -161));
          const activityMultiplier = {
            'hareketsiz':    1.2,
            'az-aktif':      1.375,
            'orta-aktif':    1.55,
            'çok-aktif':     1.725,
            'ekstra-aktif':  1.9,
          }[form.activityLevel] || 1.2;
          const currentTdee = Math.round(currentBmr * activityMultiplier);
          const dailyCalorieDiff = goalForm.calories - currentTdee;

          return (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Metabolizma Detayları */}
                <div className="flex flex-col gap-2.5 p-4 rounded-xl" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
                  <p className="text-[10px] font-bold tracking-wider" style={{ color: 'var(--color-text-muted)' }}>METABOLİZMA ÖZETİ</p>
                  <div className="flex justify-between items-center text-xs mt-1">
                    <span style={{ color: 'var(--color-text-muted)' }}>Bazal Metabolizma (BMR):</span>
                    <span className="font-bold text-white">{currentBmr} kcal</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span style={{ color: 'var(--color-text-muted)' }}>Günlük Yakılan Enerji (TDEE):</span>
                    <span className="font-bold text-white">{currentTdee} kcal</span>
                  </div>
                  <div className="flex justify-between items-center text-xs border-t pt-2 mt-2" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                    <span className="font-medium text-white">Hedeflenen Kalori Alımı:</span>
                    <span className="font-bold text-brand">{goalForm.calories} kcal</span>
                  </div>
                </div>

                {/* Öngörü Sonuçları */}
                <div className="md:col-span-2 flex flex-col gap-2 justify-center">
                  {dailyCalorieDiff < -100 ? (
                    <div>
                      <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-1.5">
                        <span>📉</span> Tahmini Kilo Verme Hızı
                      </h3>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                        Mevcut hedeflerinizle günlük ortalama <span className="text-green-400 font-bold">{Math.abs(dailyCalorieDiff)} kcal</span> enerji açığı oluşturuyorsunuz. Bu düzeni sürdürürseniz:
                      </p>
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        <div className="p-3 rounded-xl text-center" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
                          <p className="text-[10px] font-medium" style={{ color: 'var(--color-text-muted)' }}>Haftalık Tahmini Kayıp</p>
                          <p className="text-base font-black text-green-400 mt-0.5">
                            {((Math.abs(dailyCalorieDiff) * 7) / 9000).toFixed(2)} - {((Math.abs(dailyCalorieDiff) * 7) / 7000).toFixed(2)} kg
                          </p>
                        </div>
                        <div className="p-3 rounded-xl text-center" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
                          <p className="text-[10px] font-medium" style={{ color: 'var(--color-text-muted)' }}>Aylık Tahmini Kayıp</p>
                          <p className="text-base font-black text-green-400 mt-0.5">
                            {((Math.abs(dailyCalorieDiff) * 30) / 9000).toFixed(1)} - {((Math.abs(dailyCalorieDiff) * 30) / 7000).toFixed(1)} kg
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : dailyCalorieDiff > 100 ? (
                    <div>
                      <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-1.5">
                        <span>📈</span> Tahmini Kilo Alma Hızı
                      </h3>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                        Mevcut hedeflerinizle günlük ortalama <span className="text-blue-400 font-bold">{dailyCalorieDiff} kcal</span> enerji fazlası oluşturuyorsunuz. Bu düzeni sürdürürseniz:
                      </p>
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        <div className="p-3 rounded-xl text-center" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
                          <p className="text-[10px] font-medium" style={{ color: 'var(--color-text-muted)' }}>Haftalık Tahmini Artış</p>
                          <p className="text-base font-black text-blue-400 mt-0.5">
                            {((dailyCalorieDiff * 7) / 9000).toFixed(2)} - {((dailyCalorieDiff * 7) / 7000).toFixed(2)} kg
                          </p>
                        </div>
                        <div className="p-3 rounded-xl text-center" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
                          <p className="text-[10px] font-medium" style={{ color: 'var(--color-text-muted)' }}>Aylık Tahmini Artış</p>
                          <p className="text-base font-black text-blue-400 mt-0.5">
                            {((dailyCalorieDiff * 30) / 9000).toFixed(1)} - {((dailyCalorieDiff * 30) / 7000).toFixed(1)} kg
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-1.5">
                        <span>⚖️</span> Kilo Koruma Dengesi
                      </h3>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                        Hedeflediğiniz kalori alımı, günlük toplam yaktığınız enerjiyle (<span className="text-white font-semibold">{currentTdee} kcal</span>) dengede görünüyor.
                      </p>
                      <div className="p-4 rounded-xl mt-3 text-center text-xs font-semibold" style={{ background: 'rgba(0, 200, 83, 0.06)', border: '1px solid rgba(0, 200, 83, 0.2)', color: 'var(--color-brand)' }}>
                        Vücut kilonuzu korumak ve mevcut formunuzu sürdürmek için ideal dengedesiniz! 
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sağlık Tavsiyeleri ve Uyarılar */}
              <div className="mt-2 pt-3 border-t text-xs flex flex-col gap-2.5" style={{ borderColor: 'rgba(255,255,255,0.05)', color: 'var(--color-text-muted)' }}>
                {Math.abs(dailyCalorieDiff) > 1000 && (
                  <div className="p-3 rounded-lg border bg-red-500/10 border-red-500/20 text-red-300">
                    ⚠️ <b>Kritik Uyarı:</b> Günlük kalori farkınız çok yüksek ({Math.round(Math.abs(dailyCalorieDiff))} kcal). Sağlıklı ve sürdürülebilir kilo değişimi haftalık 0.5 - 1.0 kg aralığında olmalıdır. Aşırı kalori açığı kas kaybına; aşırı kalori fazlası ise kontrolsüz yağlanmaya sebep olabilir.
                  </div>
                )}
                <p className="flex items-start gap-1.5 leading-relaxed">
                  <span className="text-brand">💡</span>
                  <span>
                    <b>Öneri:</b> Ağırlık değişimleri su tutulumu, sindirim sistemi doluluğu ve sodyum alımına bağlı olarak günden güne dalgalanabilir. Bu yüzden her gün tartılmak yerine <b>haftalık ortalama</b> trendinizi izlemeniz ve her zaman <b>sabah aç karnına, tuvalet sonrası</b> tartılmanız en doğru sonucu verir.
                  </span>
                </p>
              </div>
            </div>
          );
        })()}
      </div>
    </main>
  );
}
