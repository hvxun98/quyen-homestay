import { NextResponse } from 'next/server';
import { z } from 'zod';
import { dbConnect } from 'lib/mongodb';
import FileAsset from 'models/FileAsset';

const schema = z.object({
  provider: z.enum(['cloudinary', 's3', 'local']).default('cloudinary'),
  url: z.string().url(),
  mimeType: z.string().optional(),
  bytes: z.number().int().optional(),
  width: z.number().int().optional(),
  height: z.number().int().optional(),
  originalName: z.string().optional(),
  uploadedBy: z.string().optional() // hoặc lấy từ auth
});

export async function POST(req: Request) {
  await dbConnect();
  const raw = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ message: 'Dữ liệu không hợp lệ', errors: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  const file = await FileAsset.create({
    ...data,
    uploadedBy: data.uploadedBy, // thay bằng user từ auth nếu có
    uploadedAt: new Date()
  });

  return NextResponse.json(file, { status: 201 });
}
