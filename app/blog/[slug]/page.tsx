import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { BlogArticle } from '@/components/content/blog-article';
import { Container } from '@/components/site/container';
import { JsonLd } from '@/components/seo/json-ld';
import {
  getPublishedBlogPost,
  getPublishedRelatedPosts,
} from '@/lib/blog/repository';
import {
  articleSchema,
  breadcrumbSchema,
  graphSchema,
  organizationSchema,
  webPageSchema,
} from '@/lib/seo/structured-data';
import { createPageMetadata } from '@/src/config/seo';

type BlogDetailProps = { params: Promise<{ slug: string }> };

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: BlogDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedBlogPost(slug);
  if (!post) return {};
  const metadataTitle = post.seoTitle?.trim() || post.title;
  const description = post.metaDescription?.trim() || post.excerpt;
  const socialImage = post.ogImage ?? post.coverImage;
  return createPageMetadata({
    title: metadataTitle,
    description,
    path: `/blog/${post.slug}`,
    image: socialImage?.src,
    imageAlt: socialImage?.alt,
    type: 'article',
    index: !post.noindex,
    publishedTime: post.publishedIso,
    modifiedTime: post.updatedIso ?? post.publishedIso,
    authors: [post.author],
  });
}

export default async function BlogDetailPage({ params }: BlogDetailProps) {
  const { slug } = await params;
  const post = await getPublishedBlogPost(slug);
  if (!post) notFound();
  if (post.slug !== slug) permanentRedirect(`/blog/${post.slug}`);

  const relatedPosts = await getPublishedRelatedPosts(post.relatedSlugs ?? []);
  const structuredData = graphSchema(
    organizationSchema(),
    webPageSchema({
      path: `/blog/${post.slug}`,
      name: post.title,
      description: post.metaDescription?.trim() || post.excerpt,
      dateModified: post.updatedIso ?? post.publishedIso,
    }),
    articleSchema(post),
    breadcrumbSchema([
      { name: 'Ana Sayfa', path: '/' },
      { name: 'Blog', path: '/blog' },
      { name: post.title, path: `/blog/${post.slug}` },
    ]),
  );
  return (
    <main className="article-page editorial-surface" id="ana-icerik">
      <JsonLd data={structuredData} />
      <Container>
        <BlogArticle post={post} relatedPosts={relatedPosts} />
      </Container>
    </main>
  );
}
