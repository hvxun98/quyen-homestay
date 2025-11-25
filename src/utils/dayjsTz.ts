// utils/dayjsTz.ts
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export const APP_TZ = 'Asia/Bangkok'; // múi giờ chuẩn của app
export default dayjs;
