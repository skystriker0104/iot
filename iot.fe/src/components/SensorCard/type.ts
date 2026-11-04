import type { LucideIcon } from 'lucide-react';

export interface SensorCardProps {
  label: string;
  value: string | number;
  unit: string;
  color: string;
  Icon: LucideIcon | React.ComponentType<{ size?: number | string; color?: string; className?: string }>;
  trend: number[];
  subtext?: string;
  thresholdWarning?: boolean;
  className?: string;
}
