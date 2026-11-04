import React from 'react';
import type { LucideIcon } from 'lucide-react';

export interface ProfileResourceItem {
  title: string;
  desc: string;
  url: string;
  icon: LucideIcon | React.ComponentType<{ size?: number | string; className?: string }>;
}
