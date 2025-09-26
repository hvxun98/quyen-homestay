import { NextResponse } from 'next/server';
import { dbConnect } from 'lib/mongodb';
import Room from 'models/Room';
import Booking from 'models/Booking';

// helper: parse ISO or number to Date
function toDate(v: any) {
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) throw new Error('INVALID_DATE');
  return d;
}

/**
 * POST /api/rooms/available
 * body:
 * {
 *   houseId: "ObjectId",
 *   checkIn: "2025-09-28T15:00:00.000Z",   // ISO string
 *   checkOut: "2025-09-29T03:00:00.000Z"   // ISO string
 * }
 *
 * Quy ước key theo models của bạn:
 * - Room: { _id, houseId, code, codeNorm, name, type, status }
 * - Booking: { _id, orderCode, orderCodeNorm, houseId, roomId, checkIn, checkOut, status }
 *   (status: 'pending' | 'success' | 'cancelled')
 */
export async function POST(req: Request) {
  try {
    await dbConnect();

    const { houseId, checkIn, checkOut } = await req.json();

    if (!houseId || !checkIn || !checkOut) {
      return NextResponse.json({ ok: false, error: 'Thiếu tham số: houseId, checkIn, checkOut.' }, { status: 400 });
    }

    const ci = toDate(checkIn);
    const co = toDate(checkOut);
    if (co <= ci) {
      return NextResponse.json({ ok: false, error: 'Thời gian trả phòng phải sau thời gian nhận phòng.' }, { status: 400 });
    }

    // 1) Tìm các booking overlap với khoảng [ci, co)
    // Điều kiện overlap: (booking.checkIn < co) && (booking.checkOut > ci)
    const overlapping = await Booking.find({
      houseId,
      status: { $ne: 'cancelled' },
      checkIn: { $lt: co },
      checkOut: { $gt: ci }
    })
      .select('roomId')
      .lean();

    const occupiedRoomIds = Array.from(new Set(overlapping.map((b) => String(b.roomId))));

    // 2) Lấy tất cả phòng thuộc house, loại trừ phòng đang bị chiếm
    // Trạng thái phòng: loại 'inactive' và 'maintenance' khỏi kết quả (nếu bạn muốn show vẫn có thể đổi ở filter)
    const rooms = await Room.find({
      houseId,
      status: { $nin: ['inactive', 'maintenance'] },
      _id: { $nin: occupiedRoomIds }
    })
      .select('_id houseId code codeNorm name type status')
      .sort({ codeNorm: 1, name: 1 })
      .lean();

    return NextResponse.json({
      ok: true,
      meta: {
        houseId,
        checkIn: ci.toISOString(),
        checkOut: co.toISOString(),
        totalAvailable: rooms.length
      },
      data: rooms.map((r) => ({
        _id: String(r._id),
        code: r.code,
        codeNorm: r.codeNorm,
        name: r.name,
        type: r.type, // 'Standard' | 'VIP'
        status: r.status // vd 'available'
      }))
    });
  } catch (err: any) {
    const msg = err?.message || 'Lỗi hệ thống. Vui lòng thử lại sau.';
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
