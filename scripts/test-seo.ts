import assert from 'node:assert/strict';
import { articleSchema, breadcrumbSchema } from '../lib/seo/structured-data';
import { sitemapXml } from '../lib/seo/xml';
import { legacyPostToFields, firestorePostToView } from '../src/blog/legacy';
import { isPubliclyPublished, isSitemapEligible } from '../src/blog/publication';
import { absoluteUrl, normalizePath, seoConfig } from '../src/config/seo';
import { blogPosts } from '../src/fixtures/content';
import type { BlogPostDocument } from '../src/blog/types';

const fields = legacyPostToFields(blogPosts[0]);
const published: BlogPostDocument = {
  id: 'seo-test',
  ...fields,
  publishedAt: '2026-08-01T09:00:00.000Z',
  createdAt: '2026-07-01T09:00:00.000Z',
  updatedAt: '2026-08-02T09:00:00.000Z',
  previousSlugs: [],
};

assert.equal(normalizePath('/blog/'), '/blog');
assert.equal(absoluteUrl('/blog'), `${seoConfig.origin}/blog`);
assert.equal(isPubliclyPublished(published, '2026-09-01T00:00:00.000Z'), true);
assert.equal(
  isPubliclyPublished({ ...published, status: 'draft' }, '2026-09-01T00:00:00.000Z'),
  false,
);
assert.equal(
  isPubliclyPublished(
    { ...published, publishedAt: '2027-01-01T00:00:00.000Z' },
    '2026-09-01T00:00:00.000Z',
  ),
  false,
);
assert.equal(
  isSitemapEligible({ ...published, noindex: true }, '2026-09-01T00:00:00.000Z'),
  false,
);

const post = firestorePostToView(published);
const article = articleSchema(post);
assert.equal(article.headline, published.title);
assert.equal(article.datePublished, '2026-08-01');
assert.match(String(article.url), /^https:\/\/devrem\.co\/blog\//);

const breadcrumb = breadcrumbSchema([
  { name: 'Ana Sayfa', path: '/' },
  { name: 'Blog', path: '/blog' },
]);
assert.equal(breadcrumb.itemListElement.length, 2);
assert.equal(breadcrumb.itemListElement[1].position, 2);

const sitemap = sitemapXml([
  { path: '/blog/seo-test', lastModified: published.updatedAt },
]);
assert.match(sitemap, /<loc>https:\/\/devrem\.co\/blog\/seo-test<\/loc>/);
assert.match(sitemap, /<lastmod>2026-08-02<\/lastmod>/);
assert.doesNotMatch(sitemap, /priority|changefreq/);

console.log('SEO unit checks passed.');
