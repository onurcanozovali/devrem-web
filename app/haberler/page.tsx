import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CalendarDays, Newspaper } from 'lucide-react';
import { Container } from '@/components/site/container';
import { listPublishedBlogPosts } from '@/lib/blog/repository';
import { createPageMetadata } from '@/src/config/seo';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = createPageMetadata({
  title: 'Askerlik Haberleri ve Güncel Duyurular',
  description:
    'MSB duyuruları, celp ve sevk gelişmeleri, bedelli askerlik güncellemeleri ve sınıflandırma haberlerini takip edin.',
  path: '/haberler',
});

const topics = [
  ['MSB duyuruları', 'Resmî açıklamalara dayanan önemli askerlik gelişmeleri.'],
  ['Celp ve sevk', 'Sınıflandırma sonuçları, sevk grupları ve teslim tarihleri.'],
  ['Bedelli güncellemeleri', 'Yeni dönem ücretleri ve karşılaştırmalı bedelli verileri.'],
  ['Sınıflandırma gelişmeleri', 'Askerlik yerleri ve sonuç açıklama süreçleri.'],
] as const;

export default async function NewsPage() {
  const posts = (await listPublishedBlogPosts())
    .filter((post) => /msb|duyuru|celp|sevk|bedelli|sınıflandırma/i.test(`${post.title} ${post.category}`))
    .sort((a, b) => b.publishedIso.localeCompare(a.publishedIso));

  return (
    <main id="ana-icerik">
      <section className="platform-section">
        <Container>
          <header className="page-hero max-w-4xl">
            <p className="page-hero-meta">Tarihli içerik akışı</p>
            <h1 className="page-title">Askerlik Haberleri</h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-secondary-foreground sm:text-lg">
              Celp, sevk, sınıflandırma ve bedelli askerlik gündemini yayın tarihi
              ve kaynak bağlamıyla takip et.
            </p>
          </header>

          <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Haber başlıkları">
            {topics.map(([title, description]) => (
              <article className="rounded-3xl border border-border bg-surface p-5" key={title}>
                <Newspaper className="size-5 text-primary" aria-hidden="true" />
                <h2 className="mt-4 text-base font-extrabold">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-secondary-foreground">{description}</p>
              </article>
            ))}
          </section>

          {posts.length ? (
            <section className="mt-14" aria-labelledby="news-feed-title">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary-ink">Son gelişmeler</p>
                  <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.045em]" id="news-feed-title">Güncel yayınlar</h2>
                </div>
                <Link className="platform-text-link" href="/blog">Tüm rehberler</Link>
              </div>
              <div className="mt-8 divide-y divide-border overflow-hidden rounded-3xl border border-border bg-surface">
                {posts.slice(0, 12).map((post) => (
                  <Link className="platform-news-row" href={`/blog/${post.slug}`} key={post.slug}>
                    <span><CalendarDays className="size-5" aria-hidden="true" /></span>
                    <div>
                      <small>{post.category}</small>
                      <h3>{post.cardTitle?.trim() || post.title}</h3>
                    </div>
                    <time dateTime={post.publishedIso}>{post.publishedAt}</time>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          <aside aria-label="Reklam alanı" className="platform-ad mt-12"><span>Reklam Alanı</span></aside>

          <Link className="platform-primary-button mt-10" href="/blog">
            Askerlik rehberlerini incele <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Container>
      </section>
    </main>
  );
}
