import type { MetadataRoute } from 'next';
import { listPublishedBlogPosts } from '@/lib/blog/repository';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await listPublishedBlogPosts();
  const staticPages = [
    '',
    '/blog',
    '/bedelli',
    '/privacy',
    '/terms',
    '/kvkk',
    '/support',
    '/community-guidelines',
    '/account-deletion',
  ];
  return [
    ...staticPages.map((path) => ({
      url: `https://devrem.co${path}`,
      changeFrequency: path === '/blog' ? ('daily' as const) : ('monthly' as const),
      priority: path === '' ? 1 : 0.7,
    })),
    ...posts.map((post) => ({
      url: `https://devrem.co/blog/${post.slug}`,
      lastModified: post.updatedIso,
      changeFrequency: 'weekly' as const,
      priority: post.featured ? 0.9 : 0.75,
    })),
  ];
}
