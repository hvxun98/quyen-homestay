import { dbConnect } from 'lib/mongodb';
import House from 'models/House';
import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';

// GET /api/houses?page=1&size=10&q=LLQ
export async function GET(req: NextRequest) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const size = Math.max(1, Math.min(100, parseInt(searchParams.get('size') || '10', 10)));
  const q = (searchParams.get('q') || '').trim();

  const match: any = {};
  if (q) {
    match.$or = [{ code: { $regex: q, $options: 'i' } }, { address: { $regex: q, $options: 'i' } }];
  }

  const [items, total] = await Promise.all([
    House.find(match)
      .sort({ createdAt: -1 })
      .skip((page - 1) * size)
      .limit(size)
      .lean(),
    House.countDocuments(match)
  ]);

  return NextResponse.json({ items, total, page, size });
}

// POST /api/houses
// Body: { code, address, numOfFloors, numOfRooms, price }
export async function POST(req: NextRequest) {
  await dbConnect();

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const code = String(body.code || '').trim();
  const address = String(body.address || '').trim();
  const numOfFloors = Number(body.numOfFloors);
  const numOfRooms = Number(body.numOfRooms);
  const price = Number(body.price);

  // validate tối thiểu
  if (!code || !address || Number.isNaN(numOfFloors) || Number.isNaN(numOfRooms) || Number.isNaN(price)) {
    return NextResponse.json({ error: 'Vui lòng nhập đủ thông tin' }, { status: 400 });
  }

  try {
    const created = await House.create({ code, address, numOfFloors, numOfRooms, price });
    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    // trùng mã nhà (unique index)
    if (e?.code === 11000) {
      return NextResponse.json({ error: 'Mã nhà đã tồn tại' }, { status: 409 });
    }
    console.error(e);
    return NextResponse.json({ error: 'Thêm mới thất bại' }, { status: 500 });
  }
}
