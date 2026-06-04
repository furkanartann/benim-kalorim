// ============================================================
// Benim Kalorim – useProfile Custom Hook
// Kullanıcı profili ve günlük hedef yönetimi
// ============================================================

import { useState, useCallback, useEffect } from 'react';
import type { UserProfile, DailyGoal } from '../interfaces';
import { getProfile, saveProfile } from '../utils/storage';

/**
 * Mifflin-St Jeor formülüyle BMR hesaplar
 */
function calculateBMR(profile: UserProfile): number {
  const { weight, height, age, gender } = profile;
  const base = 10 * weight + 6.25 * height - 5 * age;
  return gender === 'erkek' ? base + 5 : base - 161;
}

const ACTIVITY_MULTIPLIERS: Record<UserProfile['activityLevel'], number> = {
  'hareketsiz':    1.2,
  'az-aktif':      1.375,
  'orta-aktif':    1.55,
  'çok-aktif':     1.725,
  'ekstra-aktif':  1.9,
};

const GOAL_ADJUSTMENTS: Record<UserProfile['goal'], number> = {
  'kilo-ver':  -500,
  'kilo-koru':    0,
  'kilo-al':   +500,
};

/**
 * Profil bilgisinden günlük kalori hedefi hesaplar
 */
export function calcDailyCalories(profile: UserProfile): number {
  const bmr  = calculateBMR(profile);
  const tdee = bmr * ACTIVITY_MULTIPLIERS[profile.activityLevel];
  return Math.round(tdee + GOAL_ADJUSTMENTS[profile.goal]);
}

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const refresh = useCallback(() => {
    setProfile(getProfile());
  }, []);

  useEffect(() => {
    refresh();

    const handleUpdate = () => {
      refresh();
    };

    window.addEventListener('profile-updated', handleUpdate);
    return () => {
      window.removeEventListener('profile-updated', handleUpdate);
    };
  }, [refresh]);

  const updateProfile = useCallback((data: Partial<UserProfile>) => {
    const current  = profile ?? defaultProfile();
    const calories = calcDailyCalories({ ...current, ...data } as UserProfile);

    const weightVal = data.weight ?? current.weight;
    const waterGoal = data.waterGoal !== undefined
      ? data.waterGoal
      : data.weight !== undefined
        ? Math.round((weightVal * 35) / 250) * 250
        : current.waterGoal ?? Math.round((weightVal * 35) / 250) * 250;

    const updated: UserProfile = {
      ...current,
      ...data,
      dailyGoal: {
        calories,
        protein: Math.round((calories * 0.30) / 4),  // 30% protein
        carbs:   Math.round((calories * 0.45) / 4),  // 45% carb
        fat:     Math.round((calories * 0.25) / 9),  // 25% fat
      },
      waterGoal,
      updatedAt: new Date().toISOString(),
    } as UserProfile;

    saveProfile(updated);
    setProfile(updated);
    window.dispatchEvent(new Event('profile-updated'));
    return updated;
  }, [profile]);

  const updateDailyGoal = useCallback((goal: DailyGoal, waterGoal?: number) => {
    if (!profile) return;
    const updated = {
      ...profile,
      dailyGoal: goal,
      ...(waterGoal !== undefined ? { waterGoal } : {}),
      updatedAt: new Date().toISOString(),
    };
    saveProfile(updated);
    setProfile(updated);
    window.dispatchEvent(new Event('profile-updated'));
  }, [profile]);

  return { profile, updateProfile, updateDailyGoal };
}

function defaultProfile(): UserProfile {
  return {
    name:          '',
    age:           25,
    weight:        70,
    height:        170,
    gender:        'erkek',
    activityLevel: 'orta-aktif',
    goal:          'kilo-koru',
    dailyGoal:     { calories: 2000, protein: 150, carbs: 225, fat: 55 },
    waterGoal:     2500,
    updatedAt:     new Date().toISOString(),
  };
}
