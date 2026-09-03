import type { BlogPost } from '@/src/fixtures/content';
import { siteConfig } from '@/src/config/site';
import { absoluteUrl, seoConfig } from '@/src/config/seo';

export type BreadcrumbItem = { name: string; path: string };

export function organizationSchema() {
  return {
    '@type': 'Organization',
    '@id': `${seoConfig.origin}/#organization`,
    name: siteConfig.name,
    url: absoluteUrl('/'),
    logo: absoluteUrl(seoConfig.logoPath),
    email: siteConfig.contactEmail,
    address: {
      '@type': 'PostalAddress',
      streetAddress: siteConfig.address,
      addressCountry: 'TR',
    },
    ...(siteConfig.socialLinks.length
      ? { sameAs: siteConfig.socialLinks.map((item) => item.href) }
      : {}),
  };
}

export function websiteSchema() {
  return {
    '@type': 'WebSite',
    '@id': `${seoConfig.origin}/#website`,
    url: absoluteUrl('/'),
    name: siteConfig.name,
    description: siteConfig.description,
    inLanguage: seoConfig.language,
    publisher: { '@id': `${seoConfig.origin}/#organization` },
  };
}

export function webPageSchema({
  path,
  name,
  description,
  dateModified,
}: {
  path: string;
  name: string;
  description: string;
  dateModified?: string;
}) {
  const url = absoluteUrl(path);
  return {
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name,
    description,
    inLanguage: seoConfig.language,
    isPartOf: { '@id': `${seoConfig.origin}/#website` },
    ...(dateModified ? { dateModified } : {}),
  };
}

export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function articleSchema(post: BlogPost) {
  const url = absoluteUrl(`/blog/${post.slug}`);
  const image = post.ogImage ?? post.coverImage;
  return {
    '@type': ['Article', 'BlogPosting'],
    '@id': `${url}#article`,
    mainEntityOfPage: { '@id': `${url}#webpage` },
    url,
    headline: post.title,
    description: post.metaDescription?.trim() || post.excerpt,
    datePublished: post.publishedIso,
    dateModified: post.updatedIso ?? post.publishedIso,
    inLanguage: seoConfig.language,
    articleSection: post.category,
    author: { '@type': 'Organization', name: post.author },
    publisher: { '@id': `${seoConfig.origin}/#organization` },
    ...(image ? { image: absoluteUrl(image.src) } : {}),
    ...(post.sources?.length
      ? { citation: post.sources.map((source) => source.href) }
      : {}),
  };
}

export function graphSchema(...nodes: Array<Record<string, unknown>>) {
  return { '@context': 'https://schema.org', '@graph': nodes };
}
