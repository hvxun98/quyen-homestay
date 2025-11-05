import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { dbConnect } from 'lib/mongodb';
import User from 'models/User';
import { signAccess } from 'lib/auth';
import Session from 'models/Session';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  await dbConnect();

  const { email, password } = await req.json();
  const user = await User.findOne({ email });
  if (!user) return NextResponse.json({ error: 'Thông tin đăng nhập chưa đúng' }, { status: 401 });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return NextResponse.json({ error: 'Thông tin đăng nhập chưa đúng' }, { status: 401 });

  const accessToken = signAccess(String(user._id), user.role);
  const refreshToken = crypto.randomBytes(32).toString('hex');
  const refreshHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await Session.create({ userId: user._id, refreshTokenHash: refreshHash, expiresAt });

  const res = NextResponse.json({ accessToken });
  res.cookies.set('refresh_token', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 30 * 24 * 60 * 60
  });
  return res;
}
