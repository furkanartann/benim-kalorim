// ============================================================
// Benim Kalorim – OnboardingPage.tsx
// İlk giriş ekranı: Kullanıcı bilgilerini toplar ve
// LocalStorage'a kaydeder. Bilgiler doluysa gösterilmez.
// ============================================================

import { useState } from 'react';
import { ChevronRight, ChevronLeft, Check, User, Scale, Zap, Target } from 'lucide-react';
import { saveProfile } from '../utils/storage';
import { calcDailyCalories } from '../hooks/useProfile';
import type { UserProfile } from '../interfaces';

interface OnboardingPageProps {
  onComplete: () => void;
}

type Step = 'kimsin' | 'vücut' | 'aktivite' | 'hedef';

const STEPS: Step[] = ['kimsin', 'vücut', 'aktivite', 'hedef'];

const STEP_CONFIG = {
  kimsin:   { icon: User,   title: 'Merhaba! 👋',          subtitle: 'Seni biraz tanıyalım' },
  vücut:    { icon: Scale,  title: 'Vücut Bilgilerin 📏',   subtitle: 'Doğru kalori hesabı için gerekli' },
  aktivite: { icon: Zap,    title: 'Ne Kadar Aktifsin? ⚡', subtitle: 'Günlük enerji ihtiyacını hesaplayalım' },
  hedef:    { icon: Target, title: 'Hedefin Ne? 🎯',        subtitle: 'Kişiselleştirilmiş plan oluşturalım' },
};

const ACTIVITY_OPTIONS: { value: UserProfile['activityLevel']; label: string; desc: string; emoji: string }[] = [
  { value: 'hareketsiz',   label: 'Hareketsiz',   desc: 'Ofis işi, egzersiz yok',          emoji: '🪑' },
  { value: 'az-aktif',     label: 'Az Aktif',      desc: 'Haftada 1-3 gün hafif egzersiz',  emoji: '🚶' },
  { value: 'orta-aktif',   label: 'Orta Aktif',    desc: 'Haftada 3-5 gün egzersiz',        emoji: '🏃' },
  { value: 'çok-aktif',    label: 'Çok Aktif',     desc: 'Haftada 6-7 gün egzersiz',        emoji: '🏋️' },
  { value: 'ekstra-aktif', label: 'Ekstra Aktif',  desc: 'Ağır iş ve günlük yoğun egzersiz',emoji: '⚡' },
];

const GOAL_OPTIONS: { value: UserProfile['goal']; label: string; desc: string; emoji: string }[] = [
  { value: 'kilo-ver',  label: 'Kilo Ver',      desc: 'Yağ yakmak ve forma girmek istiyorum', emoji: '📉' },
  { value: 'kilo-koru', label: 'Kilonu Koru',   desc: 'Sağlıklı kilomda kalmak istiyorum',     emoji: '⚖️' },
  { value: 'kilo-al',   label: 'Kilo Al',       desc: 'Kas kazanmak ve kilo almak istiyorum',  emoji: '📈' },
];

export function OnboardingPage({ onComplete }: OnboardingPageProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [errors, setErrors]       = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    name:          '',
    surname:       '',
    age:           '' as number | '',
    weight:        '' as number | '',
    height:        '' as number | '',
    gender:        '' as 'erkek' | 'kadın' | '',
    activityLevel: '' as UserProfile['activityLevel'] | '',
    goal:          '' as UserProfile['goal'] | '',
  });

  const currentStep = STEPS[stepIndex];
  const StepIcon    = STEP_CONFIG[currentStep].icon;
  const progress    = ((stepIndex + 1) / STEPS.length) * 100;

  const set = <K extends keyof typeof form>(key: K, val: typeof form[K]) => {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => { const copy = { ...e }; delete copy[key]; return copy; });
  };

  // ---- Validation per step ----
  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (currentStep === 'kimsin') {
      if (!form.name.trim())    errs.name    = 'Adın gerekli';
      if (!form.surname.trim()) errs.surname = 'Soyadın gerekli';
      if (!form.gender)         errs.gender  = 'Cinsiyetini seç';
    }

    if (currentStep === 'vücut') {
      if (!form.age    || Number(form.age)    < 10 || Number(form.age)    > 100) errs.age    = 'Geçerli yaş gir (10-100)';
      if (!form.weight || Number(form.weight) < 30 || Number(form.weight) > 300) errs.weight = 'Geçerli kilo gir (30-300 kg)';
      if (!form.height || Number(form.height) < 100|| Number(form.height) > 250) errs.height = 'Geçerli boy gir (100-250 cm)';
    }

    if (currentStep === 'aktivite') {
      if (!form.activityLevel) errs.activityLevel = 'Aktivite seviyeni seç';
    }

    if (currentStep === 'hedef') {
      if (!form.goal) errs.goal = 'Hedefini seç';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;
    if (stepIndex < STEPS.length - 1) {
      setStepIndex(i => i + 1);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (stepIndex > 0) setStepIndex(i => i - 1);
  };

  const handleFinish = () => {
    const profileBase = {
      name:          `${form.name.trim()} ${form.surname.trim()}`,
      age:           Number(form.age),
      weight:        Number(form.weight),
      height:        Number(form.height),
      gender:        form.gender as 'erkek' | 'kadın',
      activityLevel: form.activityLevel as UserProfile['activityLevel'],
      goal:          form.goal as UserProfile['goal'],
      updatedAt:     new Date().toISOString(),
    };

    const calories = calcDailyCalories(profileBase as UserProfile);

    const profile: UserProfile = {
      ...profileBase,
      dailyGoal: {
        calories,
        protein: Math.round((calories * 0.30) / 4),
        carbs:   Math.round((calories * 0.45) / 4),
        fat:     Math.round((calories * 0.25) / 9),
      },
      waterGoal: Math.round((profileBase.weight * 35) / 250) * 250,
    };

    saveProfile(profile);
    onComplete();
  };

  const isLastStep = stepIndex === STEPS.length - 1;

  return (
    <div
      className="min-h-dvh flex items-center justify-center p-4"
      style={{ background: 'var(--color-bg)' }}
    >
      {/* Decorative background blobs */}
      <div
        className="fixed top-[-120px] right-[-120px] w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,200,83,0.12) 0%, transparent 70%)' }}
      />
      <div
        className="fixed bottom-[-100px] left-[-100px] w-64 h-64 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,200,83,0.08) 0%, transparent 70%)' }}
      />

      <div className="w-full max-w-md animate-scale-in">
        {/* Logo + Brand header */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <img
            src="/logo.png"
            alt="Benim Kalorim"
            className="w-16 h-16 rounded-full object-cover"
            style={{ boxShadow: '0 0 30px rgba(0,200,83,0.35)' }}
          />
          <div className="text-center">
            <h1 className="text-2xl font-black" style={{ color: 'var(--color-brand)' }}>
              Benim Kalorim
            </h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              Akıllı Kalori Takip Uygulaması
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>
              Adım {stepIndex + 1} / {STEPS.length}
            </span>
            <span className="text-xs font-bold" style={{ color: 'var(--color-brand)' }}>
              {Math.round(progress)}%
            </span>
          </div>
          <div className="progress-bar-track" style={{ height: 6 }}>
            <div
              className="progress-bar-fill"
              style={{ width: `${progress}%`, transition: 'width 0.4s ease' }}
            />
          </div>
          {/* Step dots */}
          <div className="flex justify-center gap-2 mt-3">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className="rounded-full transition-all duration-300"
                style={{
                  width:      i === stepIndex ? 20 : 8,
                  height:     8,
                  background: i <= stepIndex ? 'var(--color-brand)' : 'var(--color-border)',
                }}
              />
            ))}
          </div>
        </div>

        {/* Card */}
        <div className="card">
          {/* Step header */}
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(0,200,83,0.15)', border: '1px solid rgba(0,200,83,0.3)' }}
            >
              <StepIcon size={22} style={{ color: 'var(--color-brand)' }} />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">
                {STEP_CONFIG[currentStep].title}
              </h2>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {STEP_CONFIG[currentStep].subtitle}
              </p>
            </div>
          </div>

          {/* ---- Step: Kimsin ---- */}
          {currentStep === 'kimsin' && (
            <div className="flex flex-col gap-4 animate-fade-in">
              <div className="grid grid-cols-2 gap-3">
                <div className="input-group">
                  <label htmlFor="ob-name" className="input-label">Ad *</label>
                  <input
                    id="ob-name"
                    type="text"
                    className="input-field"
                    placeholder="Adın"
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                    autoFocus
                  />
                  {errors.name && <p className="text-xs text-red-400">{errors.name}</p>}
                </div>
                <div className="input-group">
                  <label htmlFor="ob-surname" className="input-label">Soyad *</label>
                  <input
                    id="ob-surname"
                    type="text"
                    className="input-field"
                    placeholder="Soyadın"
                    value={form.surname}
                    onChange={e => set('surname', e.target.value)}
                  />
                  {errors.surname && <p className="text-xs text-red-400">{errors.surname}</p>}
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Cinsiyet *</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['erkek', 'kadın'] as const).map(g => (
                    <button
                      key={g}
                      type="button"
                      id={`ob-gender-${g}`}
                      onClick={() => set('gender', g)}
                      className="py-3 rounded-xl text-sm font-semibold transition-all duration-200"
                      style={{
                        background: form.gender === g ? 'rgba(0,200,83,0.15)' : 'var(--color-surface-2)',
                        border:     form.gender === g ? '1.5px solid rgba(0,200,83,0.6)' : '1px solid var(--color-border)',
                        color:      form.gender === g ? 'var(--color-brand)' : 'var(--color-text-muted)',
                      }}
                    >
                      {g === 'erkek' ? '👨 Erkek' : '👩 Kadın'}
                    </button>
                  ))}
                </div>
                {errors.gender && <p className="text-xs text-red-400">{errors.gender}</p>}
              </div>
            </div>
          )}

          {/* ---- Step: Vücut ---- */}
          {currentStep === 'vücut' && (
            <div className="flex flex-col gap-4 animate-fade-in">
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Bu bilgiler BMR hesabında kullanılır ve hiçbir yere gönderilmez.
              </p>
              {[
                { id: 'ob-age',    label: 'Yaş',         key: 'age'    as const, placeholder: 'Örn: 22',  unit: 'yıl', min: 10,  max: 100 },
                { id: 'ob-weight', label: 'Kilo',        key: 'weight' as const, placeholder: 'Örn: 70',  unit: 'kg',  min: 30,  max: 300 },
                { id: 'ob-height', label: 'Boy',         key: 'height' as const, placeholder: 'Örn: 175', unit: 'cm',  min: 100, max: 250 },
              ].map(f => (
                <div key={f.key} className="input-group">
                  <label htmlFor={f.id} className="input-label">{f.label} ({f.unit}) *</label>
                  <input
                    id={f.id}
                    type="number"
                    min={f.min}
                    max={f.max}
                    className="input-field"
                    placeholder={f.placeholder}
                    value={form[f.key]}
                    onChange={e => set(f.key, e.target.value === '' ? '' : Number(e.target.value))}
                  />
                  {errors[f.key] && <p className="text-xs text-red-400">{errors[f.key]}</p>}
                </div>
              ))}
            </div>
          )}

          {/* ---- Step: Aktivite ---- */}
          {currentStep === 'aktivite' && (
            <div className="flex flex-col gap-2 animate-fade-in">
              {ACTIVITY_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  id={`ob-activity-${opt.value}`}
                  onClick={() => set('activityLevel', opt.value)}
                  className="flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200"
                  style={{
                    background: form.activityLevel === opt.value ? 'rgba(0,200,83,0.12)' : 'var(--color-surface-2)',
                    border:     form.activityLevel === opt.value ? '1.5px solid rgba(0,200,83,0.5)' : '1px solid var(--color-border)',
                  }}
                >
                  <span className="text-2xl flex-shrink-0">{opt.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold" style={{ color: form.activityLevel === opt.value ? 'var(--color-brand)' : 'var(--color-text)' }}>
                      {opt.label}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{opt.desc}</p>
                  </div>
                  {form.activityLevel === opt.value && (
                    <Check size={16} style={{ color: 'var(--color-brand)', flexShrink: 0 }} />
                  )}
                </button>
              ))}
              {errors.activityLevel && <p className="text-xs text-red-400 mt-1">{errors.activityLevel}</p>}
            </div>
          )}

          {/* ---- Step: Hedef ---- */}
          {currentStep === 'hedef' && (
            <div className="flex flex-col gap-3 animate-fade-in">
              {GOAL_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  id={`ob-goal-${opt.value}`}
                  onClick={() => set('goal', opt.value)}
                  className="flex items-center gap-4 p-4 rounded-xl text-left transition-all duration-200"
                  style={{
                    background: form.goal === opt.value ? 'rgba(0,200,83,0.12)' : 'var(--color-surface-2)',
                    border:     form.goal === opt.value ? '1.5px solid rgba(0,200,83,0.5)' : '1px solid var(--color-border)',
                  }}
                >
                  <span className="text-3xl flex-shrink-0">{opt.emoji}</span>
                  <div className="flex-1">
                    <p className="text-base font-bold" style={{ color: form.goal === opt.value ? 'var(--color-brand)' : 'var(--color-text)' }}>
                      {opt.label}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{opt.desc}</p>
                  </div>
                  {form.goal === opt.value && (
                    <Check size={18} style={{ color: 'var(--color-brand)', flexShrink: 0 }} />
                  )}
                </button>
              ))}
              {errors.goal && <p className="text-xs text-red-400 mt-1">{errors.goal}</p>}
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-3 mt-6">
            {stepIndex > 0 && (
              <button
                id="ob-back-btn"
                type="button"
                className="btn-secondary px-4"
                onClick={handleBack}
              >
                <ChevronLeft size={16} /> Geri
              </button>
            )}
            <button
              id="ob-next-btn"
              type="button"
              className="btn-primary flex-1 justify-center"
              onClick={handleNext}
            >
              {isLastStep ? (
                <><Check size={16} /> Başla!</>
              ) : (
                <>Devam <ChevronRight size={16} /></>
              )}
            </button>
          </div>
        </div>

        <p className="text-center text-xs mt-4 flex flex-col gap-1" style={{ color: 'var(--color-text-muted)' }}>
          <span>Bilgilerin yalnızca cihazında saklanır, hiçbir sunucuya gönderilmez 🔒</span>
          <span className="font-semibold opacity-80 mt-1">© 2026 Benim Kalorim | Furkan Artan tarafından geliştirilmiştir.</span>
        </p>
      </div>
    </div>
  );
}
