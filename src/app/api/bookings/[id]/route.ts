// ...existing code...
import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from 'lib/mongodb';
import Booking from 'models/Booking';
import Room from 'models/Room';
import mongoose from 'mongoose';

// ---- helpers (same parsing logic as POST) ---------------------------------
function parseDateLocal(dateStr: string | undefined | null) {
  if (!dateStr) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split('-').map(Number);
    return { y, m, d };
  }
  const parts = String(dateStr)
    .split(/[\/\-\.]/)
    .map(Number);
  if (parts.length < 3) return null;
  const [d, m, y] = parts;
  return { y, m, d };
}

function combineLocal(dateStr: string | undefined | null, hour = 0, minute = 0) {
  const p = parseDateLocal(String(dateStr));
  if (!p) return new Date(NaN);
  return new Date(p.y, p.m - 1, p.d, Number(hour) || 0, Number(minute) || 0, 0, 0);
}
// ---------------------------------------------------------------------------

type Status = 'pending' | 'success' | 'cancelled';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const id = params.id;
  const body = await req.json();

  // load current booking to get defaults
  const current = await Booking.findById(id).lean();
  if (!current) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const set: any = {};

  // simple fields
  if (body.customerName != null) set.customerName = body.customerName;
  if (body.customerPhone != null) set.customerPhone = body.customerPhone;
  if (body.price != null) set.price = Number(body.price);
  if (body.status != null) set.status = body.status as Status;
  if (body.note != null) set.note = body.note;
  if (body.source != null) set.source = body.source;
  if (body.paymentStatus != null) set.paymentStatus = body.paymentStatus;

  // room/house handling:
  if (body.roomId) {
    set.roomId = body.roomId;
    // load room to get houseId and validate existence
    const room = await Room.findById(body.roomId).lean();
    if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 400 });
    set.houseId = (room as any).houseId;
  } else if (body.houseId) {
    // allow house change without room change
    set.houseId = body.houseId;
  }

  // checkin/checkout: accept either full ISO/date strings (body.checkIn/body.checkOut)
  // or the form-style fields (checkInDate/checkInHour/checkInMinute)
  if (body.checkInDate) {
    set.checkIn = combineLocal(body.checkInDate, body.checkInHour ?? 0, body.checkInMinute ?? 0);
  } else if (body.checkIn) {
    set.checkIn = new Date(body.checkIn);
  }

  if (body.checkOutDate) {
    set.checkOut = combineLocal(body.checkOutDate, body.checkOutHour ?? 0, body.checkOutMinute ?? 0);
  } else if (body.checkOut) {
    set.checkOut = new Date(body.checkOut);
  }

  // validate checkout > checkin if both present (either changed or existing)
  const ci = set.checkIn ? new Date(set.checkIn) : new Date(current.checkIn);
  const co = set.checkOut ? new Date(set.checkOut) : new Date(current.checkOut);
  if (!(co > ci)) {
    return NextResponse.json({ error: 'Checkout must be after checkin' }, { status: 400 });
  }

  // overlap check - determine roomId to check (new or existing)
  const roomIdToCheck = set.roomId ?? current.roomId;
  if (roomIdToCheck) {
    const oid = new mongoose.Types.ObjectId(id);
    const overlapping = await Booking.exists({
      _id: { $ne: oid },
      roomId: roomIdToCheck,
      status: { $ne: 'cancelled' },
      checkIn: { $lt: co },
      checkOut: { $gt: ci }
    });
    if (overlapping) {
      return NextResponse.json({ error: 'Khoảng thời gian trùng với đặt phòng khác' }, { status: 409 });
    }
  }

  const updated = await Booking.findByIdAndUpdate(id, { $set: set }, { new: true });
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // trả về document đã cập nhật (bao gồm virtuals nếu schema cấu hình)
  return NextResponse.json(updated.toJSON ? updated.toJSON({ virtuals: true }) : updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const id = params.id;
  // soft-cancel để giữ lịch sử và mã đơn
  const updated = await Booking.findByIdAndUpdate(id, { $set: { status: 'cancelled' } }, { new: true });
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true, status: updated.status });
}
// ...existing code...
