// ...existing code...
import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from 'lib/mongodb';
import Booking from 'models/Booking';
import Room from 'models/Room';
import mongoose from 'mongoose';
import dayjs from 'dayjs';
import { combineLocalToUtcDate } from 'utils/datetime';
export const runtime = 'nodejs';

type Status = 'pending' | 'success' | 'cancelled';

/* ✅ NEW: GET /api/bookings/[id]
-------------------------------------------------- */
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const id = params.id;

  try {
    const booking = await Booking.findById(id)
      .populate({
        path: 'roomId',
        select: 'name code houseId',
        populate: {
          path: 'houseId',
          select: 'code name address'
        }
      })
      .lean();

    if (!booking) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(booking);
  } catch (err: any) {
    console.error('GET booking error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const id = params.id;
  const body = await req.json();

  // Load current booking
  const current = await Booking.findById(id).lean();
  if (!current) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const set: any = {};

  // Simple fields
  if (body.customerName != null) set.customerName = body.customerName;
  if (body.customerPhone != null) set.customerPhone = body.customerPhone;
  if (body.price != null) set.price = Number(body.price);
  if (body.status != null) set.status = body.status as Status;
  if (body.note != null) set.note = body.note;
  if (body.source != null) set.source = body.source;
  if (body.paymentStatus != null) set.paymentStatus = body.paymentStatus;

  // room/house handling
  let roomIdToCheck = current.roomId;
  if (body.roomId) {
    set.roomId = body.roomId;
    const room = await Room.findById(body.roomId).lean();
    if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 400 });
    set.houseId = (room as any).houseId;
    roomIdToCheck = body.roomId;
  } else if (body.houseId) {
    set.houseId = body.houseId;
  }

  // checkin/checkout
  if (body.checkInDate) {
    set.checkIn = combineLocalToUtcDate(body.checkInDate, body.checkInHour ?? 0, body.checkInMinute ?? 0);
  } else if (body.checkIn) {
    set.checkIn = new Date(body.checkIn);
  }

  if (body.checkOutDate) {
    set.checkOut = combineLocalToUtcDate(body.checkOutDate, body.checkOutHour ?? 0, body.checkOutMinute ?? 0);
  } else if (body.checkOut) {
    set.checkOut = new Date(body.checkOut);
  }

  // validate checkout > checkin
  const ci = set.checkIn ? new Date(set.checkIn) : new Date(current.checkIn);
  const co = set.checkOut ? new Date(set.checkOut) : new Date(current.checkOut);
  if (!(co > ci)) {
    return NextResponse.json({ error: 'Checkout must be after checkin' }, { status: 400 });
  }

  // overlap check
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

  // Update booking
  const updated = await Booking.findByIdAndUpdate(id, { $set: set }, { new: true });
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // ---- ROOM STATUS UPDATE (STRING only) ----
  if (updated.roomId) {
    const roomDoc = await Room.findById(updated.roomId);
    if (roomDoc) {
      const now = dayjs();

      if (updated.status === 'cancelled' || now.isAfter(updated.checkOut)) {
        // Huỷ hoặc đã checkout → available
        roomDoc.status = 'available';
      } else if (now.isBefore(updated.checkIn)) {
        // Chưa tới → booked
        roomDoc.status = 'booked';
      } else if (now.isAfter(updated.checkIn) && now.isBefore(updated.checkOut)) {
        // Đang ở → occupied
        roomDoc.status = 'occupied';
      }

      await roomDoc.save();
    }
  }

  return NextResponse.json(updated.toJSON ? updated.toJSON({ virtuals: true }) : updated);
}
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const id = params.id;

  try {
    const booking = await Booking.findByIdAndUpdate(id, { $set: { status: 'cancelled' } }, { new: true });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // 2️⃣ Cập nhật room status nếu hiện đang 'booked'
    if (booking.roomId) {
      const roomDoc = await Room.findById(booking.roomId);
      if (roomDoc && roomDoc.status === 'booked') {
        roomDoc.status = 'available';
        await roomDoc.save();
      }
    }

    return NextResponse.json({ ok: true, bookingStatus: booking.status });
  } catch (err) {
    console.error('DELETE booking error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
// ...existing code...
