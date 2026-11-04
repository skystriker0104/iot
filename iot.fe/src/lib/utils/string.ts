/**
 * Utilities for text normalization, search, and date query matching
 */

export function normalizeSearchText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .trim();
}

export function matchDateTimeQuery(recordTimeStr: string, rawQuery: string): boolean {
  if (!recordTimeStr || !rawQuery) return false;
  const q = rawQuery.trim().toLowerCase();
  if (!q) return false;

  // Direct lowercase substring match (e.g. "2026-09-22", "20:15", "2026", "09-22")
  if (recordTimeStr.toLowerCase().includes(q)) return true;

  // Split date and time: supports both "20:15:05 22/09/2026" and legacy formats
  const parts = recordTimeStr.trim().split(/[\sT]+/);
  let datePart = '';
  let timePart = '';

  if (parts.length >= 2) {
    if (parts[0].includes(':')) {
      timePart = parts[0];
      datePart = parts[1];
    } else {
      datePart = parts[0];
      timePart = parts[1];
    }
  } else if (parts.length === 1) {
    if (parts[0].includes(':')) {
      timePart = parts[0];
    } else {
      datePart = parts[0];
    }
  }

  let year = '', month = '', day = '';
  if (datePart.includes('/')) {
    [day = '', month = '', year = ''] = datePart.split('/');
  } else if (datePart.includes('-')) {
    [year = '', month = '', day = ''] = datePart.split('-');
  }
  const [hour = '', minute = '', second = ''] = timePart.split(':');

  const mInt = parseInt(month, 10);
  const dInt = parseInt(day, 10);
  const hInt = parseInt(hour, 10);
  const yInt = parseInt(year, 10);

  // 1. Check Hour patterns (e.g. "20h", "20h15", "8h", "20 giờ", "20 gio", "giờ 20", "20:")
  const hPattern = q.match(/^(\d{1,2})h(\d{1,2})?$/);
  if (hPattern) {
    const qH = parseInt(hPattern[1], 10);
    const qM = hPattern[2] ? parseInt(hPattern[2], 10) : null;
    if (qH === hInt) {
      if (qM === null) return true;
      if (qM === parseInt(minute, 10)) return true;
    }
  }

  if (/^(\d{1,2})\s*(giờ|gio)$/.test(q)) {
    const match = q.match(/^(\d{1,2})\s*(giờ|gio)$/);
    if (match && parseInt(match[1], 10) === hInt) return true;
  }
  if (/^(giờ|gio)\s*(\d{1,2})$/.test(q)) {
    const match = q.match(/^(giờ|gio)\s*(\d{1,2})$/);
    if (match && parseInt(match[2], 10) === hInt) return true;
  }
  if (q.endsWith(':')) {
    const qH = parseInt(q.slice(0, -1), 10);
    if (!isNaN(qH) && qH === hInt) return true;
  }

  // 2. Check Month patterns (e.g. "tháng 9", "thang 9", "tháng 09", "thg 9", "09/2026", "2026-09")
  if (/^(tháng|thang|thg)\s*(\d{1,2})(\/(\d{4}))?$/.test(q)) {
    const m = q.match(/^(tháng|thang|thg)\s*(\d{1,2})(\/(\d{4}))?$/)!;
    const qM = parseInt(m[2], 10);
    const qY = m[4] ? parseInt(m[4], 10) : null;
    if (qM === mInt && (qY === null || qY === yInt)) return true;
  }

  const myMatch = q.match(/^(\d{1,2})[\/\-](\d{4})$/);
  if (myMatch) {
    const qM = parseInt(myMatch[1], 10);
    const qY = parseInt(myMatch[2], 10);
    if (qM === mInt && qY === yInt) return true;
  }

  const ymMatch = q.match(/^(\d{4})[\/\-](\d{1,2})$/);
  if (ymMatch) {
    const qY = parseInt(ymMatch[1], 10);
    const qM = parseInt(ymMatch[2], 10);
    if (qY === yInt && qM === mInt) return true;
  }

  // 3. Check Day patterns (e.g. "ngày 22", "ngay 22", "22/09", "22/09/2026", "22-09", "22 tháng 9")
  if (/^(ngày|ngay)\s*(.+)$/.test(q)) {
    const rest = q.match(/^(ngày|ngay)\s*(.+)$/)![2].trim();
    if (rest === day || rest === String(dInt)) return true;
    if (rest === `${day}/${month}` || rest === `${dInt}/${mInt}` || rest === `${day}-${month}`) return true;
    if (rest === `${day}/${month}/${year}` || rest === `${dInt}/${mInt}/${year}`) return true;
  }

  const dmyMatch = q.match(/^(\d{1,2})[\/\-](\d{1,2})([\/\-](\d{4}))?$/);
  if (dmyMatch) {
    const qD = parseInt(dmyMatch[1], 10);
    const qM = parseInt(dmyMatch[2], 10);
    const qY = dmyMatch[4] ? parseInt(dmyMatch[4], 10) : null;
    if (qY !== null) {
      if (qD === dInt && qM === mInt && qY === yInt) return true;
    } else {
      if (qD === dInt && qM === mInt) return true;
    }
  }

  if (/^(\d{1,2})\s*(tháng|thang|thg)\s*(\d{1,2})$/.test(q)) {
    const m = q.match(/^(\d{1,2})\s*(tháng|thang|thg)\s*(\d{1,2})$/)!;
    const qD = parseInt(m[1], 10);
    const qM = parseInt(m[3], 10);
    if (qD === dInt && qM === mInt) return true;
  }

  // 4. Check Year patterns (e.g. "năm 2026", "nam 2026")
  if (/^(năm|nam)\s*(\d{4})$/.test(q)) {
    const qY = parseInt(q.match(/^(năm|nam)\s*(\d{4})$/)![2], 10);
    if (qY === yInt) return true;
  }

  // 5. Common variations
  const variations = [
    `${day}/${month}/${year}`,
    `${dInt}/${mInt}/${year}`,
    `${day}/${month}`,
    `${dInt}/${mInt}`,
    `${month}/${year}`,
    `${mInt}/${year}`,
    `${year}-${month}`,
    `${year}-${month}-${day}`,
    `${hour}:${minute}`,
    `${hour}:${minute}:${second}`,
    `${hour}h`,
    `${hour}h${minute}`,
    `${hInt}h`,
    `${hInt}h${minute}`,
    `${day}-${month}-${year}`,
    `${dInt}-${mInt}-${year}`,
  ];

  return variations.some((v) => v.toLowerCase().includes(q) || q.includes(v.toLowerCase()));
}
