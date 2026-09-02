import { NextResponse } from 'next/server';
import { authorizeAdminRequest, assertSameOrigin } from '@/lib/admin/session';
import {
  updatePublicProfileVisibility,
  updateUserAccountStatus,
} from '@/lib/admin/operations';

type RouteContext = { params: Promise<{ uid: string }> };

export async function POST(request: Request, { params }: RouteContext) {
  try {
    assertSameOrigin(request);
    const authorization = await authorizeAdminRequest(request, 'users.moderate');
    if (!authorization.ok) {
      return NextResponse.json(
        { error: authorization.status === 401 ? 'Oturum gerekli.' : 'Bu işlem için yetkiniz yok.' },
        { status: authorization.status },
      );
    }
    const { uid } = await params;
    const body = (await request.json()) as {
      action?: unknown;
      status?: unknown;
      hidden?: unknown;
      reason?: unknown;
    };
    const result =
      body.action === 'accountStatus'
        ? await updateUserAccountStatus({
            uid,
            status: body.status,
            reason: body.reason,
            admin: authorization.session,
          })
        : body.action === 'profileVisibility'
          ? await updatePublicProfileVisibility({
              uid,
              hidden: body.hidden,
              reason: body.reason,
              admin: authorization.session,
            })
          : null;
    if (!result) {
      return NextResponse.json({ error: 'İşlem türü geçerli değil.' }, { status: 400 });
    }
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Kullanıcı işlemi tamamlanamadı.' },
      { status: 400 },
    );
  }
}
