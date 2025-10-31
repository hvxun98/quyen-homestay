import dayjs from 'dayjs';
import Booking from 'models/Booking';
import Room from 'models/Room';

/**
 * Đồng bộ trạng thái phòng dựa theo booking hiện tại
 * - Nếu phòng chưa checkout → booked / occupied
 * - Nếu không còn booking nào → available
 * - Giữ lại trạng thái "dirty" nếu đã được đánh dấu trước đó
 * - Khi booking quá checkout → loại bỏ booked/occupied cũ và set available (nếu không có booking khác)
 */
export async function syncBookingAndRoomStatus() {
  const now = dayjs();

  // Lấy toàn bộ phòng
  const rooms = await Room.find({}).lean();

  // Map roomId -> Set(status) hiện tại (để giữ lại 'dirty' nếu có)
  const currentStatusesByRoom = new Map<string, Set<string>>();
  for (const r of rooms) {
    currentStatusesByRoom.set(String(r._id), new Set<string>((r.status as string[]) ?? []));
  }

  // Booking còn hiệu lực (không bị hủy & chưa qua checkout)
  const activeBookings = await Booking.find({
    status: { $ne: 'cancelled' },
    checkOut: { $gte: now.toDate() }
  })
    .select('roomId checkIn checkOut')
    .lean();

  // Gom cờ trạng thái theo từng room: có current (occupied) hay future (booked)
  const flagsByRoom = new Map<string, { hasCurrent: boolean; hasFuture: boolean }>();

  for (const b of activeBookings) {
    if (!b.roomId) continue;
    const rid = String(b.roomId);
    const flags = flagsByRoom.get(rid) ?? { hasCurrent: false, hasFuture: false };

    const checkIn = dayjs(b.checkIn);
    const checkOut = dayjs(b.checkOut);

    if (now.isSame(checkIn) || (now.isAfter(checkIn) && now.isBefore(checkOut))) {
      // checkIn <= now < checkOut
      flags.hasCurrent = true;
    } else if (now.isBefore(checkIn)) {
      // now < checkIn
      flags.hasFuture = true;
    }
    flagsByRoom.set(rid, flags);
  }

  // Tính trạng thái mới và cập nhật
  for (const r of rooms) {
    const rid = String(r._id);
    const prev = currentStatusesByRoom.get(rid) ?? new Set<string>();
    const keepDirty = prev.has('dirty');

    const flags = flagsByRoom.get(rid) ?? { hasCurrent: false, hasFuture: false };

    // Xây mảng status mới: chỉ giữ 'dirty' từ trước, còn lại dựa trên booking còn hiệu lực
    const next = new Set<string>();

    if (flags.hasCurrent) {
      next.add('occupied'); // ưu tiên occupied
    } else if (flags.hasFuture) {
      next.add('booked');
    } else {
      // Không còn booking hiệu lực → available
      next.add('available');
    }

    if (keepDirty) next.add('dirty');

    // Cập nhật vào DB (đồng thời loại bỏ các trạng thái booked/occupied cũ nếu đã qua checkout)
    await Room.findByIdAndUpdate(rid, { status: Array.from(next) });
  }

  console.log(`[syncBookingAndRoomStatus] Đồng bộ hoàn tất lúc ${now.format('HH:mm:ss')}`);
}
