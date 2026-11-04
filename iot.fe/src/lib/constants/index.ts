export * from './enums';
export * from './mockData';

export const APP_CONFIG = {
  APP_TITLE: 'IoT Hub PTIT',
  GROUP_NAME: 'Nhóm 11 • ESP8266 MQTT',
  DEFAULT_PAGE_SIZE: 10,
  LIVE_STREAM_INTERVAL_MS: 2000,
  MQTT_BROKER_URL: 'broker.emqx.io:1883'
} as const;
