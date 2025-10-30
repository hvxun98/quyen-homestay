import { NextResponse } from 'next/server';
import Room from 'models/Room';
import Booking from 'models/Booking';
import House from 'models/House';
import { dbConnect } from 'lib/mongodb';
import { syncBookingAndRoomStatus } from 'services/bookingStatusUpdater';

function toDate(v: any) {
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) throw new Error('Định dạng ngày/giờ không hợp lệ.');
  return d;
}

/**
 * POST /api/rooms/available
 * body:
 * {
 *   checkIn: "2025-09-28T08:00:00.000Z",
 *   checkOut: "2025-09-29T03:00:00.000Z",
 *   houseId?: "..." // tùy chọn
 * }
 *
 * Trả về:
 * {
 *   ok: true,
 *   meta: {...},
 *   data: [
 *     { house: { _id, code, address }, rooms: [ {_id, code, codeNorm, name, type, status}, ... ] },
 *     ...
 *   ]
 * }
 */
export async function POST(req: Request) {
  try {
    await dbConnect();
    await syncBookingAndRoomStatus();
    const { houseId, checkIn, checkOut } = await req.json();

    // Có thể chỉ validate tối thiểu ở BE; FE đã validate bằng Formik
    if (!checkIn || !checkOut) {
      return NextResponse.json({ ok: false, error: 'Thiếu tham số: checkIn, checkOut.' }, { status: 400 });
    }

    const ci = toDate(checkIn);
    const co = toDate(checkOut);
    if (co <= ci) {
      return NextResponse.json({ ok: false, error: 'Thời gian trả phòng phải sau thời gian nhận phòng.' }, { status: 400 });
    }

    // 1) Các booking trùng khoảng [ci, co)
    const bookingFilter: any = {
      status: { $ne: 'cancelled' },
      checkIn: { $lt: co },
      checkOut: { $gt: ci }
    };
    if (houseId) bookingFilter.houseId = houseId;

    const overlapping = await Booking.find(bookingFilter).select('roomId').lean();
    const occupiedIds = new Set(overlapping.map((b) => String(b.roomId)));

    // 2) Lấy phòng 'available' & không thuộc occupiedIds
    const roomFilter: any = {
      status: 'available',
      _id: { $nin: Array.from(occupiedIds) }
    };
    if (houseId) roomFilter.houseId = houseId;

    const rooms = await Room.find(roomFilter)
      .select('_id houseId code codeNorm name type status')
      .sort({ codeNorm: 1, name: 1 })
      .populate({ path: 'houseId', model: House, select: '_id code address' })
      .lean();

    // 3) Group theo house
    const map = new Map<string, { house: any; rooms: any[] }>();
    for (const r of rooms as any[]) {
      const h = r.houseId; // đã populate
      const key = String(h?._id || r.houseId);
      if (!map.has(key)) {
        map.set(key, {
          house: h ? { _id: String(h._id), code: h.code, address: h.address } : { _id: key, code: '', address: '' },
          rooms: []
        });
      }
      map.get(key)!.rooms.push({
        _id: String(r._id),
        code: r.code,
        codeNorm: r.codeNorm,
        name: r.name,
        type: r.type, // 'Standard' | 'VIP'
        status: r.status // 'available'
      });
    }

    const data = Array.from(map.values());

    return NextResponse.json({
      ok: true,
      meta: {
        houseId: houseId || null,
        checkIn: ci.toISOString(),
        checkOut: co.toISOString(),
        groups: data.length,
        totalRooms: rooms.length
      },
      data
    });
  } catch (err: any) {
    const msg = err?.message || 'Lỗi hệ thống. Vui lòng thử lại sau.';
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
