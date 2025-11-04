import { fetcher } from 'utils/axios';

// services/dashboard.ts
export type Basis = 'checkIn' | 'createdAt';

export type DailyDashboardRes = {
  date: string;
  revenue: {
    total: number;
    byChannel: {
      facebookAds: number;
      zalo: number;
      dayLaDau: number;
      airbnb: number;
      booking: number;
      senstay: number;
      congTacVien: number;
    };
    byPaymentStatus?: { full: number; deposit: number; unpaid: number };
    basis: Basis;
    policy: string;
  };
  occupancy: {
    rate: number; // 0..1 (đã tính sẵn từ API)
    booked: number;
    available: number;
    totalRooms: number;
  };
};

// GET /api/dashboard/daily?date=YYYY-MM-DD&basis=checkIn
export async function getDailyDashboard(date: string, basis: Basis = 'checkIn') {
  const q = new URLSearchParams({ date, basis }).toString();
  return (await fetcher(`/api/dashboard/daily?${q}`)) as DailyDashboardRes;
}
