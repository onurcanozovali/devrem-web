import type { Metadata } from 'next';
import { BlogIndex } from '@/components/content/blog-index';
import { Container } from '@/components/site/container';
import { listPublishedBlogPosts } from '@/lib/blog/repository';
import { createPageMetadata } from '@/src/config/seo';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = createPageMetadata({
  title: 'Blog',
  description:
    'Askerlik sürecini daha anlaşılır kılan güncel rehberler, Bedelli analizleri ve Devrem deneyim yazıları.',
  path: '/blog',
});

export default async function BlogPage() {
  const blogPosts = await listPublishedBlogPosts();

  return (
    <main className="blog-index-page" id="ana-icerik">
      <Container>
        <BlogIndex posts={blogPosts} />
      </Container>
    </main>
  );
}
