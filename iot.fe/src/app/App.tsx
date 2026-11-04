import React, { useEffect } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { useAppStore } from '../stores/useAppStore';
import { LoginPage } from './dang-nhap';
import { AdminLayout } from './(admin)/layout';
import { DashboardPage } from './(admin)/tong-quan/page';
import { SensorDataPage } from './(admin)/du-lieu-cam-bien/page';
import { ActivityLogPage } from './(admin)/lich-su-hoat-dong/page';
import { ProfilePage } from './(admin)/ho-so/page';
import { APP_CONFIG } from '../lib/constants';

export default function App() {
  const { isAuthenticated } = useAuthStore();
  const {
    isLiveStreaming,
    currentPageSlug,
    syncFromBackend,
  } = useAppStore();

  useEffect(() => {
    if (!isAuthenticated) return;
    syncFromBackend();
  }, [isAuthenticated, syncFromBackend]);

  useEffect(() => {
    if (!isAuthenticated || !isLiveStreaming) return;

    const interval = setInterval(() => {
      syncFromBackend();
    }, APP_CONFIG.LIVE_STREAM_INTERVAL_MS || 2500);

    return () => clearInterval(interval);
  }, [isAuthenticated, isLiveStreaming, syncFromBackend]);

  // ─── Early return ──────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // ─── Render JSX ────────────────────────────────────────────────────────────
  return (
    <AdminLayout>
      {currentPageSlug === 'home' && <DashboardPage />}
      {currentPageSlug === 'data' && <SensorDataPage />}
      {currentPageSlug === 'history' && <ActivityLogPage />}
      {currentPageSlug === 'profile' && <ProfilePage />}
    </AdminLayout>
  );
}
