import React from 'react';
import type { LucideIcon } from 'lucide-react';

export interface NavMenuItem {
  id: string;
  label: string;
  Icon: LucideIcon | React.ComponentType<{ size?: number | string; className?: string }>;
}

export interface AdminLayoutProps {
  children: React.ReactNode;
}
