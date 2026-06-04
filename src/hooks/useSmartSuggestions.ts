// ============================================================
// Benim Kalorim – useSmartSuggestions Hook
// Günlük veri analizine dayalı akıllı öneriler üretir.
// Tamamen kural tabanlı, backend gerektirmez.
// ============================================================

import { useMemo } from 'react';
import type { FoodEntry, DailyGoal } from '../interfaces';

export type SuggestionType = 'warning' | 'success' | 'tip' | 'info';

export interface Suggestion {
  id:      string;
  type:    SuggestionType;
  emoji:   string;
  title:   string;
  message: string;
}

interface SuggestionInput {
  entries:     FoodEntry[];   // Bugünkü kayıtlar
  allEntries:  FoodEntry[];   // Tüm kayıtlar (trend analizi için)
  goal:        DailyGoal;
  today:       string;        // YYYY-MM-DD
  waterIntake?: number;
  waterGoal?:   number;
}

/** Şu an saat kaç (0-23) */
function currentHour(): number {
  return new Date().getHours();
}

/** Yüzde hesapla (sıfıra bölme korumalı) */
function pct(val: number, total: number): number {
  return total > 0 ? (val / total) * 100 : 0;
}

export function useSmartSuggestions({
  entries,
  allEntries,
  goal,
  today,
  waterIntake = 0,
  waterGoal = 2500,
}: SuggestionInput): Suggestion[] {

  return useMemo(() => {
    const suggestions: Suggestion[] = [];
    const hour = currentHour();

    // Günlük toplamlar
    const totals = entries.reduce(
      (acc, e) => ({
        cal:     acc.cal     + e.calories,
        protein: acc.protein + e.protein,
        carbs:   acc.carbs   + e.carbs,
        fat:     acc.fat     + e.fat,
      }),
      { cal: 0, protein: 0, carbs: 0, fat: 0 }
    );

    const calPct     = pct(totals.cal,     goal.calories);
    const proteinPct = pct(totals.protein, goal.protein);
    const carbsPct   = pct(totals.carbs,   goal.carbs);
    const fatPct     = pct(totals.fat,     goal.fat);

    // Makro kalori dağılımı (toplam makro kcal içindeki pay)
    const totalMacroKcal = totals.protein * 4 + totals.carbs * 4 + totals.fat * 9 || 1;
    const carbsRatio  = (totals.carbs * 4)   / totalMacroKcal;
    const proteinRatio= (totals.protein * 4) / totalMacroKcal;
    const fatRatio    = (totals.fat * 9)     / totalMacroKcal;

    const hasMeals = entries.length > 0;

    // Öğün türleri
    const mealTypes = new Set(entries.map(e => e.mealType));
    const hasBreakfast = mealTypes.has('kahvaltı');
    const hasLunch     = mealTypes.has('öğle');
    const hasDinner    = mealTypes.has('akşam');

    // ================================================================
    // KURAL 1: Hiç kayıt yok
    // ================================================================
    if (!hasMeals) {
      if (hour >= 7 && hour < 12) {
        suggestions.push({
          id: 'no-breakfast',
          type: 'tip',
          emoji: '🌅',
          title: 'Güne iyi başla!',
          message: 'Kahvaltı metabolizmanı hızlandırır ve gün boyunca enerjini dengeler. İlk öğününü ekle.',
        });
      } else if (hour >= 12) {
        suggestions.push({
          id: 'no-meals',
          type: 'warning',
          emoji: '⚠️',
          title: 'Henüz öğün eklenmedi',
          message: 'Bugün hiç kayıt girmedin. Yediklerini takip etmeyi unutma!',
        });
      }
    }

    // ================================================================
    // KURAL 2: Kahvaltı atlamak (öğle+ saatlerde)
    // ================================================================
    if (!hasBreakfast && hour >= 10 && hasMeals) {
      suggestions.push({
        id: 'skip-breakfast',
        type: 'warning',
        emoji: '🥣',
        title: 'Kahvaltıyı atladın!',
        message: 'Kahvaltı atlamak öğleden sonra aşırı yemeye yol açabilir. Yarın güne güzel bir kahvaltıyla başla.',
      });
    }

    // ================================================================
    // KURAL 3: Günlük kalori aşımı
    // ================================================================
    if (calPct > 110) {
      suggestions.push({
        id: 'over-calories',
        type: 'warning',
        emoji: '🔥',
        title: 'Kalori hedefini aştın!',
        message: `Günlük hedefinin %${Math.round(calPct - 100)} fazlasını aldın (${Math.round(totals.cal - goal.calories)} kcal). Akşam hafif bir öğün tercih et.`,
      });
    }

    // ================================================================
    // KURAL 4: Günün ilerleyen saatinde kalori çok düşük
    // ================================================================
    if (hour >= 16 && calPct < 50 && hasMeals) {
      suggestions.push({
        id: 'low-calories-evening',
        type: 'warning',
        emoji: '📉',
        title: 'Çok az kalori aldın',
        message: `Günün büyük bölümü geçti ama hedefinin yalnızca %${Math.round(calPct)}'ini tamamladın. Metabolizma yavaşlamaması için düzenli beslenmeye dikkat et.`,
      });
    }

    // ================================================================
    // KURAL 5: Karbonhidrat fazlası (oran bazlı)
    // ================================================================
    if (carbsRatio > 0.60 && hasMeals) {
      suggestions.push({
        id: 'high-carbs',
        type: 'warning',
        emoji: '🍞',
        title: 'Karbonhidrat biraz fazla!',
        message: `Bugünkü enerjinin %${Math.round(carbsRatio * 100)}'i karbonhidrattan geliyor. Sonraki öğünde protein ağırlıklı bir seçim yap: tavuk, yumurta veya baklagil.`,
      });
    }

    // ================================================================
    // KURAL 6: Protein yetersizliği
    // ================================================================
    if (proteinPct < 50 && hour >= 14 && hasMeals) {
      suggestions.push({
        id: 'low-protein',
        type: 'tip',
        emoji: '💪',
        title: 'Protein alımın düşük',
        message: `Günlük protein hedefinin %${Math.round(proteinPct)}'ini tamamladın. Kas koruması için et, süt ürünü veya baklagil ekle.`,
      });
    }

    // ================================================================
    // KURAL 7: Yağ aşımı
    // ================================================================
    if (fatRatio > 0.40 && hasMeals) {
      suggestions.push({
        id: 'high-fat',
        type: 'tip',
        emoji: '🥑',
        title: 'Yağ oranı yüksek',
        message: `Bugün enerjinin %${Math.round(fatRatio * 100)}'i yağdan geliyor. Kızartma ve sürülebilir yağları azaltmayı düşün.`,
      });
    }

    // ================================================================
    // KURAL 8: Dengeli beslenme — her şey iyi
    // ================================================================
    if (
      calPct >= 70 && calPct <= 105 &&
      proteinPct >= 70 &&
      carbsPct   <= 110 &&
      fatPct     <= 110 &&
      hasMeals
    ) {
      suggestions.push({
        id: 'balanced',
        type: 'success',
        emoji: '🎉',
        title: 'Harika gidiyorsun!',
        message: 'Bugün kalori ve makro dengen çok iyi. Bu şekilde devam et!',
      });
    }

    // ================================================================
    // KURAL 9: Öğle yemeği atlandı (15:00+)
    // ================================================================
    if (!hasLunch && hour >= 15 && hasMeals) {
      suggestions.push({
        id: 'skip-lunch',
        type: 'info',
        emoji: '☀️',
        title: 'Öğle öğününü kaydettin mi?',
        message: 'Öğle kaydın görünmüyor. Yediklerini unutmadan ekle, takibin eksiksiz kalsın.',
      });
    }

    // ================================================================
    // KURAL 10: Akşam yemeği saatinde hatırlatma
    // ================================================================
    if (hour >= 18 && hour < 21 && !hasDinner && calPct < 80) {
      suggestions.push({
        id: 'dinner-reminder',
        type: 'info',
        emoji: '🌙',
        title: 'Akşam yemeği vakti!',
        message: `Kalan ${Math.round(goal.calories - totals.cal)} kcal ile güzel bir akşam yemeği planlayabilirsin.`,
      });
    }

    // ================================================================
    // KURAL 11: Haftalık streak kontrolü
    // ================================================================
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today + 'T00:00:00');
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    });
    const streakDays = last7Days.filter(d =>
      allEntries.some(e => e.date === d)
    ).length;

    if (streakDays >= 5) {
      suggestions.push({
        id: 'streak',
        type: 'success',
        emoji: '🏆',
        title: `${streakDays} günlük seri!`,
        message: 'Son 7 günde düzenli takip yapıyorsun. Tutarlılık başarının anahtarı, devam et!',
      });
    }

    // ================================================================
    // KURAL 12: Gece geç saatte yüksek kalori
    // ================================================================
    if (hour >= 21 && calPct > 90) {
      suggestions.push({
        id: 'late-night',
        type: 'tip',
        emoji: '🌙',
        title: 'Gece geç saatlerde dikkat',
        message: 'Geç saatte yüksek karbonhidrat ve yağlı besinler yerine hafif atıştırmalıklar tercih et.',
      });
    }

    // ================================================================
    // KURAL 13: Gün ortasında dengeli gidişat geri bildirimi
    // ================================================================
    if (
      hasMeals &&
      calPct > 10 && calPct < 70 &&
      carbsRatio >= 0.35 && carbsRatio <= 0.65 &&
      proteinRatio >= 0.12 &&
      fatRatio <= 0.45
    ) {
      suggestions.push({
        id: 'midday-balanced',
        type: 'success',
        emoji: '⚖️',
        title: 'Dengeli ilerliyorsun!',
        message: 'Şu ana kadar aldığın karbonhidrat, protein ve yağ dağılımın gayet dengeli. Harika gidiyorsun!',
      });
    }

    // ================================================================
    // KURAL 14: Kalan kalori hedefine yaklaşma
    // ================================================================
    if (hasMeals && calPct > 0 && calPct < 85) {
      const remainingCal = Math.round(goal.calories - totals.cal);
      if (remainingCal > 0) {
        suggestions.push({
          id: 'remaining-calories-tip',
          type: 'info',
          emoji: '🎯',
          title: 'Günlük Hedefine Yaklaş',
          message: `Bugünkü kalori hedefinin %${Math.round(calPct)}'ini tamamladın. Kalan ${remainingCal} kcal hedefin için sağlıklı besinler planlayabilirsin.`,
        });
      }
    }

    // ================================================================
    // YEDEK KURAL (FALLBACK): Listede 2'den az öneri varsa genel sağlık ipuçları ekle
    // ================================================================
    if (suggestions.length < 2) {
      const GENERAL_TIPS: Omit<Suggestion, 'id'>[] = [
        {
          type: 'tip',
          emoji: '💧',
          title: 'Su Tüketimini İhmal Etme',
          message: 'Günde en az 2-2.5 litre su içmek metabolizmayı hızlandırır, sindirime yardımcı olur ve sahte açlık hissini önler.',
        },
        {
          type: 'tip',
          emoji: '🌾',
          title: 'Lif Tüketimini Artır',
          message: 'Öğünlerinde sebze, baklagil ve tam tahıllı besinlere yer vererek lif alımını artırabilir ve daha uzun süre tok kalabilirsin.',
        },
        {
          type: 'tip',
          emoji: '⏱️',
          title: 'Yavaş Çiğnemeye Özen Göster',
          message: 'Doyma sinyalinin beyne ulaşması yaklaşık 20 dakika sürer. Yavaş yiyerek porsiyon kontrolünü kolaylaştırabilirsin.',
        },
        {
          type: 'tip',
          emoji: '🏃',
          title: 'Hafif Egzersiz ve Hareket',
          message: 'Bugün 15-20 dakikalık tempolu bir yürüyüş yapmayı dene. Kalori yakımına, sindirime ve zihinsel rahatlamaya harika katkı sağlar.',
        },
        {
          type: 'tip',
          emoji: '😴',
          title: 'Kaliteli Uyku Düzeni',
          message: 'Yetersiz uyku açlık hormonu olan grelini artırır. Günde 7-8 saat kaliteli uyumaya özen göster.',
        },
        {
          type: 'tip',
          emoji: '🧂',
          title: 'Tuz Tüketimini Sınırla',
          message: 'Aşırı sodyum alımı vücutta ödem ve su tutulmasına yol açabilir. Yemeklerde tuz yerine lezzetli baharatlar kullanmayı dene.',
        },
        {
          type: 'tip',
          emoji: '🍏',
          title: 'Ara Öğünlerde Sağlıklı Tercihler',
          message: 'Kan şekerinin ani düşmesini engellemek için ara öğünlerde kuru meyveler, çiğ kuruyemişler veya yoğurt tercih edebilirsin.',
        },
        {
          type: 'tip',
          emoji: '🧘',
          title: 'Stresi Yönetmeye Çalış',
          message: 'Yüksek stres kortizol hormonunu artırarak duygusal yeme isteği yaratabilir. Derin nefes egzersizleri veya meditasyon yapmayı dene.',
        }
      ];

      // Günün gün bilgisine (1-31) göre sabit ama her gün değişen ipuçları seçelim (böylece sayfa yenilenince değişip titremez)
      const dayOfMonth = new Date().getDate();
      
      const firstIndex = dayOfMonth % GENERAL_TIPS.length;
      const secondIndex = (dayOfMonth + 3) % GENERAL_TIPS.length;

      const tip1 = { ...GENERAL_TIPS[firstIndex], id: `gen-tip-${firstIndex}` };
      const tip2 = { ...GENERAL_TIPS[secondIndex], id: `gen-tip-${secondIndex}` };

      // Halihazırda var olan önerilerle veya aynı başlıklı önerilerle çakışmasın diye kontrol edelim
      if (!suggestions.some(s => s.title === tip1.title)) {
        suggestions.push(tip1);
      }
      if (suggestions.length < 2 && !suggestions.some(s => s.title === tip2.title)) {
        suggestions.push(tip2);
      }
    }

    // ================================================================
    // KURAL 15: Su hedefine ulaşıldı
    // ================================================================
    if (waterIntake >= waterGoal && waterGoal > 0) {
      suggestions.push({
        id: 'water-goal-reached',
        type: 'success',
        emoji: '💧',
        title: 'Harika Hydration! 🎉',
        message: `Günlük su tüketim hedefine ulaştın (${waterIntake} ml). Vücudunu nemli tuttuğun için harikasın!`,
      });
    }

    // ================================================================
    // KURAL 16: Gün ortasında düşük su tüketimi
    // ================================================================
    if (hour >= 14 && waterIntake < 1000 && waterGoal > 0) {
      suggestions.push({
        id: 'water-low-midday',
        type: 'warning',
        emoji: '💧',
        title: 'Su Tüketimin Düşük',
        message: `Günün yarısı geçti ama henüz sadece ${waterIntake} ml su içtin. Metabolizman ve sindirimin için şimdi bir bardak su içmeye ne dersin?`,
      });
    }

    // ================================================================
    // KURAL 17: Akşam su hatırlatıcısı
    // ================================================================
    if (hour >= 18 && waterIntake < waterGoal * 0.70 && waterGoal > 0) {
      suggestions.push({
        id: 'water-low-evening',
        type: 'tip',
        emoji: '💧',
        title: 'Akşam Su Hatırlatması',
        message: `Günlük su hedefini tamamlamana henüz biraz var. Kalan sürede su tüketimini artırarak hedefine yaklaşabilirsin.`,
      });
    }

    // En fazla 4 öneri göster, öncelik sırasına göre sırala
    const priorityOrder: SuggestionType[] = ['warning', 'success', 'tip', 'info'];
    return suggestions
      .sort((a, b) => priorityOrder.indexOf(a.type) - priorityOrder.indexOf(b.type))
      .slice(0, 4);

  }, [entries, allEntries, goal, today, waterIntake, waterGoal]);
}
