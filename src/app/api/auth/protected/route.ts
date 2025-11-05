import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from 'utils/authOptions';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    return NextResponse.json({ protected: !!session });
  } catch (err) {
    console.error('Error reading session:', err);
    return NextResponse.json({ protected: false, error: 'Session check failed' });
  }
}
