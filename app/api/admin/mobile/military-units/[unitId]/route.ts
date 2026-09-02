import { NextResponse } from 'next/server';
import { authorizeAdminRequest, assertSameOrigin } from '@/lib/admin/session';
import { saveMilitaryUnit } from '@/lib/admin/operations';

type RouteContext = { params: Promise<{ unitId: string }> };

export async function POST(request: Request, { params }: RouteContext) {
  try {
    assertSameOrigin(request);
    const authorization = await authorizeAdminRequest(request, 'units.write');
    if (!authorization.ok) {
      return NextResponse.json(
        { error: authorization.status === 401 ? 'Oturum gerekli.' : 'Bu işlem için yetkiniz yok.' },
        { status: authorization.status },
      );
    }
    const { unitId } = await params;
    const body = (await request.json()) as { unit?: unknown; reason?: unknown };
    const unit = await saveMilitaryUnit({
      unitId,
      input: body.unit,
      reason: body.reason,
      admin: authorization.session,
    });
    return NextResponse.json({ ok: true, unit });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Birlik kaydedilemedi.' },
      { status: 400 },
    );
  }
}
