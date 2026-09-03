import type { BlogPostDocument } from './types';

export function isPubliclyPublished(
  post: BlogPostDocument,
  now = new Date().toISOString(),
) {
  return Boolean(
    post.status === 'published' &&
      post.publishedAt &&
      post.publishedAt <= now,
  );
}

export function isSitemapEligible(
  post: BlogPostDocument,
  now = new Date().toISOString(),
) {
  return isPubliclyPublished(post, now) && !post.noindex;
}
