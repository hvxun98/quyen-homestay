// app/api/auth/refresh/route.ts
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { dbConnect } from 'lib/mongodb';
import Session from 'models/Session';

export async function POST(req: Request) {
  await dbConnect();
  const cookie = (await req.headers.get('cookie')) || '';
  const token = /refresh_token=([^;]+)/.exec(cookie)?.[1];
  if (!token) return NextResponse.json({ error: 'No refresh token' }, { status: 401 });

  const hash = crypto.createHash('sha256').update(token).digest('hex');
  const session = await Session.findOne({ refreshTokenHash: hash, expiresAt: { $gt: new Date() } });
  if (!session) return NextResponse.json({ error: 'Invalid refresh' }, { status: 401 });

  const accessToken = jwt.sign({ sub: String(session.userId) }, process.env.JWT_SECRET!, { expiresIn: '15m' });
  return NextResponse.json({ accessToken });
}
