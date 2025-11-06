import { NextResponse } from 'next/server';
import { z } from 'zod';
import { dbConnect } from 'lib/mongodb';
import FinanceRecord from 'models/FinanceRecord';
import FinanceCategory from 'models/FinanceCategory';

const updateSchema = z.object({
  amount: z.number().int().positive().optional(),
  note: z.string().optional(),
  year: z.number().int().min(2000).max(2100).optional(),
  month: z.number().int().min(1).max(12).optional(),
  categoryId: z.string().nullable().optional(),
  attachmentIds: z.array(z.string()).optional()
});

export async function GET(_: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const rec = await FinanceRecord.findOne({ _id: params.id, deletedAt: null })
    .populate('createdBy', 'name email')
    .populate('attachments', 'url mimeType')
    .populate('categoryId', 'name type');
  if (!rec) return NextResponse.json({ message: 'Không tìm thấy bản ghi' }, { status: 404 });
  return NextResponse.json(rec);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();

  const raw = await req.json().catch(() => ({}));
  const parsed = updateSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ message: 'Dữ liệu không hợp lệ', errors: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  // Nếu cập nhật category → đảm bảo hợp lệ
  if (data.categoryId !== undefined && data.categoryId !== null) {
    const cat = await FinanceCategory.findById(data.categoryId);
    if (!cat) return NextResponse.json({ message: 'categoryId không tồn tại' }, { status: 400 });
  }

  const rec = await FinanceRecord.findOneAndUpdate(
    { _id: params.id, deletedAt: null },
    {
      ...(data.amount !== undefined ? { amount: data.amount } : {}),
      ...(data.note !== undefined ? { note: data.note } : {}),
      ...(data.year !== undefined ? { year: data.year } : {}),
      ...(data.month !== undefined ? { month: data.month } : {}),
      ...(data.categoryId !== undefined ? { categoryId: data.categoryId } : {}),
      ...(data.attachmentIds ? { attachments: data.attachmentIds } : {}),
      updatedAt: new Date()
    },
    { new: true }
  );

  if (!rec) return NextResponse.json({ message: 'Không tìm thấy bản ghi' }, { status: 404 });
  return NextResponse.json(rec);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const rec = await FinanceRecord.findOneAndUpdate({ _id: params.id, deletedAt: null }, { deletedAt: new Date() }, { new: true });
  if (!rec) return NextResponse.json({ message: 'Không tìm thấy bản ghi' }, { status: 404 });
  return NextResponse.json({ message: 'Đã xoá (soft delete) thành công' });
}
