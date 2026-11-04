import React from 'react';

export const MONO: React.CSSProperties = {
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
};

export const SANS: React.CSSProperties = {
  fontFamily: "Roboto, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, Arial, sans-serif"
};

export const THEME_COLORS = {
  primary: '#09353D',        // Tone màu xanh rêu đậm / Deep Teal (#09353D)
  primaryHover: '#0e4d58',
  primaryActive: '#06252b',
  primaryBg: 'rgba(9, 53, 61, 0.08)',
  primaryLight: '#eef7f8',
  sidebarBg: '#062329',      // Sidebar xanh rêu đậm quý phái
  sidebarActive: '#0d404a',
  sidebarBorder: 'rgba(255, 255, 255, 0.08)',
  gold: '#d97706',
  goldLight: '#fef3c7',
  temp: '#dc2626',
  light: '#d97706',
  humidity: '#0284c7',
  bgMain: '#f8fafc',
  border: '#e2e8f0',
  textMain: '#0f172a',
  textMuted: '#64748b'
} as const;
