import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from 'lib/mongodb';
import Room from 'models/Room';
import { isValidObjectId } from 'mongoose';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();

  const roomId = params.id;

  if (!isValidObjectId(roomId)) {
    return NextResponse.json({ error: 'roomId không hợp lệ' }, { status: 422 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Payload JSON không hợp lệ' }, { status: 400 });
  }

  const { isDirty } = body ?? {};
  if (typeof isDirty !== 'boolean') {
    return NextResponse.json({ error: "Trường 'isDirty' phải là boolean" }, { status: 422 });
  }

  try {
    const doc = await Room.findByIdAndUpdate(roomId, { $set: { isDirty } }, { new: true }).select(
      '_id houseId code codeNorm name type status isDirty'
    );

    if (!doc) {
      return NextResponse.json({ error: 'Không tìm thấy phòng' }, { status: 404 });
    }
    return NextResponse.json({ data: doc }, { status: 200 });
  } catch (e) {
    console.error('PATCH /rooms/[id]/dirty error:', e);
    return NextResponse.json({ error: 'Cập nhật thất bại' }, { status: 500 });
  }
}
