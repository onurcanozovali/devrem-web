import { NextResponse } from 'next/server';
import {
  adminSessionCookie,
  assertSameOrigin,
  requireAdminRequest,
} from '@/lib/admin/session';

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    if (!(await requireAdminRequest(request))) {
      return NextResponse.json({ error: 'Oturum bulunamadı.' }, { status: 401 });
    }
    const response = NextResponse.json({ ok: true });
    response.cookies.set(adminSessionCookie.name, '', {
      ...adminSessionCookie.options,
      maxAge: 0,
    });
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Çıkış yapılamadı.' },
      { status: 400 },
    );
  }
}
