import type { Metadata } from 'next';
import { BlogIndex } from '@/components/content/blog-index';
import { Container } from '@/components/site/container';
import { listPublishedBlogPosts } from '@/lib/blog/repository';

export const dynamic = 'force-dynamic';

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
