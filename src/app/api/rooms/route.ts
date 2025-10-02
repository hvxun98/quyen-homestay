// app/api/rooms/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from 'lib/mongodb';
import Room from 'models/Room';
import { Types } from 'mongoose';
import { nextRoomCode } from 'lib/roomCode';

export const dynamic = 'force-dynamic'; // tránh cache GET khi dev

// GET /api/rooms?page=1&size=10&houseId=...&q=...&type=...
export async function GET(req: NextRequest) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const size = Math.max(1, Math.min(100, parseInt(searchParams.get('size') || '10', 10)));
  const houseIdStr = (searchParams.get('houseId') || '').trim();
  const q = (searchParams.get('q') || '').trim();
  const type = (searchParams.get('type') || '').trim();

  const match: any = {};
  if (houseIdStr) {
    try {
      match.houseId = new Types.ObjectId(houseIdStr);
    } catch {
      return NextResponse.json({ error: 'Invalid houseId' }, { status: 400 });
    }
  }
  if (type) match.type = type;
  if (q) {
    match.$or = [{ code: { $regex: q, $options: 'i' } }, { name: { $regex: q, $options: 'i' } }];
  }

  const [items, total] = await Promise.all([
    Room.find(match)
      .sort({ createdAt: -1 })
      .skip((page - 1) * size)
      .limit(size)
      .lean(),
    Room.countDocuments(match)
  ]);

  return NextResponse.json({ items, total, page, size }, { status: 200 });
}

// POST /api/rooms  (tự sinh code)
const ALLOWED_TYPES = new Set(['Standard', 'VIP']);

export async function POST(req: NextRequest) {
  await dbConnect();

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const houseIdStr = String(body.houseId || '').trim();
  const name = String(body.name || '').trim();
  const type = String(body.type || '').trim();
  const status = body.status && Array.isArray(body.status) ? body.status : ['available']; // Mảng trạng thái, mặc định là ['available']

  if (!houseIdStr || !name || !type) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(type)) {
    return NextResponse.json({ error: 'Invalid room type' }, { status: 400 });
  }

  let houseId: Types.ObjectId;
  try {
    houseId = new Types.ObjectId(houseIdStr);
  } catch {
    return NextResponse.json({ error: 'Invalid houseId' }, { status: 400 });
  }

  try {
    // thử tối đa 3 lần để tránh race hiếm
    for (let i = 0; i < 3; i++) {
      const code = await nextRoomCode(houseId);
      console.log('code', code);

      const codeNorm = code.toUpperCase();

      const dup = await Room.findOne({ houseId, codeNorm }).lean();
      if (dup) continue;

      const created = await Room.create({ houseId, code, codeNorm, name, type, status });
      return NextResponse.json({ item: created }, { status: 201 });
    }
    return NextResponse.json({ error: 'Failed to generate room code' }, { status: 500 });
  } catch (e: any) {
    // Ghi log chi tiết để thấy nguyên nhân
    console.error('Create room error:', {
      message: e?.message,
      stack: e?.stack,
      code: e?.code,
      name: e?.name,
      keyPattern: e?.keyPattern,
      keyValue: e?.keyValue
    });

    if (e?.code === 11000) {
      return NextResponse.json({ error: 'Room code already exists in this house' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
  }
}
