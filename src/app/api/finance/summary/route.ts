import { NextResponse } from 'next/server';
import { dbConnect } from 'lib/mongodb';
import FinanceRecord from 'models/FinanceRecord';

export async function GET(req: Request) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const houseId = searchParams.get('houseId');
  const year = searchParams.get('year');
  const month = searchParams.get('month');

  if (!houseId) return NextResponse.json({ message: 'Thiếu houseId' }, { status: 400 });

  const match: any = { houseId, deletedAt: null };
  if (year) match.year = Number(year);
  if (month) match.month = Number(month);

  const [totals, byCat] = await Promise.all([
    FinanceRecord.aggregate([{ $match: match }, { $group: { _id: '$type', amount: { $sum: '$amount' } } }]),
    FinanceRecord.aggregate([
      { $match: match },
      {
        $group: {
          _id: { categoryId: '$categoryId', type: '$type' },
          amount: { $sum: '$amount' }
        }
      },
      {
        $lookup: {
          from: 'financecategories',
          localField: '_id.categoryId',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          type: '$_id.type',
          categoryId: '$_id.categoryId',
          amount: 1,
          categoryName: { $ifNull: ['$category.name', 'Khác/Không phân loại'] }
        }
      },
      { $sort: { type: 1, categoryName: 1 } }
    ])
  ]);

  const totalIncome = totals.find((t) => t._id === 'income')?.amount ?? 0;
  const totalExpense = totals.find((t) => t._id === 'expense')?.amount ?? 0;

  return NextResponse.json({
    totalIncome,
    totalExpense,
    net: totalIncome - totalExpense,
    byCategory: byCat
  });
}
