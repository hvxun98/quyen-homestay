import { NextResponse } from 'next/server';
import Room from 'models/Room';
import { dbConnect } from 'lib/mongodb';
import { syncBookingAndRoomStatus } from 'services/bookingStatusUpdater';

export async function GET() {
  await dbConnect();
  await syncBookingAndRoomStatus();
  // Đếm theo đúng logic: available = có 'available' và KHÔNG có 'booked'/'occupied'
  const pipeline = [
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        available: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $in: ['available', '$status'] },
                  {
                    $not: [
                      {
                        $or: [{ $in: ['booked', '$status'] }, { $in: ['occupied', '$status'] }]
                      }
                    ]
                  }
                ]
              },
              1,
              0
            ]
          }
        },
        booked: {
          $sum: {
            $cond: [{ $in: ['booked', '$status'] }, 1, 0]
          }
        },
        occupied: {
          $sum: {
            $cond: [{ $in: ['occupied', '$status'] }, 1, 0]
          }
        },
        dirty: {
          $sum: {
            $cond: [{ $in: ['dirty', '$status'] }, 1, 0]
          }
        }
      }
    }
  ] as any;

  const rows = await Room.aggregate(pipeline);
  const agg = rows[0] || {};

  // Giữ nguyên response shape cũ
  const base: Record<string, number> = {
    total: agg.total ?? 0,
    available: agg.available ?? 0,
    booked: agg.booked ?? 0,
    occupied: agg.occupied ?? 0,
    dirty: agg.dirty ?? 0
  };

  return NextResponse.json(base, { status: 200 });
}
