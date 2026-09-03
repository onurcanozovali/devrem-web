import type {
  ArticleBlock,
  ArticleSection,
  BlogPost,
} from '../fixtures/content';
import type {
  BlogContentBlock,
  BlogPostDocument,
  BlogPostFields,
} from './types';
import { blogMediaUrl } from './media';

const categoryTones = {
  Bedelli: 'amber',
  Deneyim: 'slate',
  Rehber: 'mint',
  'Celp Dönemleri': 'mint',
  Birlikler: 'slate',
  Hazırlık: 'sand',
  Haberler: 'mint',
} as const;

function oldBlockToContent(block: ArticleBlock): BlogContentBlock {
  if (block.type === 'paragraph') return block;
  if (block.type === 'bullet-list') {
    return { type: 'list', style: 'bullet', items: block.items };
  }
  if (block.type === 'numbered-list') {
    return { type: 'list', style: 'numbered', items: block.items };
  }
  if (block.type === 'table') {
    return {
      type: 'table',
      columns: block.headers,
      rows: block.rows,
      ...(block.caption ? { caption: block.caption } : {}),
    };
  }
  if (block.type === 'callout') {
    return {
      type: 'callout',
      tone:
        block.tone === 'note'
          ? 'important'
          : block.tone === 'warning'
            ? 'warning'
            : 'info',
      title: block.title,
      body: block.body,
    };
  }
  if (block.type === 'checklist') return block;
  if (block.type === 'image') {
    return { ...block, url: blogMediaUrl(block) };
  }
  return { ...block, presentation: 'inline' };
}

export function legacyPostToFields(post: BlogPost): BlogPostFields {
  const contentBlocks: BlogContentBlock[] = [];
  for (const section of post.sections) {
    contentBlocks.push({ type: 'heading', level: 2, text: section.heading });
    contentBlocks.push(...(section.blocks ?? []).map(oldBlockToContent));
    contentBlocks.push(
      ...(section.paragraphs ?? []).map(
        (text): BlogContentBlock => ({ type: 'paragraph', text }),
      ),
    );
    if (section.bullets?.length) {
      contentBlocks.push({
        type: 'list',
        style: 'bullet',
        items: section.bullets,
      });
    }
    for (const subsection of section.subsections ?? []) {
      contentBlocks.push({
        type: 'heading',
        level: 3,
        text: subsection.heading,
      });
      contentBlocks.push(...subsection.blocks.map(oldBlockToContent));
    }
  }
  for (const link of post.contextualLinks ?? []) {
    if (!link.href) continue;
    contentBlocks.push({
      type: 'cta',
      title: link.title,
      description: link.description,
      label: link.status,
      href: link.href,
      presentation: 'related',
    });
  }
  if (post.endCta) {
    contentBlocks.push({
      type: 'cta',
      ...post.endCta,
      presentation: 'end',
    });
  }

  return {
    title: post.title,
    cardTitle: post.cardTitle,
    slug: post.slug,
    excerpt: post.excerpt,
    category: post.category,
    author: post.author,
    status: 'published',
    primarySearchQuery: post.seoTitle ?? post.title,
    secondaryQueries: [],
    searchIntent: 'informational',
    seoTitle: post.seoTitle ?? post.title,
    metaDescription: post.excerpt,
    primaryIntent: post.title,
    excludedTopics: [],
    standfirst: post.standfirst ?? [post.excerpt],
    quickSummary: post.quickSummary ?? [],
    contentBlocks,
    faq: post.faqs ?? [],
    sources: (post.sources ?? []).map((source) => ({
      organization: source.label,
      title: source.label,
      url: source.href,
      lastVerifiedAt: null,
    })),
    relatedArticleIds: post.relatedSlugs ?? [],
    coverImage: post.coverImage
      ? { path: '', url: post.coverImage.src, alt: post.coverImage.alt }
      : null,
    ogImage: null,
    featured: Boolean(post.featured),
    noindex: Boolean(post.noindex),
    lastVerifiedAt: null,
  };
}

function blockToLegacy(block: BlogContentBlock): ArticleBlock | null {
  if (block.type === 'paragraph') return block;
  if (block.type === 'list') {
    return block.style === 'numbered'
      ? { type: 'numbered-list', items: block.items }
      : { type: 'bullet-list', items: block.items };
  }
  if (block.type === 'table') {
    return {
      type: 'table',
      headers: block.columns,
      rows: block.rows,
      ...(block.caption ? { caption: block.caption } : {}),
      ...(block.note ? { note: block.note } : {}),
    };
  }
  if (block.type === 'callout') {
    return {
      type: 'callout',
      tone:
        block.tone === 'warning'
          ? 'warning'
          : block.tone === 'info'
            ? 'info'
            : 'note',
      title: block.title,
      body: block.body,
    };
  }
  if (block.type === 'checklist')
    return { type: 'checklist', items: block.items };
  if (block.type === 'image') return block;
  if (block.type === 'cta' && block.presentation === 'inline') {
    return { ...block, presentation: 'inline' };
  }
  return null;
}

export function firestorePostToView(post: BlogPostDocument): BlogPost {
  const sections: ArticleSection[] = [];
  let currentSection: ArticleSection | null = null;
  let currentSubsection:
    | NonNullable<ArticleSection['subsections']>[number]
    | null = null;
  const relatedCtas = post.contentBlocks.filter(
    (block) => block.type === 'cta' && block.presentation === 'related',
  );
  const endCta = post.contentBlocks.find(
    (block) => block.type === 'cta' && block.presentation === 'end',
  );

  for (const block of post.contentBlocks) {
    if (block.type === 'heading' && block.level === 2) {
      currentSection = { heading: block.text, blocks: [], subsections: [] };
      currentSubsection = null;
      sections.push(currentSection);
      continue;
    }
    if (block.type === 'heading' && block.level === 3) {
      if (!currentSection) {
        currentSection = {
          heading: 'Genel Bakış',
          blocks: [],
          subsections: [],
        };
        sections.push(currentSection);
      }
      currentSubsection = { heading: block.text, blocks: [] };
      currentSection.subsections?.push(currentSubsection);
      continue;
    }
    const legacyBlock = blockToLegacy(block);
    if (!legacyBlock) continue;
    if (!currentSection) {
      currentSection = { heading: 'Genel Bakış', blocks: [], subsections: [] };
      sections.push(currentSection);
    }
    if (currentSubsection) currentSubsection.blocks.push(legacyBlock);
    else currentSection.blocks?.push(legacyBlock);
  }

  const publishedIso =
    post.publishedAt?.slice(0, 10) ?? post.updatedAt.slice(0, 10);
  return {
    id: post.id,
    slug: post.slug,
    category: post.category as BlogPost['category'],
    title: post.title,
    cardTitle: post.cardTitle,
    seoTitle: post.seoTitle,
    metaDescription: post.metaDescription,
    excerpt: post.excerpt,
    standfirst: post.standfirst.slice(0, 2) as [string, string],
    quickSummary: post.quickSummary,
    publishedAt: new Intl.DateTimeFormat('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Europe/Istanbul',
    }).format(new Date(post.publishedAt ?? post.updatedAt)),
    publishedIso,
    updatedAt: new Intl.DateTimeFormat('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Europe/Istanbul',
    }).format(new Date(post.updatedAt)),
    updatedIso: post.updatedAt.slice(0, 10),
    readingTime: `${calculateReadingMinutes(post)} dk`,
    author: post.author,
    tone: categoryTones[post.category as keyof typeof categoryTones] ?? 'mint',
    featured: post.featured,
    noindex: post.noindex,
    coverImage: post.coverImage
      ? {
          src: blogMediaUrl(post.coverImage),
          alt: post.coverImage.alt,
          caption: post.coverImage.caption,
        }
      : undefined,
    sections,
    sources: post.sources.map((source) => ({
      label:
        source.organization === source.title
          ? source.title
          : `${source.organization} — ${source.title}`,
      href: source.url,
    })),
    ogImage: post.ogImage
      ? {
          src: blogMediaUrl(post.ogImage),
          alt: post.ogImage.alt,
          caption: post.ogImage.caption,
        }
      : undefined,
    faqs: post.faq,
    contextualLinks: relatedCtas.map((block) => ({
      title: block.type === 'cta' ? block.title : '',
      description: block.type === 'cta' ? block.description : '',
      href: block.type === 'cta' ? block.href : undefined,
      status: block.type === 'cta' ? block.label : '',
    })),
    relatedSlugs: post.relatedArticleIds,
    endCta:
      endCta?.type === 'cta'
        ? {
            title: endCta.title,
            description: endCta.description,
            label: endCta.label,
            href: endCta.href,
          }
        : undefined,
  };
}

export function calculateReadingMinutes(
  post: BlogPostDocument | BlogPostFields,
) {
  const blockText = post.contentBlocks.flatMap((block) => {
    if (block.type === 'paragraph' || block.type === 'heading')
      return [block.text];
    if (block.type === 'list' || block.type === 'checklist') return block.items;
    if (block.type === 'table') return [...block.columns, ...block.rows.flat()];
    if (block.type === 'callout') return [block.title, block.body];
    if (block.type === 'image') return [block.alt, block.caption ?? ''];
    return [block.title, block.description, block.label];
  });
  const words = [
    post.title,
    post.excerpt,
    ...post.quickSummary,
    ...blockText,
    ...post.faq.flatMap((item) => [item.question, item.answer]),
  ]
    .join(' ')
    .trim()
    .split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 210));
}
