import { NextResponse } from 'next/server';
import { z } from 'zod';
import { dbConnect } from 'lib/mongodb';
import FinanceCategory from 'models/FinanceCategory';

const updateSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional()
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const raw = await req.json().catch(() => ({}));
  const parsed = updateSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ message: 'Dữ liệu không hợp lệ', errors: parsed.error.flatten() }, { status: 400 });
  }
  const doc = await FinanceCategory.findByIdAndUpdate(params.id, parsed.data, { new: true });
  if (!doc) return NextResponse.json({ message: 'Không tìm thấy danh mục' }, { status: 404 });
  return NextResponse.json(doc);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const doc = await FinanceCategory.findByIdAndUpdate(params.id, { isActive: false }, { new: true });
  if (!doc) return NextResponse.json({ message: 'Không tìm thấy danh mục' }, { status: 404 });
  return NextResponse.json({ message: 'Đã vô hiệu hoá danh mục' });
}
