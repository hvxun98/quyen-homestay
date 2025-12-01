import { NextResponse } from 'next/server';
import { dbConnect } from 'lib/mongodb';
import { Types } from 'mongoose';
import Booking from 'models/Booking';
import 'models/Room';
import 'models/House';
import { buildMonthRange } from 'utils/datetime';

export async function GET(req: Request) {
  await dbConnect();
  const sp = new URL(req.url).searchParams;
  const year = Number(sp.get('year'));
  const month = Number(sp.get('month'));
  const houseId = sp.get('houseId') || undefined;

  const range = buildMonthRange(year, month);

  // 👇 Chuyển sang checkIn
  const match: any = { checkIn: range, status: 'success' };
  if (houseId) match.houseId = new Types.ObjectId(houseId);

  const rows = await Booking.aggregate([
    { $match: match },
    { $group: { _id: '$roomId', bookings: { $sum: 1 }, revenue: { $sum: '$price' } } },
    { $lookup: { from: 'rooms', localField: '_id', foreignField: '_id', as: 'room' } },
    { $unwind: '$room' },
    ...(houseId ? [{ $match: { 'room.houseId': new Types.ObjectId(houseId) } }] : []),
    { $lookup: { from: 'houses', localField: 'room.houseId', foreignField: '_id', as: 'house' } },
    { $unwind: '$house' },
    {
      $project: {
        roomId: '$_id',
        roomName: '$room.name',
        roomCode: '$room.code',
        houseId: '$house._id',
        houseCode: '$house.code',
        houseAddress: '$house.address',
        bookings: 1,
        revenue: 1
      }
    },
    { $sort: { revenue: -1 } }
  ]);

  const totalRevenue = rows.reduce((s: number, r: any) => s + (r.revenue || 0), 0);
  return NextResponse.json({ items: rows, totalRevenue });
}
