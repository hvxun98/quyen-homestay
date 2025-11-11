import { NextResponse } from 'next/server';
import { z } from 'zod';
import { dbConnect } from 'lib/mongodb';
import FinanceCategory from 'models/FinanceCategory';

const createSchema = z.object({
  type: z.enum(['income', 'expense']),
  code: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  houseId: z.string().nullable().optional()
});

export async function GET(req: Request) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type'); // optional
  const houseId = searchParams.get('houseId'); // optional
  const includeGlobal = searchParams.get('includeGlobal') !== 'false'; // default true

  const or: any[] = [];
  if (houseId) or.push({ houseId });
  if (includeGlobal) or.push({ houseId: null });

  const filter: any = { isActive: true };
  if (type === 'income' || type === 'expense') filter.type = type;
  if (or.length) filter.$or = or;

  const items = await FinanceCategory.find(filter).sort({ type: 1, name: 1 });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  await dbConnect();
  const raw = await req.json().catch(() => ({}));
  const parsed = createSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ message: 'Dữ liệu không hợp lệ', errors: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;
  const doc = await FinanceCategory.create({
    ...data,
    houseId: data.houseId ?? null
  });
  return NextResponse.json(doc, { status: 201 });
}
