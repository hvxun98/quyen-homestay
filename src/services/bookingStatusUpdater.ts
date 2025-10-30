import dayjs from 'dayjs';
import Booking from 'models/Booking';
import Room from 'models/Room';

/**
 * Đồng bộ trạng thái phòng dựa theo booking hiện tại
 * - Nếu phòng chưa checkout → booked / occupied
 * - Nếu không còn booking nào → available
 * - Giữ lại trạng thái "dirty" nếu đã được đánh dấu trước đó
 */
export async function syncBookingAndRoomStatus() {
  const now = dayjs();

  // Lấy toàn bộ phòng để reset trạng thái ban đầu
  const rooms = await Room.find({});
  const roomMap = new Map<string, Set<string>>();

  rooms.forEach((r) => {
    const statuses = new Set<string>((r.status as string[]) ?? []);
    roomMap.set(r._id.toString(), statuses);
  });

  // Lấy các booking còn hiệu lực (chưa quá checkout, không hủy)
  const activeBookings = await Booking.find({
    status: { $ne: 'cancelled' },
    checkOut: { $gte: now.toDate() }
  }).lean();

  // Gắn trạng thái booked / occupied cho phòng tương ứng
  for (const booking of activeBookings) {
    if (!booking.roomId) continue;
    const roomId = booking.roomId.toString();
    const statuses = roomMap.get(roomId) ?? new Set<string>();

    if (now.isBefore(booking.checkIn)) {
      statuses.add('booked');
    } else if (now.isAfter(booking.checkIn) && now.isBefore(booking.checkOut)) {
      statuses.add('occupied');
    }

    roomMap.set(roomId, statuses);
  }

  // Cập nhật lại từng phòng
  for (const [roomId, statuses] of roomMap.entries()) {
    const room = rooms.find((r) => r._id.toString() === roomId);
    const currentStatuses = new Set<string>((room?.status as string[]) ?? []);

    // Giữ lại dirty nếu đang có
    if (currentStatuses.has('dirty')) statuses.add('dirty');

    // Nếu không có booked hoặc occupied thì là available
    const active = [...statuses].some((s) => ['booked', 'occupied'].includes(s));
    if (!active) statuses.add('available');

    await Room.findByIdAndUpdate(roomId, { status: Array.from(statuses) });
  }

  console.log(`[syncBookingAndRoomStatus] Đồng bộ hoàn tất lúc ${now.format('HH:mm:ss')}`);
}
