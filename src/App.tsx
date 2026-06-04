// ============================================================
// Benim Kalorim – App.tsx
// Ana uygulama bileşeni – onboarding kontrolü + routing
// ============================================================

import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar }           from './components/Navbar';
import { OnboardingPage }   from './pages/OnboardingPage';
import { DashboardPage }    from './pages/DashboardPage';
import { FoodEntriesPage }  from './pages/FoodEntriesPage';
import { StatisticsPage }   from './pages/StatisticsPage';
import { ProfilePage }      from './pages/ProfilePage';
import { getProfile }       from './utils/storage';

export default function App() {
  // Profil doluysa onboarding'i atla, değilse göster
  const [profileReady, setProfileReady] = useState<boolean | null>(null);

  useEffect(() => {
    const profile = getProfile();
    // Ad ve temel bilgiler varsa hazır say
    setProfileReady(!!(profile && profile.name && profile.age && profile.weight && profile.height));
  }, []);

  // LocalStorage okunana kadar boş ekran (flash önleme)
  if (profileReady === null) return null;

  // Profil yoksa veya eksikse → Onboarding
  if (!profileReady) {
    return (
      <OnboardingPage
        onComplete={() => setProfileReady(true)}
      />
    );
  }

  // Profil hazırsa → Normal uygulama
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-dvh">
        <Navbar />

        <div className="flex-1">
          <Routes>
            <Route path="/"           element={<DashboardPage   />} />
            <Route path="/yemekler"   element={<FoodEntriesPage />} />
            <Route path="/istatistik" element={<StatisticsPage  />} />
            <Route path="/profil"     element={<ProfilePage     />} />
          </Routes>
        </div>

        <footer className="hidden md:block py-4 text-center text-xs"
          style={{ color: 'var(--color-text-muted)', borderTop: '1px solid var(--color-border)' }}>
          © 2026 Benim Kalorim – Akıllı Kalori Takip Uygulaması | Furkan Artan tarafından geliştirilmiştir.
        </footer>
      </div>
    </BrowserRouter>
  );
}
