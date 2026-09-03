import { NextResponse, type NextRequest } from 'next/server';
import { isIndexingEnabled } from '@/src/config/seo';

export function proxy(request: NextRequest) {
  const forwardedProtocol = request.headers.get('x-forwarded-proto');
  const isCanonicalHost = request.nextUrl.hostname === 'devrem.co';
  const isWwwHost = request.nextUrl.hostname === 'www.devrem.co';
  const isInsecureCanonical =
    isCanonicalHost &&
    (request.nextUrl.protocol === 'http:' || forwardedProtocol === 'http');

  if (isWwwHost || isInsecureCanonical) {
    const canonical = request.nextUrl.clone();
    canonical.protocol = 'https:';
    canonical.hostname = 'devrem.co';
    canonical.port = '';
    return NextResponse.redirect(canonical, 308);
  }

  const response = NextResponse.next();
  if (!isIndexingEnabled) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
