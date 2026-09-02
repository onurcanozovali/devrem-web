import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { BlogArticle } from '@/components/content/blog-article';
import { Container } from '@/components/site/container';
import {
  getPublishedBlogPost,
  getPublishedRelatedPosts,
} from '@/lib/blog/repository';

type BlogDetailProps = { params: Promise<{ slug: string }> };

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: BlogDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedBlogPost(slug);
  if (!post) return {};
  const metadataTitle = post.seoTitle ?? post.title;
  const description = post.metaDescription ?? post.excerpt;
  const socialImage = post.ogImage ?? post.coverImage;
  const absoluteSocialImage = socialImage
    ? new URL(socialImage.src, 'https://devrem.co').toString()
    : null;
  return {
    title: metadataTitle,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: 'article',
      title: `${metadataTitle} | Devrem`,
      description,
      publishedTime: post.publishedIso,
      modifiedTime: post.updatedIso ?? post.publishedIso,
      authors: [post.author],
      images: absoluteSocialImage ? [absoluteSocialImage] : [],
    },
    twitter: {
      card: 'summary',
      title: `${metadataTitle} | Devrem`,
      description,
      images: absoluteSocialImage ? [absoluteSocialImage] : [],
    },
  };
}

export default async function BlogDetailPage({ params }: BlogDetailProps) {
  const { slug } = await params;
  const post = await getPublishedBlogPost(slug);
  if (!post) notFound();
  if (post.slug !== slug) permanentRedirect(`/blog/${post.slug}`);

  const relatedPosts = await getPublishedRelatedPosts(post.relatedSlugs ?? []);
  const schemaGraph: Record<string, unknown>[] = [
    {
      '@type': ['Article', 'BlogPosting'],
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
      ...(post.coverImage || post.ogImage
        ? {
            image: new URL(
              (post.ogImage ?? post.coverImage)?.src ?? '',
              'https://devrem.co',
            ).toString(),
          }
        : {}),
      ...(post.sources?.length
        ? { citation: post.sources.map((source) => source.href) }
        : {}),
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
  return (
    <main className="article-page editorial-surface" id="ana-icerik">
      <script
        dangerouslySetInnerHTML={{ __html: structuredData }}
        type="application/ld+json"
      />
      <Container>
        <BlogArticle post={post} relatedPosts={relatedPosts} />
      </Container>
    </main>
  );
}
