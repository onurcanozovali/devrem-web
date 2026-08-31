import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, Clock3, ExternalLink } from 'lucide-react';
import { notFound } from 'next/navigation';
import { Container } from '@/components/site/container';
import { blogPosts, getBlogPost } from '@/src/fixtures/content';

type BlogDetailProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: BlogDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: `${post.title} | Devrem`,
      description: post.excerpt,
      images: [],
    },
    twitter: {
      card: 'summary',
      title: `${post.title} | Devrem`,
      description: post.excerpt,
      images: [],
    },
  };
}

export default async function BlogDetailPage({ params }: BlogDetailProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  return (
    <main className="article-page" id="ana-icerik">
      <Container>
        <article>
          <header className="article-hero">
            <Link
              className="inline-flex items-center gap-2 text-xs font-bold text-secondary-foreground transition hover:text-primary-ink"
              href="/blog"
            >
              <ArrowLeft className="size-4" aria-hidden="true" /> Bloga dön
            </Link>
            <div className="mt-10 flex flex-wrap items-center gap-3 text-xs font-semibold text-secondary-foreground">
              <span className="rounded-full bg-primary-subtle px-3 py-1.5 font-bold text-primary-ink">
                {post.category}
              </span>
              <span>{post.publishedAt}</span>
              <span className="inline-flex items-center gap-1">
                <Clock3 className="size-3.5" aria-hidden="true" />{' '}
                {post.readingTime}
              </span>
            </div>
            <h1 className="mt-6 max-w-5xl text-balance text-[clamp(2.8rem,7vw,6rem)] font-extrabold leading-[0.94] tracking-[-0.075em]">
              {post.title}
            </h1>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-secondary-foreground">
              {post.excerpt}
            </p>
            <p className="mt-8 text-xs font-bold uppercase tracking-[0.1em] text-primary-ink">
              {post.author}
            </p>
          </header>

          <div className="article-layout">
            <div className="article-body">
              {post.sections.map((section) => (
                <section key={section.heading}>
                  <h2>{section.heading}</h2>
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  {section.bullets ? (
                    <ul>
                      {section.bullets.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              ))}
              <div className="article-disclaimer">
                <strong>Önemli not</strong>
                <p>
                  Devrem bağımsız bir platformdur. Resmî işlem, tarih ve belge
                  bilgilerinde MSB ile e-Devlet kayıtlarını esas al.
                </p>
              </div>
            </div>
            <aside className="article-aside">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-secondary-foreground">
                  Yazı özeti
                </p>
                <p className="mt-3 text-sm leading-6">{post.excerpt}</p>
              </div>
              {post.sources?.length ? (
                <div className="mt-8 border-t border-border pt-6">
                  <h2 className="text-sm font-bold">Kaynaklar</h2>
                  <ul className="mt-4 space-y-3">
                    {post.sources.map((source) => (
                      <li key={source.href}>
                        <a
                          className="inline-flex items-start gap-2 text-xs font-semibold leading-5 text-primary-ink hover:underline"
                          href={source.href}
                          rel="noreferrer"
                          target={
                            source.href.startsWith('/') ? undefined : '_blank'
                          }
                        >
                          {source.label}
                          {source.href.startsWith('/') ? (
                            <ArrowUpRight
                              className="mt-0.5 size-3.5 shrink-0"
                              aria-hidden="true"
                            />
                          ) : (
                            <ExternalLink
                              className="mt-0.5 size-3.5 shrink-0"
                              aria-hidden="true"
                            />
                          )}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </aside>
          </div>
        </article>
      </Container>
    </main>
  );
}
