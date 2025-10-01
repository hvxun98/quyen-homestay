// models/RoomStatus.ts
export type RoomStatus = 'available' | 'booked' | 'occupied' | 'dirty';

export const VN_STATUS_LABEL: Record<RoomStatus, string> = {
  available: 'Trống',
  booked: 'Đã đặt',
  occupied: 'Đang ở',
  dirty: 'Bẩn'
};
