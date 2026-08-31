import type { BlogPost } from '@/src/fixtures/content';
import { blogPosts } from '@/src/fixtures/content';

export type ArticleTocItem = {
  id: string;
  label: string;
  level: 2 | 3;
};

export function headingToId(value: string) {
  return value
    .toLocaleLowerCase('tr-TR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[ıİ]/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ş/g, 's')
    .replace(/ç/g, 'c')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function getArticleToc(post: BlogPost): ArticleTocItem[] {
  const items = post.sections.flatMap<ArticleTocItem>((section) => [
    { id: headingToId(section.heading), label: section.heading, level: 2 },
    ...(section.subsections?.map((subsection) => ({
      id: headingToId(subsection.heading),
      label: subsection.heading,
      level: 3 as const,
    })) ?? []),
  ]);

  if (post.faqs?.length) {
    items.push({
      id: 'sik-sorulan-sorular',
      label: 'Sık sorulan sorular',
      level: 2,
    });
  }

  items.push({ id: 'ilgili-rehberler', label: 'İlgili rehberler', level: 2 });
  return items;
}

export function getRelatedPosts(post: BlogPost) {
  const requested = post.relatedSlugs?.length
    ? post.relatedSlugs
    : blogPosts
        .filter((candidate) => candidate.slug !== post.slug)
        .slice(0, 2)
        .map((candidate) => candidate.slug);

  return requested
    .map((slug) => blogPosts.find((candidate) => candidate.slug === slug))
    .filter((candidate): candidate is BlogPost => Boolean(candidate));
}

export function getQuickSummary(post: BlogPost) {
  return (
    post.quickSummary?.slice(0, 5) ??
    post.sections.slice(0, 3).map((section) => section.heading)
  );
}
