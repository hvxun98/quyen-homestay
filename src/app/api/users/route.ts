import { NextResponse } from 'next/server';
import { dbConnect } from 'lib/mongodb';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { Types } from 'mongoose';
import User from 'models/User';
import UserHouseAccess from 'models/UserHouseAccess';
import { ensureAdminOrThrow, stripUser, validateHouseIdsOrThrow } from './_helpers';

const listQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().trim().optional(),
  role: z.enum(['admin', 'staff']).optional()
});

const createSchema = z.object({
  name: z.string().trim().optional(),
  email: z.string().email(),
  password: z.string().min(6).optional(),
  role: z.enum(['admin', 'staff']),
  houseIds: z.array(z.string().length(24)).optional() // chỉ dùng khi staff
});

export async function GET(req: Request) {
  await dbConnect();
  try {
    await ensureAdminOrThrow();

    const sp = Object.fromEntries(new URL(req.url).searchParams.entries());
    const { page, limit, q, role } = listQuery.parse(sp);
    const filter: any = {};
    if (q) {
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ name: rx }, { email: rx }];
    }
    if (role) filter.role = role;

    const skip = (page - 1) * limit;

    const items = (await User.aggregate([
      { $match: filter },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: 'userhouseaccesses',
          localField: '_id',
          foreignField: 'userId',
          as: 'links'
        }
      },
      {
        $lookup: {
          from: 'houses',
          localField: 'links.houseId',
          foreignField: '_id',
          as: 'houses'
        }
      },
      { $project: { passwordHash: 0, links: 0 } }
    ])) as any[];

    const total = await User.countDocuments(filter);

    const normalized = items.map((u) => ({
      ...u,
      houses: (u.houses || []).map((h: any) => ({ _id: h._id, code: h.code, address: h.address }))
    }));

    return NextResponse.json({ items: normalized.map(stripUser), total, page, limit });
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || 'Lỗi hệ thống.' }, { status: e?.status || 500 });
  }
}

export async function POST(req: Request) {
  await dbConnect();
  try {
    await ensureAdminOrThrow();

    const body = await req.json();
    const data = createSchema.parse(body);

    const existed = await User.findOne({ email: data.email.toLowerCase() });
    if (existed) return NextResponse.json({ message: 'Email đã tồn tại.' }, { status: 400 });

    const userDoc: any = {
      email: data.email.toLowerCase(),
      role: data.role
    };
    if (data.name) userDoc.name = data.name;
    const pwd = data.password || Math.random().toString(36);
    userDoc.passwordHash = await bcrypt.hash(pwd, 10);

    const created = await User.create(userDoc);

    if (data.role === 'staff') {
      const okIds = await validateHouseIdsOrThrow(data.houseIds || []);
      if (okIds.length) {
        await UserHouseAccess.insertMany(
          okIds.map((h) => ({ userId: new Types.ObjectId(created._id), houseId: new Types.ObjectId(h) })),
          { ordered: false }
        );
      }
    }

    const agg = (await User.aggregate([
      { $match: { _id: new Types.ObjectId(created._id) } },
      { $lookup: { from: 'userhouseaccesses', localField: '_id', foreignField: 'userId', as: 'links' } },
      { $lookup: { from: 'houses', localField: 'links.houseId', foreignField: '_id', as: 'houses' } },
      { $project: { passwordHash: 0, links: 0 } }
    ])) as any[];

    const u = agg[0];
    if (u) u.houses = (u.houses || []).map((h: any) => ({ _id: h._id, code: h.code, address: h.address }));

    return NextResponse.json(stripUser(u), { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || 'Lỗi hệ thống.' }, { status: e?.status || 500 });
  }
}
