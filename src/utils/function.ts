import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const APP_TZ = 'Asia/Bangkok';

export const objectToQueryString = (obj: any) => {
  const parts = [];
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      if (value !== null && value !== undefined) {
        parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
      }
    }
  }
  return parts.join('&');
};

export function splitToForm(dt?: string | Date) {
  const d = dt ? dayjs(dt).tz(APP_TZ) : dayjs().tz(APP_TZ);
  return { date: d, hour: d.hour(), minute: d.minute() };
}
