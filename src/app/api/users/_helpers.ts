import { getServerSession } from 'next-auth';

import User from 'models/User';
import type { IUser } from 'models/User';
import House from 'models/House';
import { Types } from 'mongoose';
import { authOptions } from 'utils/authOptions';

export function isValidObjectId(id?: string | null) {
  return !!id && Types.ObjectId.isValid(id);
}

export async function getSessionUser(): Promise<IUser | null> {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) return null;
  return await User.findOne({ email }).lean<IUser | null>();
}

export async function ensureAdminOrThrow(): Promise<IUser> {
  const me = await getSessionUser();
  if (!me) throw { status: 401, message: 'Chưa đăng nhập.' };
  if (me.role !== 'admin') throw { status: 403, message: 'Bạn không có quyền thao tác' };
  return me;
}

export async function validateHouseIdsOrThrow(houseIds: string[]) {
  const unique = Array.from(new Set((houseIds || []).filter(Boolean)));
  if (!unique.length) throw { status: 400, message: 'Vui lòng chọn ít nhất một cơ sở.' };
  if (unique.some((id) => !isValidObjectId(id))) throw { status: 400, message: 'Danh sách cơ sở không hợp lệ.' };

  const cnt = await House.countDocuments({ _id: { $in: unique.map((id) => new Types.ObjectId(id)) } });
  if (cnt !== unique.length) throw { status: 400, message: 'Cơ sở không có trong hệ thống.' };
  return unique;
}

export function stripUser<T = any>(u: T): T {
  if (!u) return u;
  const out: any = { ...(u as any) };
  if ('passwordHash' in out) delete out.passwordHash;
  return out;
}
