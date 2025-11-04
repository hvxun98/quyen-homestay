// services/bookingStatusUpdater.ts
import Room from 'models/Room';
import Booking from 'models/Booking';

type RoomStatus = 'available' | 'booked' | 'occupied';

/**
 * Đồng bộ trạng thái phòng theo booking hiện tại.
 * - occupied: đang ở (checkIn <= now < checkOut)
 * - booked: không occupied nhưng có booking tương lai (checkIn > now)
 * - available: còn lại
 *
 * LƯU Ý:
 * - KHÔNG thay đổi isDirty ở đây (để housekeeping/luồng khác xử lý).
 * - Chỉ ghi DB nếu status thực sự thay đổi.
 *
 * @returns số phòng đã cập nhật
 */
export async function syncBookingAndRoomStatus(now: Date = new Date()): Promise<number> {
  // 1) Lấy tất cả phòng với _id + status hiện tại
  const rooms = await Room.find({}, { _id: 1, status: 1 }).lean();

  // 2) Tập phòng đang occupied (hiện tại đang lưu trú)
  const occupiedBookings = await Booking.find(
    {
      status: { $ne: 'cancelled' },
      checkIn: { $lte: now },
      checkOut: { $gt: now } // now < checkOut
    },
    { roomId: 1 }
  ).lean();

  // 3) Tập phòng có booking tương lai (không tính đã hủy)
  const futureBookings = await Booking.find(
    {
      status: { $ne: 'cancelled' },
      checkIn: { $gt: now }
    },
    { roomId: 1 }
  ).lean();

  const occupiedSet = new Set<string>(occupiedBookings.map((b: any) => String(b.roomId)).filter(Boolean));
  const futureSet = new Set<string>(futureBookings.map((b: any) => String(b.roomId)).filter(Boolean));

  // 4) Tính trạng thái mới cho từng phòng và gom các update thay đổi
  const bulkOps: any[] = [];

  for (const r of rooms) {
    const id = String(r._id);
    let newStatus: RoomStatus = 'available';

    if (occupiedSet.has(id)) newStatus = 'occupied';
    else if (futureSet.has(id)) newStatus = 'booked';
    else newStatus = 'available';

    if (r.status !== newStatus) {
      bulkOps.push({
        updateOne: {
          filter: { _id: r._id },
          update: { $set: { status: newStatus } } // ❗ KHÔNG chạm isDirty
        }
      });
    }
  }

  if (!bulkOps.length) return 0;

  const res = await Room.bulkWrite(bulkOps, { ordered: false });
  // modifiedCount có thể khác matchedCount; ưu tiên lấy nModified-like
  const updated =
    // @ts-ignore for compatibility across mongoose/mongo types
    res.modifiedCount ?? res.nModified ?? res.result?.nModified ?? 0;

  return updated;
}
