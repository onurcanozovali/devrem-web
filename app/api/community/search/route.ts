import { NextResponse } from 'next/server';
import { searchPublishedCommunity } from '@/lib/community/repository';
import { normalizePlainText } from '@/lib/community/text';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const query = normalizePlainText(new URL(request.url).searchParams.get('q'));
  if (query.length < 2) {
    return NextResponse.json({ results: [] });
  }
  if (query.length > 80) {
    return NextResponse.json(
      { error: 'Arama en fazla 80 karakter olabilir.' },
      { status: 400 },
    );
  }
  try {
    const results = await searchPublishedCommunity(query);
    return NextResponse.json(
      { results },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch {
    return NextResponse.json(
      { error: 'Arama şu anda kullanılamıyor. Lütfen tekrar dene.' },
      { status: 500 },
    );
  }
}
