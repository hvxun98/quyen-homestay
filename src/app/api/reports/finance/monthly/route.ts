import { NextResponse } from 'next/server';
import { dbConnect } from 'lib/mongodb';
import { Types } from 'mongoose';

// Đăng ký models để populate/an toàn HMR
import '@/models/FinanceRecord';
import '@/models/FinanceCategory';
import '@/models/Booking';
import '@/models/Room';
import '@/models/House';

import FinanceRecord from 'models/FinanceRecord';
import Booking from 'models/Booking';

function toInt(v: any, d: number) {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

export async function GET(req: Request) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const year = toInt(searchParams.get('year'), new Date().getFullYear());
  const month = toInt(searchParams.get('month'), new Date().getMonth() + 1);
  const houseId = searchParams.get('houseId') || undefined;

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  // -------- Doanh thu từ Booking (theo checkOut, trạng thái đã thanh toán)
  const bookingMatch: any = {
    checkOut: { $gte: start, $lt: end },
    status: { $in: ['paid', 'completed'] }
  };

  // Nếu Booking KHÔNG có field houseId, bạn có thể comment 2 dòng dưới & dùng pipeline có $lookup room
  if (houseId) bookingMatch.houseId = new Types.ObjectId(houseId);

  let revenue = 0;

  // Cố gắng tính nhanh nếu đã có houseId trên Booking
  const fastRevenueAgg = await Booking.aggregate([{ $match: bookingMatch }, { $group: { _id: null, s: { $sum: '$finalAmount' } } }]);
  revenue = fastRevenueAgg?.[0]?.s || 0;

  // Nếu không có houseId trên Booking (hoặc bạn muốn derive qua Room), fallback:
  if (houseId && !revenue) {
    const viaRoom = await Booking.aggregate([
      { $match: { checkOut: { $gte: start, $lt: end }, status: { $in: ['paid', 'completed'] } } },
      { $lookup: { from: 'rooms', localField: 'roomId', foreignField: '_id', as: 'room' } },
      { $unwind: '$room' },
      { $match: { 'room.houseId': new Types.ObjectId(houseId) } },
      { $group: { _id: null, s: { $sum: '$finalAmount' } } }
    ]);
    revenue = viaRoom?.[0]?.s || 0;
  }

  // -------- Thu nhập/Chi phí từ FinanceRecord (đã lưu year, month để query nhanh)
  const frBase: any = { year, month, deletedAt: null };
  if (houseId) frBase.houseId = new Types.ObjectId(houseId);

  const [incomeAgg, expenseAgg] = await Promise.all([
    FinanceRecord.aggregate([{ $match: { ...frBase, type: 'income' } }, { $group: { _id: null, s: { $sum: '$amount' } } }]),
    FinanceRecord.aggregate([{ $match: { ...frBase, type: 'expense' } }, { $group: { _id: null, s: { $sum: '$amount' } } }])
  ]);

  const otherIncome = incomeAgg?.[0]?.s || 0;
  const expense = expenseAgg?.[0]?.s || 0;

  // (tùy chọn) tổng rent tháng (không dùng cho 4 card, giữ để FE có thể dùng nơi khác)
  const rentAgg = await FinanceRecord.aggregate([
    { $match: { ...frBase, type: 'expense' } },
    { $lookup: { from: 'financecategories', localField: 'categoryId', foreignField: '_id', as: 'cat' } },
    { $unwind: { path: '$cat', preserveNullAndEmptyArrays: true } },
    { $match: { 'cat.code': 'rent' } },
    { $group: { _id: null, s: { $sum: '$amount' } } }
  ]);
  const rentCost = rentAgg?.[0]?.s || 0;

  const profit = revenue + otherIncome - expense;
  const profitRate = revenue ? profit / revenue : 0;
  const profitToRentRate = rentCost ? profit / rentCost : 0;

  return NextResponse.json({
    scope: houseId ? 'house' : 'all',
    houseId,
    year,
    month,
    totals: { revenue, otherIncome, expense, profit, rentCost, profitRate, profitToRentRate }
  });
}
