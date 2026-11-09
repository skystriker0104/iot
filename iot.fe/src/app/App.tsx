import React, { useEffect } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { useAppStore } from '../stores/useAppStore';
import { signalRService } from '../lib/signalr/signalrService';
import { LoginPage } from './dang-nhap';
import { AdminLayout } from './(admin)/layout';
import { DashboardPage } from './(admin)/tong-quan/page';
import { SensorDataPage } from './(admin)/du-lieu-cam-bien/page';
import { ActivityLogPage } from './(admin)/lich-su-hoat-dong/page';
import { ProfilePage } from './(admin)/ho-so/page';

export default function App() {
  const { isAuthenticated } = useAuthStore();
  const { currentPageSlug } = useAppStore();

  // Kết nối SignalR khi đã đăng nhập, ngắt khi đăng xuất / hết phiên
  useEffect(() => {
    if (isAuthenticated) signalRService.init();
    else void signalRService.stop();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <AdminLayout>
      {currentPageSlug === 'home' && <DashboardPage />}
      {currentPageSlug === 'data' && <SensorDataPage />}
      {currentPageSlug === 'history' && <ActivityLogPage />}
      {currentPageSlug === 'profile' && <ProfilePage />}
    </AdminLayout>
  );
}
