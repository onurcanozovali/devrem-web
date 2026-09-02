import { NextResponse } from 'next/server';
import { listPublishedBlogPosts } from '@/lib/blog/repository';

function normalize(value: string) {
  return value
    .toLocaleLowerCase('tr-TR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[ıİ]/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ş/g, 's')
    .replace(/ç/g, 'c')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u');
}

export async function GET(request: Request) {
  const query = normalize(new URL(request.url).searchParams.get('q')?.trim() ?? '');
  if (query.length < 1 || query.length > 100) {
    return NextResponse.json({ results: [] });
  }
  try {
    const posts = await listPublishedBlogPosts();
    const results = posts
      .filter((post) =>
        normalize(
          [
            post.title,
            post.excerpt,
            post.category,
            ...(post.standfirst ?? []),
            ...(post.quickSummary ?? []),
            ...post.sections.flatMap((section) => [
              section.heading,
              ...(section.subsections?.map((item) => item.heading) ?? []),
            ]),
          ].join(' '),
        ).includes(query),
      )
      .slice(0, 6)
      .map((post) => ({
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        category: post.category,
      }));
    return NextResponse.json(
      { results },
      { headers: { 'cache-control': 'no-store' } },
    );
  } catch {
    return NextResponse.json({ results: [] }, { status: 503 });
  }
}
