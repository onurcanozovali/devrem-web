import { NextResponse } from 'next/server';
import { authorizeAdminRequest, assertSameOrigin } from '@/lib/admin/session';
import { updateGroupStatus } from '@/lib/admin/operations';

type RouteContext = { params: Promise<{ groupId: string }> };

export async function POST(request: Request, { params }: RouteContext) {
  try {
    assertSameOrigin(request);
    const authorization = await authorizeAdminRequest(request, 'groups.manage');
    if (!authorization.ok) {
      return NextResponse.json(
        { error: authorization.status === 401 ? 'Oturum gerekli.' : 'Bu işlem için yetkiniz yok.' },
        { status: authorization.status },
      );
    }
    const { groupId } = await params;
    const body = (await request.json()) as { disabled?: unknown; reason?: unknown };
    const result = await updateGroupStatus({
      groupId,
      disabled: body.disabled,
      reason: body.reason,
      admin: authorization.session,
    });
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Grup işlemi tamamlanamadı.' },
      { status: 400 },
    );
  }
}
