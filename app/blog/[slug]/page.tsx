import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { notFound } from 'next/navigation';
import { ArticleBody } from '@/components/content/article-body';
import { ArticleHeader } from '@/components/content/article-header';
import { ArticleSources } from '@/components/content/article-sources';
import { ArticleToc } from '@/components/content/article-toc';
import { Container } from '@/components/site/container';
import { getArticleToc } from '@/lib/content';
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
      type: 'article',
      title: `${post.title} | Devrem`,
      description: post.excerpt,
      publishedTime: post.publishedIso,
      modifiedTime: post.updatedIso ?? post.publishedIso,
      authors: [post.author],
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

  const toc = getArticleToc(post);
  const schemaGraph: Record<string, unknown>[] = [
    {
      '@type': 'BlogPosting',
      mainEntityOfPage: `https://devrem.co/blog/${post.slug}`,
      headline: post.title,
      description: post.excerpt,
      datePublished: post.publishedIso,
      dateModified: post.updatedIso ?? post.publishedIso,
      author: { '@type': 'Organization', name: post.author },
      publisher: {
        '@type': 'Organization',
        name: 'Devrem',
        url: 'https://devrem.co',
      },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Ana Sayfa',
          item: 'https://devrem.co',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Blog',
          item: 'https://devrem.co/blog',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: post.title,
          item: `https://devrem.co/blog/${post.slug}`,
        },
      ],
    },
  ];

  if (post.faqs?.length) {
    schemaGraph.push({
      '@type': 'FAQPage',
      mainEntity: post.faqs.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: { '@type': 'Answer', text: item.answer },
      })),
    });
  }

  const structuredData = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': schemaGraph,
  }).replace(/</g, '\\u003c');
  const sidebarCta = post.endCta ?? {
    title: 'Daha fazla rehber',
    description:
      'Hazırlık sürecindeki diğer soruların için Devrem Blog’a göz at.',
    label: 'Tümünü gör',
    href: '/blog',
  };

  return (
    <main className="article-page editorial-surface" id="ana-icerik">
      <script
        dangerouslySetInnerHTML={{ __html: structuredData }}
        type="application/ld+json"
      />
      <Container>
        <article>
          <ArticleHeader post={post} toc={toc} />

          <div className="article-layout">
            <ArticleBody post={post} />

            <aside
              className="article-desktop-sidebar"
              aria-label="Yazı navigasyonu"
            >
              <div className="article-sidebar-panel">
                <p className="article-sidebar-label">İçindekiler</p>
                <ArticleToc items={toc} variant="desktop" />

                {post.sources?.length ? (
                  <div className="article-desktop-sources">
                    <ArticleSources sources={post.sources} />
                  </div>
                ) : null}

                <div className="article-sidebar-cta">
                  <strong>{sidebarCta.title}</strong>
                  <p>{sidebarCta.description}</p>
                  <Link href={sidebarCta.href}>
                    {sidebarCta.label}{' '}
                    <ArrowRight className="size-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </article>
      </Container>
    </main>
  );
}
