// src/app/api/reports/finance/monthly/route.ts
import { NextResponse } from 'next/server';
import { dbConnect } from 'lib/mongodb';
import { Types } from 'mongoose';
import Booking from 'models/Booking';
import FinanceRecord from 'models/FinanceRecord';
import House from 'models/House';
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

  // Doanh thu
  const match: any = { checkOut: range, status: 'success' };
  if (houseId) match.houseId = new Types.ObjectId(houseId);
  const [{ s: revenue = 0 } = {}] = await Booking.aggregate([{ $match: match }, { $group: { _id: null, s: { $sum: '$price' } } }]);

  // Thu nhập / Chi phí
  const frBase: any = { year, month, deletedAt: null };
  if (houseId) frBase.houseId = new Types.ObjectId(houseId);
  const [incAgg, expAgg] = await Promise.all([
    FinanceRecord.aggregate([{ $match: { ...frBase, type: 'income' } }, { $group: { _id: null, s: { $sum: '$amount' } } }]),
    FinanceRecord.aggregate([{ $match: { ...frBase, type: 'expense' } }, { $group: { _id: null, s: { $sum: '$amount' } } }])
  ]);
  const otherIncome = incAgg?.[0]?.s || 0;
  const expense = expAgg?.[0]?.s || 0;

  // ✅ Tiền thuê nhà luôn thống nhất kiểu số
  const matchHouse = houseId ? { _id: new Types.ObjectId(houseId) } : {};
  const [{ s: rentCost = 0 } = {}] = await House.aggregate([{ $match: matchHouse }, { $group: { _id: null, s: { $sum: '$price' } } }]);

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
