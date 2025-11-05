import { NextRequest, NextResponse } from 'next/server';

import Room from 'models/Room';
import { isValidObjectId } from 'mongoose';
import { dbConnect } from 'lib/mongodb';
import { syncBookingAndRoomStatus } from 'services/bookingStatusUpdater';
export const runtime = 'nodejs';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect(); // Kết nối MongoDB
  await syncBookingAndRoomStatus();
  const { id } = params; // Lấy id phòng từ params trong URL
  const { status } = await req.json(); // Lấy trạng thái mới từ body request

  // Kiểm tra trạng thái có hợp lệ không (chỉ "dirty" hoặc "clean")
  if (!['dirty', 'clean'].includes(status)) {
    return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
  }

  // Kiểm tra id phòng có hợp lệ không
  if (!isValidObjectId(id)) {
    return NextResponse.json({ message: 'Invalid room id' }, { status: 400 });
  }

  try {
    // Lấy phòng từ DB
    const updatedRoom = await Room.findById(id);

    if (!updatedRoom) {
      return NextResponse.json({ message: 'Room not found' }, { status: 404 });
    }

    if (status === 'clean') {
      // Nếu trạng thái là "clean", xóa "dirty" khỏi mảng trạng thái
      updatedRoom.status = updatedRoom.status.filter((s: string) => s !== 'dirty');
    } else if (status === 'dirty') {
      // Nếu trạng thái là "dirty", thêm "dirty" vào mảng trạng thái (nếu chưa có)
      if (!updatedRoom.status.includes('dirty')) {
        updatedRoom.status.push('dirty');
      }
    }

    // Lưu phòng đã cập nhật
    await updatedRoom.save();

    return NextResponse.json({ data: updatedRoom }, { status: 200 }); // Trả về phòng đã cập nhật
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
