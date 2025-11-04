// app/api/rooms/availability/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from 'lib/mongodb';
import { Types, isValidObjectId } from 'mongoose';
import Room from 'models/Room';
import Booking from 'models/Booking';
import House from 'models/House';
import { syncBookingAndRoomStatus } from 'services/bookingStatusUpdater';

export const dynamic = 'force-dynamic';

type Body = {
  checkIn: string; // ISO
  checkOut: string; // ISO
  houseId?: string; // optional
};

export async function POST(req: NextRequest) {
  await dbConnect();
  await syncBookingAndRoomStatus();
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { checkIn, checkOut, houseId } = body || {};
  if (!checkIn || !checkOut) {
    return NextResponse.json({ error: "Fields 'checkIn' and 'checkOut' are required (ISO)" }, { status: 422 });
  }

  const start = new Date(checkIn);
  const end = new Date(checkOut);
  if (!(start < end)) {
    return NextResponse.json({ error: "'checkIn' must be earlier than 'checkOut'" }, { status: 422 });
  }

  // Điều kiện overlap (half-open):
  // booking.checkIn < checkOut  &&  booking.checkOut > checkIn
  const bookingMatch: any = {
    status: { $ne: 'cancelled' },
    checkIn: { $lt: end },
    checkOut: { $gt: start }
  };

  const roomMatch: any = {};
  if (houseId) {
    if (!isValidObjectId(houseId)) {
      return NextResponse.json({ error: 'Invalid houseId' }, { status: 422 });
    }
    const houseOid = new Types.ObjectId(houseId);
    // nếu Booking có houseId, filter để giảm phạm vi
    bookingMatch.houseId = houseOid;
    roomMatch.houseId = houseOid;
  }

  try {
    // 1) Tìm các roomId có booking chồng lấn
    const overlappedIds = await Booking.distinct('roomId', bookingMatch); // ObjectId[]

    // 2) Lấy các phòng KHÔNG trùng booking -> TRỐNG trong khoảng yêu cầu
    if (overlappedIds.length) {
      roomMatch._id = { $nin: overlappedIds as Types.ObjectId[] };
    }

    const rooms = await Room.find(roomMatch).select('_id houseId code codeNorm name type status isDirty').sort({ code: 1 }).lean();

    // 3) Gom theo houseId, trả đúng format cũ
    const byHouseId = new Map<string, { house: { _id: string; code: string; address: string }; rooms: any[] }>();

    // lấy thông tin house (code, address)
    const houseIds = Array.from(new Set(rooms.map((r) => String(r.houseId))));
    const houses = houseIds.length
      ? await House.find({ _id: { $in: houseIds.map((id) => new Types.ObjectId(id)) } })
          .select('_id code address')
          .lean()
      : [];

    const houseMap = new Map(houses.map((h) => [String(h._id), h]));

    for (const r of rooms) {
      const key = String(r.houseId);
      if (!byHouseId.has(key)) {
        const h = houseMap.get(key);
        byHouseId.set(key, {
          house: h ? { _id: String(h._id), code: h.code || '', address: h.address || '' } : { _id: key, code: '', address: '' },
          rooms: []
        });
      }
      byHouseId.get(key)!.rooms.push({
        _id: r._id,
        code: r.code,
        codeNorm: r.codeNorm,
        name: r.name,
        type: r.type,
        status: r.status, // trạng thái "hiện tại" để hiển thị, không dùng để check tương lai
        isDirty: !!r.isDirty // chỉ trả kèm, không ảnh hưởng kết quả availability
      });
    }

    const result = Array.from(byHouseId.values());

    // ✅ Trả đúng cấu trúc cũ (một mảng các { house, rooms })
    return NextResponse.json({ data: result }, { status: 200 });
  } catch (e: any) {
    console.error('availability POST error:', e);
    return NextResponse.json({ error: 'Failed to check availability' }, { status: 500 });
  }
}
