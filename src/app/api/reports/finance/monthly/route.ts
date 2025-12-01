import { NextResponse } from 'next/server';
import { dbConnect } from 'lib/mongodb';
import { Types } from 'mongoose';
import Booking from 'models/Booking';
import FinanceRecord from 'models/FinanceRecord';
import House from 'models/House';
import { buildMonthRange } from 'utils/datetime';

export async function GET(req: Request) {
  await dbConnect();

  const sp = new URL(req.url).searchParams;
  const year = Number(sp.get('year'));
  const month = Number(sp.get('month'));
  const houseId = sp.get('houseId') || undefined;

  const range = buildMonthRange(year, month);

  // ===== Doanh thu phòng (Booking) theo checkIn, chỉ tính 'success'
  const matchBooking: any = { checkIn: range, status: 'success' };
  if (houseId) matchBooking.houseId = new Types.ObjectId(houseId);

  const [{ s: revenueRoom = 0 } = {}] = await Booking.aggregate([
    { $match: matchBooking },
    { $group: { _id: null, s: { $sum: '$price' } } }
  ]);

  // ===== Thu nhập khác & Chi phí (FinanceRecord theo year/month)
  const frBase: any = { year, month, deletedAt: null };
  if (houseId) frBase.houseId = new Types.ObjectId(houseId);

  const [incAgg, expAgg] = await Promise.all([
    FinanceRecord.aggregate([{ $match: { ...frBase, type: 'income' } }, { $group: { _id: null, s: { $sum: '$amount' } } }]),
    FinanceRecord.aggregate([{ $match: { ...frBase, type: 'expense' } }, { $group: { _id: null, s: { $sum: '$amount' } } }])
  ]);

  const otherIncome = incAgg?.[0]?.s || 0;
  const expense = expAgg?.[0]?.s || 0;

  // ===== Tiền thuê nhà (House.price): 1 nhà hoặc toàn hệ thống
  const matchHouse = houseId ? { _id: new Types.ObjectId(houseId) } : {};
  const [{ s: rentCost = 0 } = {}] = await House.aggregate([{ $match: matchHouse }, { $group: { _id: null, s: { $sum: '$price' } } }]);

  // ===== Tổng doanh thu & Lợi nhuận
  const totalRevenue = revenueRoom + otherIncome;
  const profit = totalRevenue - expense;

  // ===== Tỷ suất
  const profitRate = totalRevenue ? profit / totalRevenue : 0; // LN / Tổng doanh thu
  const profitToRentRate = rentCost ? profit / rentCost : 0; // LN / Tiền thuê nhà

  return NextResponse.json({
    scope: houseId ? 'house' : 'all',
    houseId,
    year,
    month,
    totals: {
      revenue: totalRevenue, // Tổng doanh thu (để card Doanh thu)
      revenueRoom, // Doanh thu phòng (tham khảo)
      otherIncome, // Thu nhập khác
      expense, // Chi phí
      profit, // Lợi nhuận = Tổng doanh thu - Chi phí
      rentCost, // Tiền thuê nhà
      profitRate, // LN / Tổng doanh thu
      profitToRentRate // LN / Tiền thuê nhà
    }
  });
}
