// app/api/rooms/room-stats/route.ts
import { NextResponse } from 'next/server';
import { dbConnect } from 'lib/mongodb';
import Room from 'models/Room';
import { syncBookingAndRoomStatus } from 'services/bookingStatusUpdater';

export const dynamic = 'force-dynamic';

export async function GET() {
  await dbConnect();
  await syncBookingAndRoomStatus();
  // Pipeline tối giản: chỉ group và đếm
  const res = await Room.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        available: { $sum: { $cond: [{ $eq: ['$status', 'available'] }, 1, 0] } },
        booked: { $sum: { $cond: [{ $eq: ['$status', 'booked'] }, 1, 0] } },
        occupied: { $sum: { $cond: [{ $eq: ['$status', 'occupied'] }, 1, 0] } },
        dirty: { $sum: { $cond: [{ $eq: ['$isDirty', true] }, 1, 0] } } // đếm bẩn theo isDirty
      }
    },
    { $project: { _id: 0 } }
  ]);

  const fallback = { total: 0, available: 0, booked: 0, occupied: 0, dirty: 0 };
  const stats = res && res.length ? (res[0] as typeof fallback) : fallback;

  return NextResponse.json(stats, { status: 200 });
}
