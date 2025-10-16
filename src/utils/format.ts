import { Dayjs } from 'dayjs';

export const toVND = (val: string | number) => new Intl.NumberFormat('vi-VN').format(Number(val || 0));
export const onlyDigits = (s: string) => s.replace(/\D/g, '');
export const toYMD = (d: Dayjs | null) => (d ? d.format('YYYY-MM-DD') : '');
