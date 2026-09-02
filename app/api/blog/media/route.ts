import { NextResponse } from 'next/server';
import { fetchFirebaseStorageObject } from '@/lib/firebase/server';
import { getFirestoreDocument } from '@/lib/firebase/server';
import { authorizeAdminRequest } from '@/lib/admin/session';

const blogMediaPath =
  /^blog\/[a-zA-Z0-9_-]{8,160}\/[a-zA-Z0-9_/-]{1,240}\.(?:webp|png|jpe?g|gif)$/;

function validatedPath(request: Request) {
  const path = new URL(request.url).searchParams.get('path') ?? '';
  if (!blogMediaPath.test(path) || path.includes('..') || path.includes('//')) {
    return null;
  }
  return path;
}

export async function GET(request: Request) {
  const path = validatedPath(request);
  if (!path) {
    return NextResponse.json(
      { error: 'Görsel yolu geçerli değil.' },
      { status: 400 },
    );
  }
  const postId = path.split('/')[1] ?? '';
  const post = await getFirestoreDocument('blogPosts', postId);
  if (post?.data.status !== 'published') {
    const authorization = await authorizeAdminRequest(request, 'blog.read');
    if (!authorization.ok) {
      return NextResponse.json({ error: 'Görsel bulunamadı.' }, { status: 404 });
    }
  }

  const upstream = await fetchFirebaseStorageObject(path);
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json(
      {
        error:
          upstream.status === 404 ? 'Görsel bulunamadı.' : 'Görsel okunamadı.',
      },
      { status: upstream.status === 404 ? 404 : 502 },
    );
  }

  const contentType = upstream.headers.get('content-type') ?? '';
  if (!contentType.startsWith('image/')) {
    return NextResponse.json({ error: 'Dosya görsel değil.' }, { status: 415 });
  }

  const versioned = new URL(request.url).searchParams.has('v');
  const headers = new Headers({
    'cache-control': versioned
      ? 'public, max-age=31536000, immutable'
      : 'public, max-age=3600, stale-while-revalidate=86400',
    'content-type': contentType,
    'x-content-type-options': 'nosniff',
  });
  for (const name of ['content-length', 'etag', 'last-modified']) {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  }

  return new Response(upstream.body, { status: 200, headers });
}
