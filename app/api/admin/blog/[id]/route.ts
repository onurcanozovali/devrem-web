import { NextResponse } from 'next/server';
import {
  assertSameOrigin,
  authorizeAdminRequest,
} from '@/lib/admin/session';
import { recordAudit } from '@/lib/admin/audit';
import {
  BlogSlugConflictError,
  getAdminBlogPost,
  deleteBlogPost,
  updateBlogPost,
} from '@/lib/blog/repository';
import { BlogValidationError, parseBlogPostInput } from '@/src/blog/validation';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: RouteContext) {
  const authorization = await authorizeAdminRequest(request, 'blog.read');
  if (!authorization.ok) {
    return NextResponse.json({ error: 'Bu işlem için yetkiniz yok.' }, { status: authorization.status });
  }
  try {
    const { id } = await params;
    const post = await getAdminBlogPost(id);
    if (!post) {
      return NextResponse.json({ error: 'Yazı bulunamadı.' }, { status: 404 });
    }
    return NextResponse.json({ post });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Yazı alınamadı.' },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    assertSameOrigin(request);
    const authorization = await authorizeAdminRequest(request, 'blog.write');
    if (!authorization.ok) return NextResponse.json({ error: 'Bu işlem için yetkiniz yok.' }, { status: authorization.status });
    const { id } = await params;
    const body = (await request.json()) as { post?: unknown };
    const input = parseBlogPostInput(body.post, { postId: id });
    const post = await updateBlogPost(id, input);
    if (!post) {
      return NextResponse.json({ error: 'Yazı bulunamadı.' }, { status: 404 });
    }
    await recordAudit({ action: 'BLOG_UPDATED', admin: authorization.session, targetType: 'blogPost', targetId: id, reason: 'Blog editöründe yazı güncellendi.', metadata: { status: post.status, slug: post.slug } });
    return NextResponse.json({ post });
  } catch (error) {
    const status =
      error instanceof BlogValidationError
        ? 400
        : error instanceof BlogSlugConflictError
          ? 409
          : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Yazı güncellenemedi.' },
      { status },
    );
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    assertSameOrigin(request);
    const authorization = await authorizeAdminRequest(request, 'blog.write');
    if (!authorization.ok) return NextResponse.json({ error: 'Bu işlem için yetkiniz yok.' }, { status: authorization.status });
    const { id } = await params;
    if (!(await deleteBlogPost(id))) {
      return NextResponse.json({ error: 'Yazı bulunamadı.' }, { status: 404 });
    }
    await recordAudit({ action: 'BLOG_DELETED', admin: authorization.session, targetType: 'blogPost', targetId: id, reason: 'Blog editöründe yazı silindi.' });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Yazı silinemedi.' },
      { status: 500 },
    );
  }
}
