import { fetcher } from 'utils/axios';

export const getMonthlySummary = async (params: { year: number; month: number; houseId?: string }) => {
  const qs = new URLSearchParams({
    year: String(params.year),
    month: String(params.month),
    ...(params.houseId ? { houseId: params.houseId } : {})
  }).toString();
  return await fetcher(`/api/reports/finance/monthly?${qs}`);
};

export const getMonthlyRoomRevenue = async (params: { year: number; month: number; houseId?: string }) => {
  const qs = new URLSearchParams({
    year: String(params.year),
    month: String(params.month),
    ...(params.houseId ? { houseId: params.houseId } : {})
  }).toString();
  return await fetcher(`/api/reports/finance/monthly/rooms?${qs}`);
};
