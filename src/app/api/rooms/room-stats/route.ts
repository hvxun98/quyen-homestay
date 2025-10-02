import { NextResponse } from 'next/server';
import Room from 'models/Room';
import { dbConnect } from 'lib/mongodb';

export async function GET() {
  await dbConnect();

  // Đếm các trạng thái của phòng
  const pipeline = [
    { $unwind: '$status' }, // Tách mỗi trạng thái trong mảng thành một bản ghi riêng biệt
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ];

  const rows = await Room.aggregate(pipeline);

  // Khai báo đúng kiểu cho base
  const base: Record<string, number> = { total: 0, available: 0, booked: 0, occupied: 0, dirty: 0 };

  // Cập nhật số lượng trạng thái
  rows.forEach((row: { _id: string; count: number }) => {
    base.total += row.count;
    if (row._id in base) {
      base[row._id] = row.count; // Thêm count cho trạng thái
    }
  });

  return NextResponse.json(base, { status: 200 });
}
