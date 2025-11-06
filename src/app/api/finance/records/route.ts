import { NextResponse } from 'next/server';
import { z } from 'zod';
import { dbConnect } from 'lib/mongodb';
import FinanceRecord from 'models/FinanceRecord';
import FinanceCategory from 'models/FinanceCategory';
import { nextSeq } from 'lib/counter';
// import { authUser } from "@/lib/auth"; // tuỳ hệ thống của bạn

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

export async function GET(req: Request) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const houseId = searchParams.get('houseId');
  const year = searchParams.get('year');
  const month = searchParams.get('month');
  const type = searchParams.get('type'); // optional
  const q = searchParams.get('q')?.trim();
  const page = Number(searchParams.get('page') ?? '1');
  const limit = Number(searchParams.get('limit') ?? '20');

  if (!houseId) {
    return NextResponse.json({ message: 'Thiếu houseId' }, { status: 400 });
  }
  if (!year || !month) {
    return NextResponse.json({ message: 'Thiếu year hoặc month' }, { status: 400 });
  }

  const filter: any = {
    houseId,
    year: Number(year),
    month: Number(month),
    deletedAt: null
  };
  if (type === 'income' || type === 'expense') filter.type = type;
  if (q) {
    filter.$or = [{ code: { $regex: q, $options: 'i' } }, { note: { $regex: q, $options: 'i' } }];
  }

  const [items, total] = await Promise.all([
    FinanceRecord.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('createdBy', 'name email')
      .populate('attachments', 'url')
      .populate('categoryId', 'name type'),
    FinanceRecord.countDocuments(filter)
  ]);

  return NextResponse.json({ items, pagination: { page, limit, total } });
}

export async function POST(req: Request) {
  await dbConnect();

  const raw = await req.json().catch(() => ({}));
  const parsed = createSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ message: 'Dữ liệu không hợp lệ', errors: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  // const user = await authUser(req); // lấy user đăng nhập
  const userId = (data as any).createdBy || null; // fallback cho môi trường chưa tích hợp auth
  if (!userId) {
    // Tuỳ hệ thống của bạn: bạn có thể bỏ đoạn này nếu auth khác
    // return NextResponse.json({ message: "Chưa xác thực người dùng" }, { status: 401 });
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
