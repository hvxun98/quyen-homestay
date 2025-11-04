// app/api/rooms/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from 'lib/mongodb';
import Room from 'models/Room';
import { isValidObjectId, Types } from 'mongoose';
import { nextRoomCode } from 'lib/roomCode';
import { syncBookingAndRoomStatus } from 'services/bookingStatusUpdater';

export const dynamic = 'force-dynamic'; // tránh cache GET khi dev
const ROOM_STATUS = ['available', 'booked', 'occupied'] as const;

// ===== Model mới: status là string, isDirty là boolean =====
type RoomStatus = 'available' | 'booked' | 'occupied';
const ALLOWED_STATUS: RoomStatus[] = ['available', 'booked', 'occupied'];

const normalizeStatus = (raw: unknown): RoomStatus => {
  const s = String(raw ?? 'available').toLowerCase();
  return (ROOM_STATUS as readonly string[]).includes(s) ? (s as RoomStatus) : 'available';
};

function parseDirtyParam(val: string | null): boolean | undefined {
  if (val == null) return undefined;
  const v = val.toLowerCase();
  if (v === '1' || v === 'true') return true;
  if (v === '0' || v === 'false') return false;
  return undefined;
}

// GET /api/rooms?page=1&size=10&houseId=...&q=...&type=...&status=available&dirty=1
export async function GET(req: NextRequest) {
  await dbConnect();
  await syncBookingAndRoomStatus();

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const size = Math.min(100, Math.max(1, parseInt(searchParams.get('size') || '10', 10)));
  const q = (searchParams.get('q') || '').trim();
  const type = searchParams.get('type') || undefined;
  const houseId = searchParams.get('houseId') || undefined;

  const statusParam = searchParams.get('status') as RoomStatus | null;
  const dirtyParam = parseDirtyParam(searchParams.get('dirty'));

  const filter: any = {};

  if (houseId) {
    if (!Types.ObjectId.isValid(houseId)) {
      return NextResponse.json({ error: 'Invalid houseId' }, { status: 400 });
    }
    filter.houseId = new Types.ObjectId(houseId);
  }

  if (q) {
    // logic cũ: tìm theo name/code/codeNorm
    filter.$or = [
      { name: { $regex: q, $options: 'i' } },
      { code: { $regex: q, $options: 'i' } },
      { codeNorm: { $regex: q.replace(/\s+/g, '_').toUpperCase(), $options: 'i' } }
    ];
  }

  if (type) {
    filter.type = type; // 'Standard' | 'VIP' (giữ nguyên logic cũ)
  }

  // ===== Sửa phần lọc status/isDirty theo model mới =====
  if (statusParam) {
    const s = statusParam.toLowerCase() as RoomStatus;
    if (!ALLOWED_STATUS.includes(s)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 422 });
    }
    filter.status = s; // status là string
  }

  if (typeof dirtyParam === 'boolean') {
    filter.isDirty = dirtyParam; // isDirty là boolean
  }
  // =====================================================

  try {
    const [items, total] = await Promise.all([
      Room.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * size)
        .limit(size)
        .lean(),
      Room.countDocuments(filter)
    ]);

    return NextResponse.json({
      data: items,
      pagination: { page, size, total, pages: Math.ceil(total / size) }
    });
  } catch (e: any) {
    console.error('Rooms GET error:', {
      message: e?.message,
      stack: e?.stack,
      code: e?.code,
      name: e?.name
    });
    return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 });
  }
}

// POST /api/rooms  (giữ logic cũ + chuẩn hoá status/isDirty theo model mới)
export async function POST(req: NextRequest) {
  await dbConnect();

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const { houseId, code, name, type } = body ?? {};

  // Validate
  if (typeof houseId !== 'string' || !isValidObjectId(houseId)) {
    return NextResponse.json({ error: 'Invalid houseId' }, { status: 422 });
  }
  if (!name || !String(name).trim()) {
    return NextResponse.json({ error: "Missing 'name'" }, { status: 422 });
  }
  if (!type || !['Standard', 'VIP'].includes(type)) {
    return NextResponse.json({ error: "Invalid 'type' (Standard|VIP)" }, { status: 422 });
  }
  if (body.status !== undefined && typeof body.status !== 'string') {
    return NextResponse.json({ error: "Field 'status' must be a string" }, { status: 422 });
  }

  const status = normalizeStatus(body.status);
  const isDirty =
    body.isDirty === undefined
      ? false
      : typeof body.isDirty === 'boolean'
        ? body.isDirty
        : (() => {
            throw NextResponse.json({ error: "Field 'isDirty' must be boolean" }, { status: 422 });
          })();

  try {
    // ✅ Convert string -> ObjectId 1 lần rồi dùng lại
    const houseOid = new Types.ObjectId(houseId);

    // Nếu hàm nextRoomCode của bạn nhận ObjectId -> dùng houseOid
    // Nếu nó nhận string -> truyền houseId (string). Ở đây fix lỗi bạn nêu nên dùng houseOid.
    const finalCode: string = code && String(code).trim() ? String(code).trim() : await nextRoomCode(houseOid);

    const codeNorm = finalCode.trim().replace(/\s+/g, '_').toUpperCase();

    // Check unique trong 1 house
    const exists = await Room.findOne({ houseId: houseOid, codeNorm }, { _id: 1 }).lean();
    if (exists) {
      return NextResponse.json({ error: 'Room code already exists in this house' }, { status: 409 });
    }

    const doc = await Room.create({
      houseId: houseOid, // ✅ dùng ObjectId
      code: finalCode,
      codeNorm,
      name: String(name).trim(),
      type, // 'Standard' | 'VIP'
      status, // 'available' | 'booked' | 'occupied'
      isDirty // boolean (default false)
    });

    return NextResponse.json({ data: doc }, { status: 201 });
  } catch (e: any) {
    if (e?.code === 11000) {
      return NextResponse.json({ error: 'Duplicate key (codeNorm in this house)' }, { status: 409 });
    }
    console.error('Room POST error:', e);
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
  }
}
