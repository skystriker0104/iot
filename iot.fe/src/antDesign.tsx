import React from 'react';
import { ConfigProvider, App as AntdApp, type ThemeConfig } from 'antd';
import viVN from 'antd/locale/vi_VN';

/**
 * Cấu hình Design Tokens Ant Design chuẩn cho hệ thống IoT Hub
 * Tone màu chủ đạo: Deep Teal (#09353D) và Dark Sidebar (#062329)
 */
export const antDesignThemeConfig: ThemeConfig = {
  token: {
    // Nhận diện thương hiệu IoT PTIT
    colorPrimary: '#09353D',
    colorPrimaryHover: '#0e4d58',
    colorPrimaryActive: '#06252b',
    colorPrimaryBg: '#e6f4f6',
    colorPrimaryBgHover: '#d4edf0',

    // Trạng thái hệ thống & Cảm biến
    colorSuccess: '#10B981',
    colorWarning: '#D97706',
    colorError: '#DC2626',
    colorInfo: '#0284C7',

    // Bố cục & Màu nền
    colorBgLayout: '#F8FAFC',
    colorBgContainer: '#FFFFFF',
    colorBorder: '#E2E8F0',
    colorBorderSecondary: '#F1F5F9',

    // Kiểu chữ
    colorText: '#0F172A',
    colorTextSecondary: '#475569',
    colorTextTertiary: '#64748B',
    colorTextQuaternary: '#94A3B8',

    borderRadius: 10,
    borderRadiusLG: 12,
    borderRadiusSM: 6,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    fontSize: 13,
  },
  components: {
    Layout: {
      headerBg: '#FFFFFF',
      headerHeight: 70,
      headerPadding: '0 24px',
      siderBg: '#062329',
      bodyBg: '#F8FAFC',
    },
    Menu: {
      darkItemBg: '#062329',
      darkItemSelectedBg: 'rgba(255, 255, 255, 0.15)',
      darkItemColor: 'rgba(255, 255, 255, 0.7)',
      darkItemSelectedColor: '#FFFFFF',
      darkItemHoverBg: 'rgba(255, 255, 255, 0.1)',
      darkItemHoverColor: '#FFFFFF',
      itemBorderRadius: 8,
      itemMarginInline: 8,
      itemHeight: 40,
    },
    Card: {
      colorBorderSecondary: '#E2E8F0',
      headerBg: '#FFFFFF',
      headerHeight: 48,
      headerFontSize: 14,
      boxShadowTertiary: '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
    },
    Table: {
      headerBg: '#F8FAFC',
      headerColor: '#475569',
      headerSplitColor: 'transparent',
      rowHoverBg: '#F8FAFC',
      borderColor: '#F1F5F9',
      cellPaddingBlock: 12,
      cellPaddingInline: 16,
      fontSize: 12,
    },
    Select: {
      controlHeight: 36,
      borderRadius: 8,
      colorBorder: '#CBD5E1',
      optionSelectedBg: '#E6F4F6',
      optionSelectedColor: '#09353D',
      optionActiveBg: '#F1F8F9',
    },
    Input: {
      controlHeight: 36,
      borderRadius: 8,
      colorBorder: '#CBD5E1',
      activeBorderColor: '#09353D',
      hoverBorderColor: '#0E4D58',
    },
    Button: {
      controlHeight: 36,
      borderRadius: 8,
      fontWeight: 600,
      fontSize: 12,
    },
    Switch: {
      colorPrimary: '#10B981',
      colorPrimaryHover: '#059669',
    },
    Dropdown: {
      controlItemBgActive: '#E6F4F6',
      controlItemBgHover: '#F1F8F9',
      borderRadiusLG: 8,
    },
    Pagination: {
      itemActiveBg: '#09353D',
      borderRadius: 8,
      fontSize: 12,
    },
    Tag: {
      borderRadiusSM: 999,
      fontSize: 11,
    },
    Segmented: {
      itemSelectedBg: '#09353D',
      itemSelectedColor: '#FFFFFF',
      borderRadiusSM: 6,
    },
  },
};

export interface AntDesignProviderProps {
  children: React.ReactNode;
}

/**
 * Provider Ant Design bọc toàn bộ ứng dụng IoT
 */
export const AntDesignProvider: React.FC<AntDesignProviderProps> = ({ children }) => {
  return (
    <ConfigProvider locale={viVN} theme={antDesignThemeConfig}>
      <AntdApp>{children}</AntdApp>
    </ConfigProvider>
  );
};

export default AntDesignProvider;
