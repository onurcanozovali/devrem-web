import { NextResponse } from 'next/server';
import { assertSameOrigin, authorizeAdminRequest } from '@/lib/admin/session';
import { recordAudit } from '@/lib/admin/audit';
import {
  getFirebaseAccessToken,
  getFirebaseStorageBucket,
} from '@/lib/firebase/server';
import { BlogValidationError, isAllowedBlogImage } from '@/src/blog/validation';

type RouteContext = { params: Promise<{ id: string }> };
type ImageKind = 'cover' | 'og' | 'content';

function detectedMime(bytes: Uint8Array) {
  if (
    String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' &&
    String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP'
  )
    return 'image/webp';
  return null;
}

function imageKind(request: Request): ImageKind | null {
  const value = new URL(request.url).searchParams.get('kind');
  return value === 'cover' || value === 'og' || value === 'content'
    ? value
    : null;
}

function storagePath(postId: string, kind: ImageKind) {
  if (kind === 'cover') return `blog/${postId}/cover.webp`;
  if (kind === 'og') return `blog/${postId}/og.webp`;
  return `blog/${postId}/content/${Date.now()}-${crypto.randomUUID()}.webp`;
}

export async function POST(request: Request, { params }: RouteContext) {
  try {
    assertSameOrigin(request);
    const authorization = await authorizeAdminRequest(request, 'blog.write');
    if (!authorization.ok) return NextResponse.json({ error: 'Bu işlem için yetkiniz yok.' }, { status: authorization.status });
    const { id } = await params;
    if (!/^[a-zA-Z0-9_-]{8,160}$/.test(id)) {
      return NextResponse.json(
        { error: 'Yazı kimliği geçerli değil.' },
        { status: 400 },
      );
    }
    const kind = imageKind(request);
    if (!kind) {
      return NextResponse.json(
        { error: 'Görsel hedefi geçerli değil.' },
        { status: 400 },
      );
    }
    const contentType =
      request.headers.get('content-type')?.split(';')[0] ?? '';
    const declaredSize = Number(request.headers.get('content-length') ?? 0);
    if (declaredSize > 0) {
      isAllowedBlogImage({ size: declaredSize, type: contentType });
    }

    const bytes = new Uint8Array(await request.arrayBuffer());
    isAllowedBlogImage({ size: bytes.byteLength, type: contentType });
    if (detectedMime(bytes) !== 'image/webp') {
      return NextResponse.json(
        { error: 'Dosya geçerli bir WebP görseli değil.' },
        { status: 400 },
      );
    }

    const bucket = getFirebaseStorageBucket();
    const objectPath = storagePath(id, kind);
    const query = new URLSearchParams({
      uploadType: 'media',
      name: objectPath,
    });
    const response = await fetch(
      `https://storage.googleapis.com/upload/storage/v1/b/${encodeURIComponent(bucket)}/o?${query.toString()}`,
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${await getFirebaseAccessToken()}`,
          'content-type': 'image/webp',
          'x-goog-meta-owner': 'devrem-blog-admin',
          'x-goog-meta-post-id': id,
          'x-goog-meta-kind': kind,
        },
        body: bytes,
      },
    );
    if (!response.ok) {
      throw new Error(`Görsel Storage'a yüklenemedi (${response.status}).`);
    }
    const url = `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(bucket)}/o/${encodeURIComponent(objectPath)}?alt=media&v=${Date.now()}`;
    await recordAudit({ action: 'BLOG_MEDIA_UPDATED', admin: authorization.session, targetType: 'blogPost', targetId: id, reason: 'Blog editöründe görsel yüklendi.', metadata: { kind, path: objectPath } });
    return NextResponse.json({ path: objectPath, url, mimeType: 'image/webp' });
  } catch (error) {
    const status = error instanceof BlogValidationError ? 400 : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Görsel yüklenemedi.' },
      { status },
    );
  }
}
