// app/api/room-stats/route.ts
import { NextResponse } from 'next/server';
import Room from 'models/Room';
import { dbConnect } from 'lib/mongodb';

export async function GET() {
  await dbConnect();
  const pipeline = [{ $group: { _id: '$status', count: { $sum: 1 } } }];
  const rows = await Room.aggregate(pipeline);
  const base = { total: 0, available: 0, booked: 0, occupied: 0, dirty: 0 };
  for (const r of rows) {
    base.total += r.count;
    if (r._id in base) (base as any)[r._id] = r.count;
  }
  return NextResponse.json(base, { status: 200 });
}
