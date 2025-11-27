import { NextResponse } from 'next/server';
import { dbConnect } from 'lib/mongodb';
import { Types } from 'mongoose';
import Booking from 'models/Booking';
import FinanceRecord from 'models/FinanceRecord';
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

  // Doanh thu (Booking.status = 'success', sum theo price)
  const fastMatch: any = { checkOut: range, status: 'success' };
  if (houseId) fastMatch.houseId = new Types.ObjectId(houseId);

  let revenue = 0;
  const fastAgg = await Booking.aggregate([{ $match: fastMatch }, { $group: { _id: null, s: { $sum: '$price' } } }]);
  revenue = fastAgg?.[0]?.s || 0;

  // Thu/Chi tháng
  const frBase: any = { year, month, deletedAt: null };
  if (houseId) frBase.houseId = new Types.ObjectId(houseId);

  const [incAgg, expAgg, rentAgg] = await Promise.all([
    FinanceRecord.aggregate([{ $match: { ...frBase, type: 'income' } }, { $group: { _id: null, s: { $sum: '$amount' } } }]),
    FinanceRecord.aggregate([{ $match: { ...frBase, type: 'expense' } }, { $group: { _id: null, s: { $sum: '$amount' } } }]),
    FinanceRecord.aggregate([
      { $match: { ...frBase, type: 'expense' } },
      { $lookup: { from: 'financecategories', localField: 'categoryId', foreignField: '_id', as: 'cat' } },
      { $unwind: { path: '$cat', preserveNullAndEmptyArrays: true } },
      { $match: { 'cat.code': 'rent' } },
      { $group: { _id: null, s: { $sum: '$amount' } } }
    ])
  ]);

  const otherIncome = incAgg?.[0]?.s || 0;
  const expense = expAgg?.[0]?.s || 0;
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
