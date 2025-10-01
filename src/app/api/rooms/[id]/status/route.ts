// app/api/rooms/[id]/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Room from 'models/Room';
import { isValidObjectId } from 'mongoose';
import { dbConnect } from 'lib/mongodb';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  try {
    const id = params.id;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ message: 'Invalid id' }, { status: 400 });
    }
    const { status } = await req.json(); // 'available' | 'booked' | 'occupied' | 'dirty'
    if (!['available', 'booked', 'occupied', 'dirty'].includes(status)) {
      return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
    }

    const doc = await Room.findByIdAndUpdate(id, { $set: { status } }, { new: true, runValidators: true }).lean();

    if (!doc) return NextResponse.json({ message: 'Room not found' }, { status: 404 });

    return NextResponse.json({ data: doc }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ message: err?.message || 'Internal error' }, { status: 500 });
  }
}
