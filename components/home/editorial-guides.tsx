import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ArticleCard } from '@/components/content/article-card';
import { Container } from '@/components/site/container';
import { blogPosts } from '@/src/fixtures/content';

export function EditorialGuides() {
  return (
    <section
      className="py-20 sm:py-24"
      id="blog"
      aria-labelledby="home-blog-title"
    >
      <Container>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary-ink">
              Devrem Blog
            </p>
            <h2 className="section-title mt-4" id="home-blog-title">
              Sorunun kısa cevabı.
              <br />
              Merak edersen devamı.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-secondary-foreground">
              Gürültüyü azaltan rehberler, kaynağı belli bilgiler ve Bedelli
              verisini gerçekten anlamaya yarayan analizler.
            </p>
          </div>
          <Link
            className="inline-flex w-fit items-center gap-2 text-sm font-bold text-primary-ink hover:text-primary-dark"
            href="/blog"
          >
            Tüm yazılar <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="mt-10 grid gap-5 lg:grid-cols-[1.12fr_0.88fr]">
          <ArticleCard featured post={blogPosts[0]} />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
            {blogPosts.slice(1, 3).map((post) => (
              <ArticleCard key={post.slug} post={post} />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
