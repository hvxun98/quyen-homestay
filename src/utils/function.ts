import dayjs from 'dayjs';

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

export function splitToForm(dt: string | Date) {
  const d = dayjs(dt);
  return { date: d, hour: d.hour(), minute: d.minute() };
}
