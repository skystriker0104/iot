/**
 * Utilities for DateTime handling across the IoT application
 */

export function parseServerDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  // Handle space separator if ISO-like "YYYY-MM-DD HH:mm:ss"
  const normalized = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T');
  const d = new Date(normalized);
  return isNaN(d.getTime()) ? new Date() : d;
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? parseServerDate(date) : date;
  const pad = (n: number) => String(n).padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  const seconds = pad(d.getSeconds());
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseServerDate(date) : date;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? parseServerDate(date) : date;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function getNowIsoString(): string {
  return new Date().toISOString().replace('T', ' ').substring(0, 19);
}
