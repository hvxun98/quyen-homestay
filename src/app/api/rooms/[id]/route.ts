import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from 'lib/mongodb';
import Room from 'models/Room';

// GET /api/rooms/[id]
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  try {
    const room = await Room.findById(params.id).lean();
    if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    return NextResponse.json(room);
  } catch {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }
}

// PUT /api/rooms/[id]
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const update: any = {};
  if (body.houseId !== undefined) update.houseId = String(body.houseId).trim();
  if (body.code !== undefined) update.code = String(body.code).trim();
  if (body.name !== undefined) update.name = String(body.name).trim();
  if (body.type !== undefined) update.type = String(body.type).trim();
  if (body.status !== undefined) update.status = String(body.status).trim();

  try {
    // Nếu đổi code/houseId → kiểm tra trùng
    if (update.houseId || update.code) {
      const current = await Room.findById(params.id).lean();
      if (!current) return NextResponse.json({ error: 'Room not found' }, { status: 404 });

      const houseId = update.houseId ?? String(current.houseId);
      const code = update.code ?? current.code;
      const dup = await Room.findOne({ _id: { $ne: params.id }, houseId, code }).lean();
      if (dup) {
        return NextResponse.json({ error: 'Room code already exists in this house' }, { status: 409 });
      }
    }

    const updated = await Room.findByIdAndUpdate(params.id, update, {
      new: true,
      runValidators: true
    });

    if (!updated) return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (e: any) {
    if (e?.code === 11000) {
      return NextResponse.json({ error: 'Room code already exists in this house' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to update room' }, { status: 500 });
  }
}

// DELETE /api/rooms/[id]
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  try {
    const deleted = await Room.findByIdAndDelete(params.id);
    if (!deleted) return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete room' }, { status: 500 });
  }
}
