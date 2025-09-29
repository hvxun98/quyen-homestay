// src/app/api/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from 'lib/mongodb';
import Booking from 'models/Booking';
import Room from 'models/Room';
import { nextSeq } from 'lib/counter';

// ---- Helpers ---------------------------------------------------------------
type PayStatus = 'full' | 'deposit' | 'unpaid';
type OrderStatus = 'pending' | 'success' | 'cancelled';

function parseDateLocal(dateStr: string) {
  // nhận "YYYY-MM-DD" hoặc "dd/mm/yyyy"
  if (!dateStr) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split('-').map(Number);
    return { y, m, d };
  }
  const [d, m, y] = dateStr.split(/[\/\-\.]/).map(Number);
  return { y, m, d };
}

function combineLocal(dateStr: string, hour = 0, minute = 0) {
  const p = parseDateLocal(String(dateStr));
  if (!p) return new Date(NaN);
  // new Date(y, m-1, d, h, m) -> lưu theo local time server
  return new Date(p.y, p.m - 1, p.d, Number(hour) || 0, Number(minute) || 0, 0, 0);
}

// ---- GET /api/bookings -----------------------------------------------------
/**
 * Query:
 * - houseId?: string
 * - q?: string (search customerName)
 * - status?: pending|success|cancelled
 * - from?: YYYY-MM-DD
 * - to?:   YYYY-MM-DD
 * - dateField?: createdAt|checkIn|checkOut (default: createdAt)
 * - page?: number (1-based)  | pageSize?: number (<=100)
 * - sort?: mongo sort string, vd: -createdAt (default)
 */
export async function GET(req: NextRequest) {
  await dbConnect();
  const url = new URL(req.url);

  const houseId = url.searchParams.get('houseId') || undefined;
  const q = url.searchParams.get('q') || undefined;
  const status = (url.searchParams.get('status') as OrderStatus | null) || undefined;
  const from = url.searchParams.get('from') || undefined;
  const to = url.searchParams.get('to') || undefined;
  const dateField = (url.searchParams.get('dateField') || 'createdAt') as 'createdAt' | 'checkIn' | 'checkOut';
  const page = Math.max(parseInt(url.searchParams.get('page') || '1', 10), 1);
  const pageSize = Math.min(Math.max(parseInt(url.searchParams.get('pageSize') || '10', 10), 1), 100);
  const sort = url.searchParams.get('sort') || '-createdAt';

  const filter: any = {};
  if (houseId) filter.houseId = houseId;
  if (q) filter.customerName = { $regex: q, $options: 'i' };
  if (status) filter.status = status;

  if (from || to) {
    const range: any = {};
    if (from) {
      const p = parseDateLocal(from)!;
      range.$gte = new Date(p.y, p.m - 1, p.d, 0, 0, 0, 0);
    }
    if (to) {
      const p = parseDateLocal(to)!;
      range.$lte = new Date(p.y, p.m - 1, p.d, 23, 59, 59, 999);
    }
    filter[dateField] = range;
  }

  const [items, total] = await Promise.all([
    Booking.find(filter)
      .populate([{ path: 'roomId', select: 'name code' }])
      .sort(sort)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean({ virtuals: true }),
    Booking.countDocuments(filter)
  ]);

  const rows = items.map((b: any, idx: number) => {
    const obj = { ...b, id: String(b._id) };
    // loại bỏ trường nội bộ của Mongo để trả về gọn hơn
    delete (obj as any)._id;
    delete (obj as any).__v;
    // giữ thứ tự/stt nếu cần cho UI
    (obj as any).stt = (page - 1) * pageSize + idx + 1;
    return obj;
  });

  return NextResponse.json({
    data: rows,
    meta: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      sort,
      filters: { houseId, q, status, from, to, dateField }
    }
  });
}

// ---- POST /api/bookings ----------------------------------------------------
/**
 * Body (từ form):
 * {
 *   roomId: string,
 *   customerName: string, customerPhone?: string,
 *   checkInDate: "dd/mm/yyyy" | "YYYY-MM-DD", checkInHour: number, checkInMinute: number,
 *   checkOutDate: string,                      checkOutHour: number, checkOutMinute: number,
 *   price: number,
 *   source?: string,
 *   paymentStatus?: 'full'|'deposit'|'unpaid',
 *   note?: string
 * }
 */
export async function POST(req: NextRequest) {
  await dbConnect();
  const body = await req.json();

  const required = ['roomId', 'customerName', 'checkInDate', 'checkOutDate'] as const;
  for (const k of required) {
    if (body[k] == null || body[k] === '') {
      return NextResponse.json({ error: `Missing field: ${k}` }, { status: 400 });
    }
  }

  // tìm room để lấy houseId
  const room = await Room.findOne({ _id: body.roomId }).lean();
  if (!room) {
    return NextResponse.json({ error: 'Room not found' }, { status: 400 });
  }

  const checkIn = combineLocal(body.checkInDate, body.checkInHour ?? 0, body.checkInMinute ?? 0);
  const checkOut = combineLocal(body.checkOutDate, body.checkOutHour ?? 0, body.checkOutMinute ?? 0);
  if (!(checkOut > checkIn)) {
    return NextResponse.json({ error: 'Thời gian checkout phải sau checkin' }, { status: 400 });
  }

  // trùng lịch?
  const overlapping = await Booking.exists({
    roomId: body.roomId,
    status: { $ne: 'cancelled' },
    checkIn: { $lt: checkOut },
    checkOut: { $gt: checkIn }
  });
  if (overlapping) {
    return NextResponse.json({ error: 'Khoảng thời gian chồng chéo với đặt phòng hiện có' }, { status: 409 });
  }

  // sinh mã đơn
  const n = await nextSeq('booking');
  const orderCode = `OD_${String(n).padStart(4, '0')}`;

  // tạo đơn, lấy houseId từ room
  const doc = await Booking.create({
    orderCode,
    houseId: (room as any).houseId,
    roomId: body.roomId,
    customerName: body.customerName,
    customerPhone: body.customerPhone ?? undefined,
    checkIn,
    checkOut,
    price: Number(body.price ?? 0),
    status: 'pending' as OrderStatus,
    source: body.source ?? undefined,
    paymentStatus: (body.paymentStatus as PayStatus) ?? 'unpaid',
    note: body.note ?? undefined
  });

  // trả về có virtuals
  return NextResponse.json(doc.toJSON({ virtuals: true }), { status: 201 });
}
