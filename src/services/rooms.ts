// services/rooms.ts
import { fetcher, fetcherPost, fetcherPut, fetcherDelete } from 'utils/axios';

export type AvailabilityPayload = {
  houseId: string;
  checkIn: string; // ISO string: 2025-09-28T08:00:00.000Z
  checkOut: string; // ISO string
};

export const getRooms = async (params: { pageNum: number; pageSize: number; houseId?: string; q?: string }) => {
  const qs = new URLSearchParams({
    page: String(params.pageNum),
    size: String(params.pageSize),
    ...(params.houseId ? { houseId: params.houseId } : {}),
    ...(params.q ? { q: params.q } : {})
  }).toString();
  return await fetcher(`/api/rooms?${qs}`);
};

export const createRoom = async (payload: any) => await fetcherPost('/api/rooms', payload);
export const updateRoom = async (id: string, payload: any) => await fetcherPut(`/api/rooms/${id}`, payload);
export const deleteRoom = async (id: string) => await fetcherDelete(`/api/rooms/${id}`);

export const getRoomOptions = (houseId?: string) => {
  const qs = houseId ? `?houseId=${encodeURIComponent(houseId)}` : '';
  return fetcher(`/api/rooms/options${qs}`);
};

export const checkAvailableRooms = async (payload: AvailabilityPayload) => {
  return await fetcherPost('/api/rooms/available', payload);
};
