import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from 'lib/mongodb';
import Booking from 'models/Booking';
import Room from 'models/Room';

type Status = 'pending' | 'success' | 'cancelled';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const id = params.id;
  const body = await req.json();

  const set: any = {};
  if (body.customerName != null) set.customerName = body.customerName;
  if (body.customerPhone != null) set.customerPhone = body.customerPhone;
  if (body.price != null) set.price = Number(body.price);
  if (body.status != null) set.status = body.status as Status;
  if (body.note != null) set.note = body.note;

  if (body.checkIn) set.checkIn = new Date(body.checkIn);
  if (body.checkOut) set.checkOut = new Date(body.checkOut);
  if (body.houseId) set.houseId = body.houseId;
  if (body.roomId) set.roomId = body.roomId;

  // Optionally validate room ∈ house khi đổi room/house
  if (set.roomId && (set.houseId || body.houseId)) {
    const house = set.houseId || body.houseId;
    const room = await Room.findOne({ _id: set.roomId, houseId: house }).lean();
    if (!room) return NextResponse.json({ error: 'Room not in selected house' }, { status: 400 });
  }

  // Check overlap khi đổi thời gian/room
  if ((set.checkIn || set.checkOut || set.roomId) && set.checkIn && set.checkOut) {
    const ci = new Date(set.checkIn);
    const co = new Date(set.checkOut);
    const roomId = set.roomId ?? (await Booking.findById(id).select('roomId').lean())?.roomId;
    const overlapping = await Booking.exists({
      _id: { $ne: id },
      roomId,
      status: { $ne: 'cancelled' },
      checkIn: { $lt: co },
      checkOut: { $gt: ci }
    });
    if (overlapping) {
      return NextResponse.json({ error: 'Time range overlaps an existing booking' }, { status: 409 });
    }
  }

  const updated = await Booking.findByIdAndUpdate(id, { $set: set }, { new: true });
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const id = params.id;
  // soft-cancel để giữ lịch sử và mã đơn
  const updated = await Booking.findByIdAndUpdate(id, { $set: { status: 'cancelled' } }, { new: true });
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true, status: updated.status });
}
