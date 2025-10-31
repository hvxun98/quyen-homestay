import { NextRequest, NextResponse } from 'next/server';
import Room from 'models/Room';
import House from 'models/House';
import Booking from 'models/Booking';
import { Types } from 'mongoose';
import { dbConnect } from 'lib/mongodb';
import { syncBookingAndRoomStatus } from 'services/bookingStatusUpdater';

function parseCSV(q?: string | null) {
  if (!q) return [];
  return q
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function GET(req: NextRequest) {
  await dbConnect();

  try {
    // Đồng bộ booking ↔ room.status (nếu bạn đang dùng cơ chế này)
    await syncBookingAndRoomStatus();

    const { searchParams } = new URL(req.url);
    const statusParam = parseCSV(searchParams.get('status')); // available, booked, occupied, dirty (CSV)
    const houseIdsParam = parseCSV(searchParams.get('houseIds')); // house ids (CSV)

    // --- Lấy toàn bộ booking đang hoạt động ---
    const now = new Date();
    const activeBookings = await Booking.find({
      status: { $ne: 'cancelled' },
      checkOut: { $gte: now }
    })
      .select('roomId customerName checkIn checkOut')
      .lean();

    const bookingByRoom = new Map<string, any>();
    for (const b of activeBookings) {
      bookingByRoom.set(String(b.roomId), b);
    }

    // --- Query phòng ---
    const filter: any = {};

    // houseIds
    if (houseIdsParam.length) {
      filter.houseId = { $in: houseIdsParam.map((id) => new Types.ObjectId(id)) };
    }

    // status
    if (statusParam.length) {
      // Xây từng điều kiện theo từng status, rồi OR lại
      const orConds: any[] = [];

      for (const s of statusParam) {
        const sv = s.toLowerCase();
        if (sv === 'available') {
          // có available và không có booked/occupied
          orConds.push({
            $and: [{ status: 'available' }, { status: { $nin: ['booked', 'occupied'] } }]
          });
        } else if (['booked', 'occupied', 'dirty'].includes(sv)) {
          // mảng status chứa phần tử sv
          orConds.push({ status: sv });
        }
      }

      if (orConds.length === 1) {
        Object.assign(filter, orConds[0]); // dùng trực tiếp thay vì $or cho gọn
      } else if (orConds.length > 1) {
        filter.$or = orConds;
      }
      // nếu statusParam có giá trị không hợp lệ thì sẽ không thêm điều kiện gì
    }

    const rooms = await Room.find(filter).select('_id houseId code codeNorm name type status').lean();

    // --- Lấy thông tin nhà ---
    const houseIds = Array.from(new Set(rooms.map((r) => String(r.houseId))));
    const houses = await House.find({ _id: { $in: houseIds } })
      .select('_id name code address')
      .lean();

    const houseDict = new Map(houses.map((h) => [String(h._id), h]));

    // --- Gom nhóm theo house ---
    type Bucket = {
      houseId: string;
      houseName: string;
      houseCode?: string;
      address?: string;
      count: number;
      countsByStatus: Record<'available' | 'booked' | 'occupied' | 'dirty', number>;
      rooms: Array<{
        _id: any;
        code: string;
        name: string;
        type: string;
        status: ('available' | 'booked' | 'occupied' | 'dirty')[]; // <-- đổi sang mảng
        booking?: {
          customerName: string;
          checkIn: string;
          checkOut: string;
        };
      }>;
    };

    const buckets = new Map<string, Bucket>();
    const summary = { total: 0, available: 0, booked: 0, occupied: 0, dirty: 0 } as {
      total: number;
      available: number;
      booked: number;
      occupied: number;
      dirty: number;
    };
    const inc = (obj: any, key: string) => (obj[key] = (obj[key] || 0) + 1);

    for (const r of rooms) {
      const hid = String(r.houseId);
      if (!buckets.has(hid)) {
        const h = houseDict.get(hid);
        buckets.set(hid, {
          houseId: hid,
          houseName: (h as any)?.name || 'Unknown',
          houseCode: (h as any)?.code,
          address: (h as any)?.address,
          count: 0,
          countsByStatus: { available: 0, booked: 0, occupied: 0, dirty: 0 },
          rooms: []
        });
      }

      const b = buckets.get(hid)!;

      const statuses = Array.isArray(r.status) ? r.status : [r.status];

      // vẫn dùng displayStatus để đếm summary và countsByStatus
      const displayStatus: 'available' | 'booked' | 'occupied' | 'dirty' =
        (statuses.includes('occupied') && 'occupied') ||
        (statuses.includes('booked') && 'booked') ||
        (statuses.includes('dirty') && 'dirty') ||
        'available';

      // TRẢ status LÀ MẢNG GỐC
      const roomData: any = {
        _id: r._id,
        code: r.code,
        name: r.name,
        type: r.type,
        status: statuses // <-- đây
      };

      // Nếu đang ở/đã đặt => thêm thông tin booking
      if (displayStatus === 'occupied' || displayStatus === 'booked') {
        const booking = bookingByRoom.get(String(r._id));
        if (booking) {
          roomData.booking = {
            customerName: booking.customerName,
            checkIn: booking.checkIn,
            checkOut: booking.checkOut
          };
        }
      }

      b.rooms.push(roomData);
      b.count += 1;
      inc(b.countsByStatus, displayStatus);
      summary.total += 1;
      inc(summary, displayStatus);
    }

    // --- Sắp xếp nhà và phòng ---
    const housesArr = Array.from(buckets.values())
      .sort((a, b) => a.houseName.localeCompare(b.houseName))
      .map((h) => ({
        ...h,
        rooms: h.rooms.sort((r1, r2) => {
          const n1 = parseInt(r1.code.match(/\d+/)?.[0] || '0', 10);
          const n2 = parseInt(r2.code.match(/\d+/)?.[0] || '0', 10);
          if (n1 !== n2) return n1 - n2;
          return (r1.code || '').localeCompare(r2.code || '');
        })
      }));

    // === Giữ nguyên response data cũ ===
    return NextResponse.json({ summary, houses: housesArr }, { status: 200 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ message: err?.message || 'Internal error' }, { status: 500 });
  }
}
