import type { Metadata } from 'next';
import { siteConfig } from './site';

const canonicalOrigin = new URL(siteConfig.url);

export const seoConfig = {
  siteName: siteConfig.name,
  origin: canonicalOrigin.origin,
  language: 'tr',
  locale: 'tr_TR',
  defaultTitle: 'Devrem | Askere Gitmeden Önce Devrelerinle Tanış',
  titleTemplate: '%s | Devrem',
  defaultDescription: siteConfig.description,
  defaultImage: {
    path: '/og.png',
    width: 1200,
    height: 630,
    alt: 'Devrem — Askere gitmeden önce devrelerinle tanış',
  },
  logoPath: '/web-logo.png',
} as const;

/**
 * Indexing is deliberately opt-in so preview, staging and local deployments
 * cannot accidentally enter search results. Set SEO_ALLOW_INDEXING=true only
 * on the canonical production deployment.
 */
export const isIndexingEnabled = process.env.SEO_ALLOW_INDEXING === 'true';

export function normalizePath(path = '/') {
  const withLeadingSlash = path.startsWith('/') ? path : `/${path}`;
  if (withLeadingSlash === '/') return '/';
  return withLeadingSlash.replace(/\/+$/, '');
}

export function absoluteUrl(pathOrUrl = '/') {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const path = normalizePath(pathOrUrl);
  if (path === '/') return seoConfig.origin;
  return new URL(path, `${seoConfig.origin}/`).toString();
}

export function formatSeoTitle(title: string) {
  return title.includes(siteConfig.name) ? title : `${title} | ${siteConfig.name}`;
}

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  imageAlt?: string;
  type?: 'website' | 'article';
  index?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
};

export function createPageMetadata({
  title,
  description,
  path,
  image,
  imageAlt,
  type = 'website',
  index = true,
  publishedTime,
  modifiedTime,
  authors,
}: PageMetadataInput): Metadata {
  const canonical = absoluteUrl(path);
  const hasCustomImage = Boolean(image);
  const socialImage = absoluteUrl(image || seoConfig.defaultImage.path);
  const socialTitle = formatSeoTitle(title);
  const shouldIndex = isIndexingEnabled && index;

  return {
    title,
    description,
    alternates: { canonical },
    robots: {
      index: shouldIndex,
      follow: shouldIndex,
      googleBot: { index: shouldIndex, follow: shouldIndex },
    },
    openGraph: {
      type,
      locale: seoConfig.locale,
      siteName: seoConfig.siteName,
      title: socialTitle,
      description,
      url: canonical,
      images: hasCustomImage
        ? [{ url: socialImage, alt: imageAlt || seoConfig.defaultImage.alt }]
        : [
            {
              url: socialImage,
              width: seoConfig.defaultImage.width,
              height: seoConfig.defaultImage.height,
              alt: seoConfig.defaultImage.alt,
            },
          ],
      ...(type === 'article'
        ? { publishedTime, modifiedTime, authors }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
      description,
      images: [socialImage],
    },
  };
}
