import { create } from 'zustand';

// Dữ liệu cảm biến / thiết bị / lịch sử đều lấy từ BE qua TanStack Query.
// Store này chỉ giữ trạng thái điều hướng của UI.
interface AppState {
  currentPageSlug: string;
  setCurrentPageSlug: (slug: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentPageSlug: 'home',
  setCurrentPageSlug: (slug) => set({ currentPageSlug: slug }),
}));
