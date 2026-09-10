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

const BEDELLI_2027_SLUG =
  '2027-bedelli-askerlik-ucreti-ne-kadar-olacak-guncel-tahmin';
const BEDELLI_2027_SEO_TITLE =
  '2027 Bedelli Askerlik Ücreti Ne Kadar Olacak? Güncel Tahmin | Devrem';

function publicAuthor(author: string) {
  return author === 'Devrem Editör' ? 'Devrem Editör Ekibi' : author;
}

function brandedBlogTitle(title: string) {
  const unbranded = title.replace(/(?:\s*\|\s*Devrem)+\s*$/i, '').trim();
  return `${unbranded} | Devrem`;
}

export async function generateMetadata({
  params,
}: BlogDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedBlogPost(slug);
  if (!post) return {};
  const metadataTitle =
    post.slug === BEDELLI_2027_SLUG
      ? BEDELLI_2027_SEO_TITLE
      : brandedBlogTitle(post.seoTitle?.trim() || post.title);
  const description = post.metaDescription?.trim() || post.excerpt;
  const socialImage = post.ogImage ?? post.coverImage;
  const metadata = createPageMetadata({
    title: metadataTitle,
    description,
    path: `/blog/${post.slug}`,
    image: socialImage?.src,
    imageAlt: socialImage?.alt,
    type: 'article',
    index: !post.noindex,
    publishedTime: post.publishedIso,
    modifiedTime: post.updatedIso ?? post.publishedIso,
    authors: [publicAuthor(post.author)],
  });
  return { ...metadata, title: { absolute: metadataTitle } };
}

export default async function BlogDetailPage({ params }: BlogDetailProps) {
  const { slug } = await params;
  const post = await getPublishedBlogPost(slug);
  if (!post) notFound();
  if (post.slug !== slug) permanentRedirect(`/blog/${post.slug}`);

  const publicPost =
    post.author === 'Devrem Editör'
      ? { ...post, author: publicAuthor(post.author) }
      : post;

  const relatedPosts = await getPublishedRelatedPosts(
    publicPost.relatedSlugs ?? [],
  );
  const structuredData = graphSchema(
    organizationSchema(),
    webPageSchema({
      path: `/blog/${post.slug}`,
      name: post.title,
      description: post.metaDescription?.trim() || post.excerpt,
      dateModified: post.updatedIso ?? post.publishedIso,
    }),
    articleSchema(publicPost),
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
        <BlogArticle post={publicPost} relatedPosts={relatedPosts} />
      </Container>
    </main>
  );
}
