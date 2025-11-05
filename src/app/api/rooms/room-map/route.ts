import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from 'lib/mongodb';
import { isValidObjectId, Types } from 'mongoose';
import Room from 'models/Room';
import House from 'models/House';
import Booking from 'models/Booking';
import { syncBookingAndRoomStatus } from 'services/bookingStatusUpdater';
export const runtime = 'nodejs';

export const dynamic = 'force-dynamic';

const ROOM_STATUS = ['available', 'booked', 'occupied'] as const;
type RoomStatus = (typeof ROOM_STATUS)[number];

function parseCSV(q?: string | null) {
  if (!q) return [];
  return q
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}
function parseIsDirtyParam(v: string | null): boolean | undefined {
  if (v == null) return undefined;
  const x = v.toLowerCase();
  if (x === '1' || x === 'true') return true;
  if (x === '0' || x === 'false') return false;
  return undefined;
}
function normalizeStatusParam(v: string | null): RoomStatus | undefined {
  if (!v) return undefined;
  const s = v.toLowerCase();
  return (ROOM_STATUS as readonly string[]).includes(s) ? (s as RoomStatus) : undefined;
}

export async function GET(req: NextRequest) {
  await dbConnect();
  try {
    await syncBookingAndRoomStatus();
  } catch {}

  const { searchParams } = new URL(req.url);

  // --- Params ---
  const houseIdsCSV = parseCSV(searchParams.get('houseIds')); // (giữ nếu bạn đang dùng)
  const statusParam = normalizeStatusParam(searchParams.get('status')); // <-- chỉ 1 status
  const isDirtyParam = parseIsDirtyParam(searchParams.get('isDirty'));

  // --- Filter ---
  const filter: any = {};

  if (houseIdsCSV.length) {
    const ids = houseIdsCSV.filter(isValidObjectId).map((id) => new Types.ObjectId(id));
    if (ids.length) filter.houseId = { $in: ids };
  }

  // chỉ 1 status duy nhất
  if (searchParams.has('status') && !statusParam) {
    return NextResponse.json({ error: 'Invalid status. Use available|booked|occupied' }, { status: 422 });
  }
  if (statusParam) {
    filter.status = statusParam; // string
  }

  if (typeof isDirtyParam === 'boolean') {
    filter.isDirty = isDirtyParam; // boolean
  }

  // --- Active bookings (nếu cần hiện kèm trên phòng booked/occupied) ---
  const now = new Date();
  const activeBookings = await Booking.find({
    status: { $ne: 'cancelled' },
    checkOut: { $gte: now }
  })
    .select('roomId customerName checkIn checkOut')
    .lean();
  const bookingByRoom = new Map<string, any>();
  for (const b of activeBookings) bookingByRoom.set(String(b.roomId), b);

  // --- Lấy rooms ---
  const rooms = await Room.find(filter).select('_id houseId code codeNorm name type status isDirty').lean();

  // --- Lấy houses để gắn tên ---
  const houseIds = Array.from(new Set(rooms.map((r) => String(r.houseId))));
  const houses = await House.find({ _id: { $in: houseIds } })
    .select('_id name code address')
    .lean();
  const houseDict = new Map(houses.map((h) => [String(h._id), h]));

  // --- Gom nhóm + thống kê ---
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
      status: RoomStatus; // string
      isDirty: boolean; // boolean
      booking?: { customerName: string; checkIn: string; checkOut: string };
    }>;
  };

  const buckets = new Map<string, Bucket>();
  const summary = { total: 0, available: 0, booked: 0, occupied: 0, dirty: 0 };
  const inc = (obj: any, key: string) => (obj[key] = (obj[key] || 0) + 1);

  for (const r of rooms) {
    const hid = String(r.houseId);
    if (!buckets.has(hid)) {
      const h = houseDict.get(hid);
      buckets.set(hid, {
        houseId: hid,
        houseName: h?.name || 'Unknown',
        houseCode: h?.code,
        address: h?.address,
        count: 0,
        countsByStatus: { available: 0, booked: 0, occupied: 0, dirty: 0 },
        rooms: []
      });
    }
    const b = buckets.get(hid)!;

    const status = (r.status as RoomStatus) ?? 'available';
    const isDirty = !!r.isDirty;

    const roomData: any = {
      _id: r._id,
      code: r.code,
      name: r.name,
      type: r.type,
      status,
      isDirty
    };

    if (status === 'booked' || status === 'occupied') {
      const bk = bookingByRoom.get(String(r._id));
      if (bk) {
        roomData.booking = {
          customerName: bk.customerName,
          checkIn: bk.checkIn,
          checkOut: bk.checkOut
        };
      }
    }

    b.rooms.push(roomData);
    b.count += 1;

    inc(b.countsByStatus, status);
    inc(summary, status);
    if (isDirty) {
      inc(b.countsByStatus, 'dirty');
      inc(summary, 'dirty');
    }
    summary.total += 1;
  }

  // sort phòng: số trong code trước, rồi alpha
  const housesArr = Array.from(buckets.values()).map((b) => ({
    ...b,
    rooms: b.rooms.sort((r1, r2) => {
      const n1 = parseInt((r1.code || '').match(/\d+/)?.[0] || '0', 10);
      const n2 = parseInt((r2.code || '').match(/\d+/)?.[0] || '0', 10);
      if (n1 !== n2) return n1 - n2;
      return (r1.code || '').localeCompare(r2.code || '');
    })
  }));

  return NextResponse.json({ summary, houses: housesArr }, { status: 200 });
}
