// src/app/api/authenticate/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();
  const { username, password } = body;

  if (!username || !password) {
    return NextResponse.json({ error: { message: 'Sai username hoặc password' } }, { status: 400 });
  }

  try {
    if (username === 'admin' && password === '123456aA@') {
      const fakeToken = 'fake-jwt-token-' + Date.now();
      return NextResponse.json({ id_token: fakeToken });
    }

    return NextResponse.json({ error: { message: 'Sai tên đăng nhập hoặc mật khẩu' } }, { status: 401 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: { message: 'Lỗi máy chủ' } }, { status: 500 });
  }
}
