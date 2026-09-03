import { vlogPosts } from '@/src/fixtures/content';
import { legalDocuments } from '@/src/fixtures/legal';

export type SitemapEntry = { path: string; lastModified: string };

const legalLastModified = '2026-09-01';

export const pageSitemapEntries: SitemapEntry[] = [
  { path: '/', lastModified: '2026-09-03' },
  { path: '/blog', lastModified: '2026-09-03' },
  { path: '/topluluk', lastModified: '2026-09-03' },
  ...legalDocuments.map((document) => ({
    path: `/${document.slug}`,
    lastModified: legalLastModified,
  })),
  ...vlogPosts.map((post) => ({
    path: `/vlog/${post.slug}`,
    lastModified: '2026-08-31',
  })),
];

export const toolSitemapEntries: SitemapEntry[] = [
  { path: '/bedelli', lastModified: '2026-09-02' },
];

export const sitemapGroups = [
  '/sitemaps/pages.xml',
  '/sitemaps/blog.xml',
  '/sitemaps/tools.xml',
  '/sitemaps/community.xml',
] as const;
