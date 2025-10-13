// dùng axios fetcher của bạn
import { fetcherPost, fetcher, fetcherPut } from 'utils/axios';

export const createBooking = (payload: any) => {
  return fetcherPost('/api/bookings', payload);
};

export const updateBooking = async (id: string, payload: any) => {
  return await fetcherPut(`/api/bookings/${id}`, payload);
};

export const getBookings = (params: {
  houseId?: string;
  q?: string;
  from?: string;
  to?: string;
  dateField?: 'createdAt' | 'checkIn' | 'checkOut';
  pageNum?: number;
  pageSize?: number;
  sort?: string;
}) => {
  const { houseId, q, from, to, dateField = 'createdAt', pageNum = 1, pageSize = 10, sort = '-createdAt' } = params || {};

  const qs = new URLSearchParams();
  if (houseId) qs.set('houseId', houseId);
  if (q) qs.set('q', q);
  if (from) qs.set('from', from);
  if (to) qs.set('to', to);
  qs.set('dateField', dateField);
  qs.set('page', String(pageNum));
  qs.set('pageSize', String(pageSize));
  qs.set('sort', sort);

  return fetcher(`/api/bookings?${qs.toString()}`);
};

export const getBookingTree = (params?: { from?: string; to?: string; status?: string }) => {
  const qs = new URLSearchParams();
  if (params?.from) qs.set('from', params.from);
  if (params?.to) qs.set('to', params.to);
  if (params?.status) qs.set('status', params.status);

  const url = qs.toString() ? `/api/bookings/bookings-tree?${qs.toString()}` : '/api/bookings/bookings-tree';
  return fetcher(url);
};

export const getBookingDetail = async (id: string) => {
  return await fetcher(`/api/bookings/${id}`);
};
