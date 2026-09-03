import assert from 'node:assert/strict';

const baseUrl = (process.env.SEO_BASE_URL || 'http://localhost:3000').replace(
  /\/$/,
  '',
);
const canonicalOrigin = 'https://devrem.co';
const errors: string[] = [];

function fail(message: string) {
  errors.push(message);
}

function decodeHtml(value: string) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function tags(html: string, tagName: string) {
  return html.match(new RegExp(`<${tagName}\\b[^>]*>`, 'gi')) ?? [];
}

function attribute(tag: string, name: string) {
  const match = tag.match(new RegExp(`${name}=["']([^"']*)["']`, 'i'));
  return match ? decodeHtml(match[1]) : '';
}

function meta(html: string, key: string) {
  for (const tag of tags(html, 'meta')) {
    const name = attribute(tag, 'name') || attribute(tag, 'property');
    if (name.toLowerCase() === key.toLowerCase()) return attribute(tag, 'content');
  }
  return '';
}

function link(html: string, rel: string) {
  for (const tag of tags(html, 'link')) {
    if (attribute(tag, 'rel').toLowerCase().split(/\s+/).includes(rel)) {
      return attribute(tag, 'href');
    }
  }
  return '';
}

function textOf(html: string, tagName: string) {
  const match = html.match(new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)</${tagName}>`, 'i'));
  return match ? decodeHtml(match[1].replace(/<[^>]+>/g, '').trim()) : '';
}

function allMatches(value: string, pattern: RegExp) {
  return Array.from(value.matchAll(pattern), (match) => match[1]);
}

function localUrl(productionUrl: string) {
  const url = new URL(productionUrl);
  return `${baseUrl}${url.pathname}${url.search}`;
}

async function fetchText(url: string, redirect: RequestRedirect = 'follow') {
  const response = await fetch(url, { redirect });
  return { response, body: await response.text() };
}

const robots = await fetchText(`${baseUrl}/robots.txt`);
assert.equal(robots.response.status, 200, 'robots.txt must return 200');
if (!robots.body.includes('Sitemap: https://devrem.co/sitemap.xml')) {
  fail('robots.txt does not advertise the canonical sitemap.');
}
if (!robots.body.includes('Disallow: /admin/')) fail('robots.txt must disallow /admin/.');
if (!robots.body.includes('Disallow: /api/')) fail('robots.txt must disallow /api/.');

const sitemapIndex = await fetchText(`${baseUrl}/sitemap.xml`);
assert.equal(sitemapIndex.response.status, 200, 'sitemap.xml must return 200');
const groupUrls = allMatches(sitemapIndex.body, /<loc>([^<]+)<\/loc>/g).map(decodeHtml);
if (groupUrls.length !== 3) fail(`Expected 3 sitemap groups, found ${groupUrls.length}.`);

const urls: string[] = [];
for (const groupUrl of groupUrls) {
  const group = await fetchText(localUrl(groupUrl));
  if (group.response.status !== 200) {
    fail(`${groupUrl} returned ${group.response.status}.`);
    continue;
  }
  const groupEntries = allMatches(group.body, /<loc>([^<]+)<\/loc>/g).map(decodeHtml);
  urls.push(...groupEntries);
  if (/\/admin\/|\/api\//.test(group.body)) fail(`${groupUrl} exposes a private route.`);
  if (/changefreq|priority/.test(group.body)) fail(`${groupUrl} contains artificial priority/frequency values.`);
}

const duplicateSitemapUrls = urls.filter((url, index) => urls.indexOf(url) !== index);
if (duplicateSitemapUrls.length) fail(`Duplicate sitemap URLs: ${duplicateSitemapUrls.join(', ')}`);
if (!urls.length) fail('Sitemap contains no public URLs.');

const titles = new Map<string, string>();
const canonicals = new Set<string>();
const internalTargets = new Map<string, Set<string>>();
const imageTargets = new Map<string, Set<string>>();
let articleCount = 0;

for (const productionUrl of urls) {
  const { response, body } = await fetchText(localUrl(productionUrl));
  if (response.status !== 200) {
    fail(`${productionUrl} returned ${response.status}.`);
    continue;
  }
  const title = textOf(body, 'title');
  const description = meta(body, 'description');
  const canonical = link(body, 'canonical');
  const robotsValue = meta(body, 'robots');
  const h1Count = (body.match(/<h1\b/gi) ?? []).length;

  if (!title) fail(`${productionUrl} has no title.`);
  if (!description) fail(`${productionUrl} has no meta description.`);
  if (h1Count !== 1) fail(`${productionUrl} has ${h1Count} H1 elements.`);
  if (canonical !== productionUrl) fail(`${productionUrl} canonical is ${canonical || 'missing'}.`);
  if (robotsValue.toLowerCase().includes('noindex')) fail(`${productionUrl} is in sitemap but noindex.`);
  if (!meta(body, 'og:title') || !meta(body, 'og:description') || !meta(body, 'og:image')) {
    fail(`${productionUrl} is missing Open Graph metadata.`);
  }
  if (meta(body, 'og:url') !== productionUrl) fail(`${productionUrl} has an invalid og:url.`);
  if (!meta(body, 'twitter:card') || !meta(body, 'twitter:title') || !meta(body, 'twitter:image')) {
    fail(`${productionUrl} is missing Twitter metadata.`);
  }
  if (/localhost|127\.0\.0\.1|staging|preview/i.test(`${canonical}${meta(body, 'og:url')}`)) {
    fail(`${productionUrl} leaks a non-production URL.`);
  }
  if (titles.has(title)) fail(`Duplicate title on ${productionUrl} and ${titles.get(title)}: ${title}`);
  titles.set(title, productionUrl);
  if (canonicals.has(canonical)) fail(`Duplicate canonical: ${canonical}`);
  canonicals.add(canonical);

  const jsonLd = allMatches(
    body,
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  );
  for (const raw of jsonLd) {
    try {
      JSON.parse(decodeHtml(raw));
    } catch {
      fail(`${productionUrl} contains invalid JSON-LD.`);
    }
  }
  if (productionUrl.includes('/blog/') && !productionUrl.endsWith('/blog')) {
    articleCount += 1;
    if (!body.includes('BlogPosting') || !body.includes('BreadcrumbList')) {
      fail(`${productionUrl} is missing Article/Breadcrumb structured data.`);
    }
  }

  const ids = new Set(allMatches(body, /\sid=["']([^"']+)["']/gi).map(decodeHtml));
  for (const href of allMatches(body, /<a\b[^>]*\shref=["']([^"']+)["']/gi).map(decodeHtml)) {
    if (href.startsWith('#') && href.length > 1 && !ids.has(href.slice(1))) {
      fail(`${productionUrl} links to missing anchor ${href}.`);
    }
    if (/^(mailto:|tel:|javascript:|data:)/i.test(href)) continue;
    const target = new URL(href, productionUrl);
    if (target.origin !== canonicalOrigin) continue;
    const key = `${target.pathname}${target.search}${target.hash}`;
    const sources = internalTargets.get(key) ?? new Set<string>();
    sources.add(productionUrl);
    internalTargets.set(key, sources);
  }

  const pageImages = [
    ...allMatches(body, /<img\b[^>]*\ssrc=["']([^"']+)["']/gi),
    meta(body, 'og:image'),
    meta(body, 'twitter:image'),
  ].filter(Boolean);
  for (const source of pageImages) {
    if (source.startsWith('data:')) continue;
    const target = new URL(decodeHtml(source), productionUrl).toString();
    const pages = imageTargets.get(target) ?? new Set<string>();
    pages.add(productionUrl);
    imageTargets.set(target, pages);
  }
}

for (const [target, sources] of internalTargets) {
  const url = new URL(target, canonicalOrigin);
  const response = await fetch(`${baseUrl}${url.pathname}${url.search}`, {
    redirect: 'manual',
  });
  if (response.status >= 300 && response.status < 400) {
    fail(
      `Internal link ${url.pathname} redirects (${response.status}); linked from ${Array.from(sources).join(', ')}.`,
    );
    continue;
  }
  if (!response.ok) {
    fail(
      `Internal link ${url.pathname} returned ${response.status}; linked from ${Array.from(sources).join(', ')}.`,
    );
    continue;
  }
  if (url.hash) {
    const body = await response.text();
    const targetId = decodeURIComponent(url.hash.slice(1));
    const ids = new Set(allMatches(body, /\sid=["']([^"']+)["']/gi).map(decodeHtml));
    if (!ids.has(targetId)) {
      fail(`Internal link ${target} points to a missing anchor.`);
    }
  }
}

for (const [target, sources] of imageTargets) {
  const url = new URL(target);
  const requestUrl = url.origin === canonicalOrigin ? localUrl(target) : target;
  const response = await fetch(requestUrl, { redirect: 'follow' });
  const contentType = response.headers.get('content-type') ?? '';
  if (!response.ok || !contentType.startsWith('image/')) {
    fail(
      `Image ${target} is unavailable or has ${contentType || 'no content type'}; used on ${Array.from(sources).join(', ')}.`,
    );
  }
}

const feed = await fetchText(`${baseUrl}/feed.xml`);
if (feed.response.status !== 200 || !feed.body.includes('<rss')) fail('RSS feed is unavailable or invalid.');

const missing = await fetchText(`${baseUrl}/this-page-must-not-exist-seo-check`);
if (missing.response.status !== 404) fail(`Unknown URL returned ${missing.response.status}, expected 404.`);
if (!meta(missing.body, 'robots').toLowerCase().includes('noindex')) {
  fail('404 page is missing noindex.');
}

const admin = await fetchText(`${baseUrl}/admin/login`);
if (!meta(admin.body, 'robots').toLowerCase().includes('noindex')) {
  fail('Admin login page is missing noindex.');
}

const parameterVariant = await fetchText(`${baseUrl}/bedelli?utm_source=seo-check`);
if (link(parameterVariant.body, 'canonical') !== `${canonicalOrigin}/bedelli`) {
  fail('Query parameter variant does not canonicalize to /bedelli.');
}

const trailingSlash = await fetch(`${baseUrl}/blog/`, { redirect: 'manual' });
if (![301, 308].includes(trailingSlash.status)) {
  fail(`/blog/ returned ${trailingSlash.status}; expected a permanent trailing-slash redirect.`);
}

if (errors.length) {
  console.error(`SEO check failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`SEO check passed: ${urls.length} sitemap URLs, ${articleCount} article pages.`);
