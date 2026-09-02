import { NextResponse } from 'next/server';
import {
  assertSameOrigin,
  authorizeAdminRequest,
} from '@/lib/admin/session';
import { recordAudit } from '@/lib/admin/audit';
import {
  setBlogPostStatus,
} from '@/lib/blog/repository';

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteContext) {
  try {
    assertSameOrigin(request);
    const authorization = await authorizeAdminRequest(request, 'blog.write');
    if (!authorization.ok) return NextResponse.json({ error: 'Bu işlem için yetkiniz yok.' }, { status: authorization.status });
    const body = (await request.json()) as { status?: unknown };
    if (body.status !== 'draft' && body.status !== 'published') {
      return NextResponse.json({ error: 'Durum geçerli değil.' }, { status: 400 });
    }
    const { id } = await params;
    const post = await setBlogPostStatus(id, body.status);
    if (!post) {
      return NextResponse.json({ error: 'Yazı bulunamadı.' }, { status: 404 });
    }
    await recordAudit({ action: 'BLOG_STATUS_CHANGED', admin: authorization.session, targetType: 'blogPost', targetId: id, reason: body.status === 'published' ? 'Blog yazısı yayınlandı.' : 'Blog yazısı yayından kaldırıldı.', metadata: { status: body.status } });
    return NextResponse.json({ post });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Durum değiştirilemedi.' },
      { status: 500 },
    );
  }
}
