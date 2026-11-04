import {
  LayoutDashboard,
  Database,
  History,
  User
} from 'lucide-react';
import type { NavMenuItem } from './type';

export const ADMIN_NAV_ITEMS: NavMenuItem[] = [
  { id: 'home', label: 'Bảng điều khiển', Icon: LayoutDashboard },
  { id: 'data', label: 'Dữ liệu cảm biến', Icon: Database },
  { id: 'history', label: 'Lịch sử hoạt động', Icon: History },
  { id: 'profile', label: 'Hồ sơ sinh viên', Icon: User },
];

export const PAGE_TITLES: Record<string, string> = {
  home: 'Bảng điều khiển Giám sát & Điều khiển IoT',
  data: 'Quản lý Lịch sử Dữ liệu Cảm biến',
  history: 'Lịch sử Hành động Điều khiển Thiết bị',
  profile: 'Hồ sơ Sinh viên & Tài nguyên Đồ án',
};
