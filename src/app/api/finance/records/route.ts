import { NextResponse } from 'next/server';
import { z } from 'zod';
import { dbConnect } from 'lib/mongodb';
import FinanceRecord from 'models/FinanceRecord';
import FinanceCategory from 'models/FinanceCategory';
import { nextSeq } from 'lib/counter';
import { getServerSession } from 'next-auth';
import { authOptions } from 'utils/authOptions';
import { getUserIdByEmail } from 'lib/users';
import { Types } from 'mongoose';

import 'models/User';
import 'models/FinanceCategory';
import 'models/FinanceRecord';

const createSchema = z.object({
  type: z.enum(['income', 'expense']),
  houseId: z.string(),
  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12),
  amount: z.number().int().positive(),
  currency: z.literal('VND').default('VND'),
  categoryId: z.string().nullable().optional(),
  note: z.string().optional(),
  attachmentIds: z.array(z.string()).optional(),
  source: z.enum(['manual', 'booking']).optional(),
  sourceRefId: z.string().optional()
});

const querySchema = z.object({
  houseId: z.string().length(24).optional(), // ✅ optional
  year: z.coerce.number().int().optional(), // cho phép thiếu -> lấy tất cả
  month: z.coerce.number().int().min(1).max(12).optional(),
  type: z.enum(['income', 'expense']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  q: z.string().trim().optional()
});

export async function GET(req: Request) {
  await dbConnect();

  const sp = Object.fromEntries(new URL(req.url).searchParams.entries());
  const parsed = querySchema.safeParse(sp);
  if (!parsed.success) {
    return NextResponse.json({ message: 'Query không hợp lệ', errors: parsed.error.flatten() }, { status: 400 });
  }
  const { houseId, year, month, type, page, limit, q } = parsed.data;

  // ✅ Xây filter: houseId CHỈ thêm khi có
  const filter: any = { deletedAt: null };
  if (houseId) filter.houseId = new Types.ObjectId(houseId);
  if (typeof year === 'number') filter.year = year;
  if (typeof month === 'number') filter.month = month;
  if (type) filter.type = type;
  if (q && q.length > 0) {
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ code: rx }, { note: rx }];
  }

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    FinanceRecord.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('categoryId', 'name code')
      .populate('createdBy', 'name email')
      .lean(),
    FinanceRecord.countDocuments(filter)
  ]);

  return NextResponse.json({ items, total, page, limit });
}

export async function POST(req: Request) {
  await dbConnect();

  const raw = await req.json().catch(() => ({}));
  const parsed = createSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ message: 'Dữ liệu không hợp lệ', errors: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  const session = await getServerSession(authOptions);
  const userEmail = session?.user?.email;
  if (!userEmail) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Lấy _id user từ email (tạo nếu chưa có)
  const userId = await getUserIdByEmail(userEmail, session?.user?.name, true);
  if (!userId) {
    return NextResponse.json({ error: 'Không tìm thấy tài khoản người dùng' }, { status: 401 });
  }

  if (data.type === 'expense' && !data.categoryId) {
    return NextResponse.json({ message: 'Vui lòng chọn loại chi phí (categoryId)' }, { status: 400 });
  }

  // Kiểm tra category đúng type (nếu gửi)
  if (data.categoryId) {
    const cat = await FinanceCategory.findById(data.categoryId);
    if (!cat) return NextResponse.json({ message: 'categoryId không tồn tại' }, { status: 400 });
    if (cat.type !== data.type) return NextResponse.json({ message: 'categoryId không khớp type thu/chi' }, { status: 400 });
  }

  const key = `finance:${data.year}:${data.type}`;
  const seq = await nextSeq(key);
  const prefix = data.type === 'expense' ? 'C_' : 'I_';
  const code = `${prefix}${seq}`;

  const doc = await FinanceRecord.create({
    code,
    type: data.type,
    houseId: data.houseId,
    recordDate: new Date(),
    year: data.year,
    month: data.month,
    amount: data.amount,
    currency: 'VND',
    categoryId: data.categoryId ?? null,
    note: data.note,
    attachments: data.attachmentIds ?? [],
    source: data.source ?? 'manual',
    sourceRefId: data.sourceRefId ?? null,
    createdBy: userId
  });

  return NextResponse.json(doc, { status: 201 });
}
