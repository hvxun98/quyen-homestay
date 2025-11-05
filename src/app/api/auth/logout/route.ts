import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { dbConnect } from 'lib/mongodb';
import Session from 'models/Session';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  await dbConnect();
  const cookie = (await req.headers.get('cookie')) || '';
  const token = /refresh_token=([^;]+)/.exec(cookie)?.[1];
  if (token) {
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    await Session.deleteOne({ refreshTokenHash: hash });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set('refresh_token', '', { httpOnly: true, expires: new Date(0), path: '/' });
  return res;
}
