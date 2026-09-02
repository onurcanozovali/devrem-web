import { NextResponse } from 'next/server';
import {
  assertSameOrigin,
  authorizeAdminRequest,
} from '@/lib/admin/session';
import { recordAudit } from '@/lib/admin/audit';
import {
  BlogSlugConflictError,
  createBlogPost,
  listAdminBlogPosts,
} from '@/lib/blog/repository';
import { BlogValidationError, parseBlogPostInput } from '@/src/blog/validation';

export async function GET(request: Request) {
  const authorization = await authorizeAdminRequest(request, 'blog.read');
  if (!authorization.ok) {
    return NextResponse.json({ error: 'Bu işlem için yetkiniz yok.' }, { status: authorization.status });
  }
  try {
    return NextResponse.json({ posts: await listAdminBlogPosts() });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Yazılar alınamadı.' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const authorization = await authorizeAdminRequest(request, 'blog.write');
    if (!authorization.ok) return NextResponse.json({ error: 'Bu işlem için yetkiniz yok.' }, { status: authorization.status });
    const body = (await request.json()) as { id?: unknown; post?: unknown };
    const suppliedId = typeof body.id === 'string' ? body.id.trim() : '';
    const id = suppliedId || crypto.randomUUID();
    if (!/^[a-zA-Z0-9_-]{8,160}$/.test(id)) {
      return NextResponse.json({ error: 'Yazı kimliği geçerli değil.' }, { status: 400 });
    }
    const input = parseBlogPostInput(body.post, { postId: id });
    const post = await createBlogPost(id, input);
    await recordAudit({ action: 'BLOG_CREATED', admin: authorization.session, targetType: 'blogPost', targetId: id, reason: 'Blog editöründe yeni yazı oluşturuldu.', metadata: { status: post.status, slug: post.slug } });
    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    const status =
      error instanceof BlogValidationError
        ? 400
        : error instanceof BlogSlugConflictError
          ? 409
          : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Yazı kaydedilemedi.' },
      { status },
    );
  }
}
