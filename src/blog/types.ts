export type BlogStatus = 'draft' | 'published';

export const BLOG_CATEGORIES = [
  'Rehber',
  'Bedelli',
  'Celp Dönemleri',
  'Birlikler',
  'Hazırlık',
  'Haberler',
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];
export type BlogSearchIntent =
  | 'informational'
  | 'fresh-current'
  | 'transactional-process';

export type BlogImage = {
  path: string;
  url: string;
  alt: string;
  caption?: string;
};

export type BlogContentBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; level: 2 | 3; text: string }
  | { type: 'list'; style: 'bullet' | 'numbered'; items: string[] }
  | {
      type: 'table';
      columns: string[];
      rows: string[][];
      caption?: string;
      note?: string;
    }
  | {
      type: 'callout';
      tone: 'info' | 'important' | 'warning' | 'tip';
      title: string;
      body: string;
    }
  | { type: 'checklist'; items: string[] }
  | ({ type: 'image' } & BlogImage)
  | {
      type: 'cta';
      title: string;
      description: string;
      label: string;
      href: string;
      presentation?: 'related' | 'end' | 'inline';
    };

export type BlogFaq = { question: string; answer: string };
export type BlogSource = {
  organization: string;
  title: string;
  url: string;
  lastVerifiedAt?: string | null;
};

export type BlogPostFields = {
  title: string;
  cardTitle?: string;
  slug: string;
  excerpt: string;
  category: string;
  author: string;
  status: BlogStatus;
  primarySearchQuery: string;
  secondaryQueries: string[];
  searchIntent: BlogSearchIntent;
  seoTitle: string;
  metaDescription: string;
  primaryIntent: string;
  excludedTopics: string[];
  standfirst: string[];
  quickSummary: string[];
  contentBlocks: BlogContentBlock[];
  faq: BlogFaq[];
  sources: BlogSource[];
  relatedArticleIds: string[];
  coverImage: BlogImage | null;
  ogImage: BlogImage | null;
  featured: boolean;
  lastVerifiedAt: string | null;
};

export type BlogPostDocument = BlogPostFields & {
  id: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  previousSlugs: string[];
};

export type BlogPostWriteInput = BlogPostFields & {
  id?: string;
};

export type BlogListItem = Pick<
  BlogPostDocument,
  'id' | 'title' | 'slug' | 'category' | 'status' | 'publishedAt' | 'updatedAt'
>;
