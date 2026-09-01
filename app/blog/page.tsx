import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, PlayCircle } from 'lucide-react';
import { ArticleCard } from '@/components/content/article-card';
import { BlogSearch } from '@/components/content/blog-search';
import { Container } from '@/components/site/container';
import { blogPosts, vlogPosts } from '@/src/fixtures/content';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Askerlik sürecini daha anlaşılır kılan güncel rehberler, Bedelli analizleri ve Devrem deneyim yazıları.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Devrem Blog | Rehberler ve Bedelli Analizleri',
    description:
      'Askerlik sürecini daha anlaşılır kılan rehberler, analizler ve deneyim yazıları.',
  },
};

export default function BlogPage() {
  const [featured, ...rest] = blogPosts;
  const vlog = vlogPosts[0];

  return (
    <main className="content-index" id="ana-icerik">
      <Container>
        <header className="content-index-hero">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary-ink">
            Devrem Blog
          </p>
          <h1 className="mt-4 max-w-4xl text-balance text-[clamp(2.5rem,5.5vw,4.75rem)] font-extrabold leading-[0.98] tracking-[-0.065em]">
            Askerlik sürecine dair
            <br />
            <span className="text-primary-ink">güncel rehberler.</span>
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-8 text-secondary-foreground sm:text-lg">
            Resmî kaynakları sadeleştiren rehberler, Bedelli verisini
            anlamlandıran analizler ve askerliğe dair gerçekçi deneyim notları.
          </p>
          <BlogSearch className="mt-8 max-w-2xl" variant="page" />
        </header>

        <section aria-labelledby="featured-article-title">
          <p className="sr-only" id="featured-article-title">
            Öne çıkan yazı
          </p>
          <ArticleCard featured post={featured} />
        </section>

        <section
          className="py-16 sm:py-20"
          aria-labelledby="latest-articles-title"
        >
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary-ink">
                Son yazılar
              </p>
              <h2
                className="mt-2 text-3xl font-bold tracking-[-0.05em] sm:text-4xl"
                id="latest-articles-title"
              >
                Güncel rehberler
              </h2>
            </div>
            <span className="text-xs font-semibold text-secondary-foreground">
              {blogPosts.length} yayın
            </span>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {rest.map((post) => (
              <ArticleCard key={post.slug} post={post} />
            ))}
          </div>
        </section>

        <section className="vlog-teaser" aria-labelledby="vlog-teaser-title">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <PlayCircle className="size-6" aria-hidden="true" />
            </span>
            <p className="mt-7 text-xs font-bold uppercase tracking-[0.14em] text-primary-ink">
              Devrem Vlog
            </p>
            <h2
              className="mt-3 text-3xl font-bold leading-tight tracking-[-0.05em] sm:text-5xl"
              id="vlog-teaser-title"
            >
              {vlog.title}
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-secondary-foreground sm:text-base">
              {vlog.excerpt}
            </p>
            <Link
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary-hover"
              href={`/vlog/${vlog.slug}`}
            >
              Vlog detayına git{' '}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </Container>
    </main>
  );
}
