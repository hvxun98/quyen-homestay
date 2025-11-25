// utils/datetime.ts
import dayjsLib from './dayjsTz';
import type { Dayjs } from 'dayjs';
import { APP_TZ } from './dayjsTz';

// 1) Chuẩn hoá chuỗi ngày
//    nhận "YYYY-MM-DD" hoặc "dd/MM/yyyy" -> trả "YYYY-MM-DD"
export function normalizeDateStr(dateStr: string): string {
  if (!dateStr) throw new Error('Invalid date string');
  const trimmed = dateStr.trim();

  // dạng YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  // dạng dd/MM/yyyy
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
    const [d, m, y] = trimmed.split('/');
    return `${y}-${m}-${d}`;
  }

  throw new Error('Unsupported date format: ' + dateStr);
}

// 2) Dùng cho SERVER: build Date từ date + hour + minute theo giờ VN
//    => trả về Date (UTC) để lưu Mongo
export function combineLocalToUtcDate(dateStr: string, hour = 0, minute = 0): Date {
  const ymd = normalizeDateStr(dateStr);
  const hh = String(hour ?? 0).padStart(2, '0');
  const mm = String(minute ?? 0).padStart(2, '0');

  const d = dayjsLib.tz(`${ymd} ${hh}:${mm}`, 'YYYY-MM-DD HH:mm', APP_TZ);

  if (!d.isValid()) {
    throw new Error(`Invalid date parts: ${dateStr} ${hh}:${mm}`);
  }

  return d.toDate(); // Mongo lưu UTC
}

// 3) Dùng cho SERVER: build range from/to để query Mongo
export function buildRangeFromTo(from?: string, to?: string) {
  const range: { $gte?: Date; $lte?: Date } = {};

  if (from) {
    const ymdFrom = normalizeDateStr(from);
    range.$gte = dayjsLib.tz(ymdFrom, 'YYYY-MM-DD', APP_TZ).startOf('day').toDate();
  }

  if (to) {
    const ymdTo = normalizeDateStr(to);
    range.$lte = dayjsLib.tz(ymdTo, 'YYYY-MM-DD', APP_TZ).endOf('day').toDate();
  }

  return range;
}

// (tuỳ bạn) 5) Helper toYMD thống nhất timezone
export function toYMD(value: Dayjs | Date | string): string {
  return dayjsLib(value).tz(APP_TZ).format('YYYY-MM-DD');
}
