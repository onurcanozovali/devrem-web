import { NextResponse } from 'next/server';
import { authorizeAdminRequest, assertSameOrigin } from '@/lib/admin/session';
import { changeAdminRole } from '@/lib/admin/operations';
import { listFirebaseAdminUsers } from '@/lib/firebase/auth-admin';
import { isAdminRole } from '@/src/admin/access';

type RouteContext = { params: Promise<{ uid: string }> };

export async function POST(request: Request, { params }: RouteContext) {
  try {
    assertSameOrigin(request);
    const authorization = await authorizeAdminRequest(request, 'admins.write');
    if (!authorization.ok) {
      return NextResponse.json(
        { error: authorization.status === 401 ? 'Oturum gerekli.' : 'Bu işlem için yetkiniz yok.' },
        { status: authorization.status },
      );
    }
    const { uid } = await params;
    const body = (await request.json()) as { role?: unknown; reason?: unknown };
    const admins = await listFirebaseAdminUsers();
    const target = admins.find((item) => item.uid === uid);
    if (!target) return NextResponse.json({ error: 'Admin bulunamadı.' }, { status: 404 });
    const role = body.role === null || body.role === '' || isAdminRole(body.role) ? body.role : undefined;
    if (role === undefined) return NextResponse.json({ error: 'Rol geçerli değil.' }, { status: 400 });
    const result = await changeAdminRole({
      uid,
      role,
      reason: body.reason,
      admin: authorization.session,
      superAdminCount: admins.filter((item) => item.role === 'super_admin').length,
      targetRole: target.role,
    });
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Admin rolü güncellenemedi.' },
      { status: 400 },
    );
  }
}
