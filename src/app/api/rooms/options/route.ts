import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from 'lib/mongodb';
import Room from 'models/Room';
import House from 'models/House';
import { Types } from 'mongoose';

export async function GET(req: NextRequest) {
  await dbConnect();

  const url = new URL(req.url);
  const houseId = url.searchParams.get('houseId') || undefined;

  const match: any = {};
  if (houseId) {
    try {
      match.houseId = new Types.ObjectId(houseId);
    } catch {
      return NextResponse.json({ items: [], total: 0 });
    }
  }

  // Gom nhóm phòng theo House, kèm nhãn hiển thị
  const items = await Room.aggregate([
    { $match: match },
    {
      $lookup: {
        from: House.collection.name, // 'houses'
        localField: 'houseId',
        foreignField: '_id',
        as: 'house'
      }
    },
    { $unwind: '$house' },
    {
      $project: {
        _id: 1,
        name: 1,
        code: 1,
        houseId: 1,
        houseLabel: { $ifNull: ['$house.code', '$house.name'] }, // tiêu đề nhóm
        // Nhãn hiển thị cho item phòng: ưu tiên name, fallback code
        roomLabel: { $ifNull: ['$name', '$code'] }
      }
    },
    { $sort: { houseLabel: 1, roomLabel: 1 } },
    {
      $group: {
        _id: '$houseId',
        houseId: { $first: '$houseId' },
        houseLabel: { $first: '$houseLabel' },
        rooms: {
          $push: {
            _id: '$_id',
            label: '$roomLabel',
            name: '$name',
            code: '$code'
          }
        }
      }
    },
    { $sort: { houseLabel: 1 } }
  ]);

  return NextResponse.json({
    items, // [{houseId,houseLabel,rooms:[{_id,label,name,code}]}]
    total: items.length
  });
}
