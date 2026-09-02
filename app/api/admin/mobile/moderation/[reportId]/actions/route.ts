import { NextResponse } from 'next/server';
import { authorizeAdminRequest, assertSameOrigin } from '@/lib/admin/session';
import {
  updateModerationReport,
  updateReportedMessageVisibility,
} from '@/lib/admin/operations';

type RouteContext = { params: Promise<{ reportId: string }> };

export async function POST(request: Request, { params }: RouteContext) {
  try {
    assertSameOrigin(request);
    const authorization = await authorizeAdminRequest(request, 'reports.moderate');
    if (!authorization.ok) {
      return NextResponse.json(
        { error: authorization.status === 401 ? 'Oturum gerekli.' : 'Bu işlem için yetkiniz yok.' },
        { status: authorization.status },
      );
    }
    const { reportId } = await params;
    const body = (await request.json()) as {
      action?: unknown;
      status?: unknown;
      note?: unknown;
      reason?: unknown;
    };
    const result =
      body.action === 'status'
        ? await updateModerationReport({
            reportId,
            status: body.status,
            note: body.note,
            reason: body.reason,
            admin: authorization.session,
          })
        : body.action === 'hideMessage'
          ? await updateReportedMessageVisibility({
              reportId,
              hidden: true,
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
      { error: error instanceof Error ? error.message : 'Moderasyon işlemi tamamlanamadı.' },
      { status: 400 },
    );
  }
}
