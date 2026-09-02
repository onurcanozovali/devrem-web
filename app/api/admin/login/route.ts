import { NextResponse } from 'next/server';
import {
  adminSessionCookie,
  assertSameOrigin,
  authenticateAdminCredentials,
  createAdminSessionToken,
} from '@/lib/admin/session';

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const body = (await request.json()) as {
      username?: unknown;
      password?: unknown;
    };
    const username = typeof body.username === 'string' ? body.username : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const identity = await authenticateAdminCredentials(username, password);
    if (!identity) {
      await new Promise((resolve) => setTimeout(resolve, 350));
      return NextResponse.json(
        { error: 'Kullanıcı adı veya parola hatalı.' },
        { status: 401 },
      );
    }
    const response = NextResponse.json({ ok: true });
    response.cookies.set(
      adminSessionCookie.name,
      await createAdminSessionToken(identity),
      adminSessionCookie.options,
    );
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Giriş yapılamadı.' },
      { status: 400 },
    );
  }
}
