/**
 * Quản lý tập trung toàn bộ Query Keys cho TanStack Query
 */
export const queryKeys = {
  sensors: {
    all: ['sensors'] as const,
    latest: () => [...queryKeys.sensors.all, 'latest'] as const,
    chart: () => [...queryKeys.sensors.all, 'chart'] as const,
    history: (params: Record<string, any>) => [...queryKeys.sensors.all, 'history', params] as const,
  },
  devices: {
    all: ['devices'] as const,
    list: () => [...queryKeys.devices.all, 'list'] as const,
  },
  history: {
    all: ['device-activity'] as const,
    list: (params: Record<string, any>) => [...queryKeys.history.all, 'list', params] as const,
  },
  profile: {
    all: ['profile'] as const,
    current: () => [...queryKeys.profile.all, 'current'] as const,
  },
} as const;

