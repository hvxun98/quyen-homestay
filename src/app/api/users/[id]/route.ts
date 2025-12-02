// src/app/api/users/[id]/route.ts
import { NextResponse } from 'next/server';
import { dbConnect } from 'lib/mongodb';
import { Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import User, { IUser } from 'models/User';
import UserHouseAccess from 'models/UserHouseAccess';
import { ensureAdminOrThrow, stripUser, validateHouseIdsOrThrow } from '../_helpers';
import { z } from 'zod';

const idParam = z.object({ id: z.string().length(24) });

const updateSchema = z.object({
  name: z.string().trim().optional(),
  email: z.string().email().optional(),
  role: z.enum(['admin', 'staff']).optional(),
  houseIds: z.array(z.string().length(24)).optional(), // chỉ dùng khi role=staff
  password: z.string().min(6).optional()
});

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  try {
    await ensureAdminOrThrow();
    const { id } = idParam.parse(params);

    const agg = (await User.aggregate([
      { $match: { _id: new Types.ObjectId(id) } },
      { $lookup: { from: 'userhouseaccesses', localField: '_id', foreignField: 'userId', as: 'links' } },
      { $lookup: { from: 'houses', localField: 'links.houseId', foreignField: '_id', as: 'houses' } },
      { $project: { passwordHash: 0, links: 0 } }
    ])) as any[]; // 👈 luôn là mảng

    const u = agg[0]; // 👈 lấy phần tử đầu
    if (!u) return NextResponse.json({ message: 'Không tìm thấy user.' }, { status: 404 });

    u.houses = (u.houses || []).map((h: any) => ({ _id: h._id, code: h.code, address: h.address }));
    return NextResponse.json(stripUser(u));
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || 'Lỗi hệ thống.' }, { status: e?.status || 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  try {
    await ensureAdminOrThrow();
    const { id } = idParam.parse(params);

    // ✅ Lấy user bằng findById để có object (không phải mảng) => đọc .role an toàn
    const found = await User.findById(id).lean<IUser | null>();
    if (!found) return NextResponse.json({ message: 'Không tìm thấy user.' }, { status: 404 });

    const body = await req.json();
    const data = updateSchema.parse(body);

    const update: any = {};
    if (data.name !== undefined) update.name = data.name;
    if (data.email !== undefined) {
      const existed = await User.findOne({ email: data.email.toLowerCase(), _id: { $ne: new Types.ObjectId(id) } }).lean();
      if (existed) return NextResponse.json({ message: 'Email đã tồn tại.' }, { status: 400 });
      update.email = data.email.toLowerCase();
    }
    if (data.password) {
      update.passwordHash = await bcrypt.hash(data.password, 10);
    }
    if (data.role !== undefined) {
      update.role = data.role;
    }

    await User.updateOne({ _id: id }, { $set: update });

    const effectiveRole: 'admin' | 'staff' = (data.role ?? found.role) as any;

    if (effectiveRole === 'admin') {
      // admin: bỏ toàn bộ mapping
      await UserHouseAccess.deleteMany({ userId: new Types.ObjectId(id) });
    } else {
      // staff: cần houseIds để đồng bộ
      if (!data.houseIds) {
        return NextResponse.json({ message: 'Vui lòng chọn danh sách house cho staff.' }, { status: 400 });
      }
      const okIds = await validateHouseIdsOrThrow(data.houseIds);

      const existing = await UserHouseAccess.find({ userId: new Types.ObjectId(id) })
        .select('houseId')
        .lean();
      const existingSet = new Set(existing.map((x) => String(x.houseId)));
      const nextSet = new Set(okIds);

      const toRemove = [...existingSet].filter((h) => !nextSet.has(h));
      if (toRemove.length) {
        await UserHouseAccess.deleteMany({
          userId: new Types.ObjectId(id),
          houseId: { $in: toRemove.map((h) => new Types.ObjectId(h)) }
        });
      }

      const toAdd = [...nextSet].filter((h) => !existingSet.has(h));
      if (toAdd.length) {
        await UserHouseAccess.insertMany(
          toAdd.map((h) => ({ userId: new Types.ObjectId(id), houseId: new Types.ObjectId(h) })),
          { ordered: false }
        );
      }
    }

    // Trả về user kèm houses bằng aggregate (mảng) → lấy phần tử đầu
    const agg = (await User.aggregate([
      { $match: { _id: new Types.ObjectId(id) } },
      { $lookup: { from: 'userhouseaccesses', localField: '_id', foreignField: 'userId', as: 'links' } },
      { $lookup: { from: 'houses', localField: 'links.houseId', foreignField: '_id', as: 'houses' } },
      { $project: { passwordHash: 0, links: 0 } }
    ])) as any[];

    const u = agg[0] || null;
    if (u) u.houses = (u.houses || []).map((h: any) => ({ _id: h._id, code: h.code, address: h.address }));

    return NextResponse.json(stripUser(u));
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || 'Lỗi hệ thống.' }, { status: e?.status || 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  try {
    await ensureAdminOrThrow();
    const { id } = idParam.parse(params);

    // ✅ Lấy user bằng findById (object) để đọc .role
    const u = await User.findById(id).lean<IUser | null>();
    if (!u) return NextResponse.json({ message: 'Không tìm thấy user.' }, { status: 404 });

    if (u.role === 'admin') {
      const remainAdmins = await User.countDocuments({ role: 'admin', _id: { $ne: new Types.ObjectId(id) } });
      if (remainAdmins === 0) {
        return NextResponse.json({ message: 'Không thể xoá admin cuối cùng của hệ thống.' }, { status: 400 });
      }
    }

    await UserHouseAccess.deleteMany({ userId: new Types.ObjectId(id) });
    await User.deleteOne({ _id: new Types.ObjectId(id) });

    return NextResponse.json({ message: 'Đã xoá user.', id });
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || 'Lỗi hệ thống.' }, { status: e?.status || 500 });
  }
}
