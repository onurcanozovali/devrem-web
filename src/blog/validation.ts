import type {
  BlogContentBlock,
  BlogFaq,
  BlogImage,
  BlogPostWriteInput,
  BlogSearchIntent,
  BlogSource,
} from './types';
import { BLOG_CATEGORIES } from './types';

export class BlogValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BlogValidationError';
  }
}

const textLimits = {
  title: 180,
  excerpt: 420,
  category: 60,
  author: 100,
  seoTitle: 180,
  metaDescription: 320,
  short: 280,
  body: 12_000,
} as const;

function plainText(
  value: unknown,
  label: string,
  max: number,
  { required = true }: { required?: boolean } = {},
) {
  if (typeof value !== 'string') {
    if (!required && (value === undefined || value === null)) return '';
    throw new BlogValidationError(`${label} metin olmalı.`);
  }

  const sanitized = Array.from(value.replace(/\r\n?/g, '\n'))
    .filter((character) => {
      const code = character.charCodeAt(0);
      return code === 9 || code === 10 || code >= 32;
    })
    .join('')
    .trim();

  if (required && !sanitized) {
    throw new BlogValidationError(`${label} boş bırakılamaz.`);
  }
  if (sanitized.length > max) {
    throw new BlogValidationError(
      `${label} en fazla ${max} karakter olabilir.`,
    );
  }
  return sanitized;
}

function record(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new BlogValidationError(`${label} geçerli değil.`);
  }
  return value as Record<string, unknown>;
}

function array(value: unknown, label: string, max: number) {
  if (!Array.isArray(value)) {
    throw new BlogValidationError(`${label} liste olmalı.`);
  }
  if (value.length > max) {
    throw new BlogValidationError(`${label} en fazla ${max} öğe içerebilir.`);
  }
  return value;
}

function safeHref(value: unknown, label: string) {
  const href = plainText(value, label, 1_000);
  if (href.startsWith('/') && !href.startsWith('//')) return href;

  let parsed: URL;
  try {
    parsed = new URL(href);
  } catch {
    throw new BlogValidationError(`${label} geçerli bir bağlantı olmalı.`);
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new BlogValidationError(`${label} yalnızca HTTP(S) olabilir.`);
  }
  return parsed.toString();
}

function optionalDate(value: unknown, label: string) {
  if (value === undefined || value === null || value === '') return null;
  const date = plainText(value, label, 10);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    Number.isNaN(Date.parse(`${date}T00:00:00Z`))
  ) {
    throw new BlogValidationError(`${label} geçerli bir tarih olmalı.`);
  }
  return date;
}

export function normalizeBlogSlug(value: string) {
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
    .replace(/(^-|-$)/g, '')
    .slice(0, 140);
}

function textList(
  value: unknown,
  label: string,
  maxItems: number,
  maxLength: number = textLimits.short,
) {
  return array(value, label, maxItems).map((item, index) =>
    plainText(item, `${label} ${index + 1}`, maxLength),
  );
}

function parseImage(value: unknown, label: string, postId: string): BlogImage {
  const item = record(value, label);
  const path = plainText(item.path, `${label} dosya yolu`, 500);
  if (!path.startsWith(`blog/${postId}/`)) {
    throw new BlogValidationError(
      `${label} dosya yolu bu yazının Storage klasöründe olmalı.`,
    );
  }
  const url = safeHref(item.url, `${label} URL`);
  const alt = plainText(item.alt, `${label} alternatif metin`, 300);
  const caption = plainText(item.caption, `${label} açıklama`, 500, {
    required: false,
  });
  return { path, url, alt, ...(caption ? { caption } : {}) };
}

function parseBlock(
  value: unknown,
  index: number,
  postId: string,
): BlogContentBlock {
  const block = record(value, `İçerik bloğu ${index + 1}`);
  const type = plainText(block.type, `İçerik bloğu ${index + 1} türü`, 30);
  const label = `İçerik bloğu ${index + 1}`;

  if (type === 'paragraph') {
    return { type, text: plainText(block.text, label, textLimits.body) };
  }
  if (type === 'heading') {
    const level = Number(block.level);
    if (level !== 2 && level !== 3) {
      throw new BlogValidationError(
        `${label} başlık seviyesi H2 veya H3 olmalı.`,
      );
    }
    return {
      type,
      level,
      text: plainText(block.text, `${label} başlığı`, 220),
    };
  }
  if (type === 'list') {
    if (block.style !== 'bullet' && block.style !== 'numbered') {
      throw new BlogValidationError(`${label} liste stili geçerli değil.`);
    }
    return {
      type,
      style: block.style,
      items: textList(block.items, `${label} maddeleri`, 80, 1_000),
    };
  }
  if (type === 'table') {
    const columns = textList(block.columns, `${label} sütunları`, 12, 180);
    if (!columns.length) {
      throw new BlogValidationError(`${label} en az bir sütun içermeli.`);
    }
    const rows = array(block.rows, `${label} satırları`, 200).map(
      (row, rowIndex) => {
        const cells = textList(
          row,
          `${label} ${rowIndex + 1}. satır`,
          12,
          1_000,
        );
        if (cells.length !== columns.length) {
          throw new BlogValidationError(
            `${label} ${rowIndex + 1}. satır sütun sayısıyla eşleşmiyor.`,
          );
        }
        return cells;
      },
    );
    const caption = plainText(block.caption, `${label} başlığı`, 300, {
      required: false,
    });
    const note = plainText(block.note, `${label} notu`, 800, {
      required: false,
    });
    return {
      type,
      columns,
      rows,
      ...(caption ? { caption } : {}),
      ...(note ? { note } : {}),
    };
  }
  if (type === 'callout') {
    if (!['info', 'important', 'warning', 'tip'].includes(String(block.tone))) {
      throw new BlogValidationError(`${label} vurgu türü geçerli değil.`);
    }
    return {
      type,
      tone: block.tone as 'info' | 'important' | 'warning' | 'tip',
      title: plainText(block.title, `${label} başlığı`, 180),
      body: plainText(block.body, `${label} metni`, 2_000),
    };
  }
  if (type === 'checklist') {
    return {
      type,
      items: textList(block.items, `${label} maddeleri`, 80, 1_000),
    };
  }
  if (type === 'image') {
    return { type, ...parseImage(block, label, postId) };
  }
  if (type === 'cta') {
    const presentation = ['related', 'end', 'inline'].includes(
      String(block.presentation),
    )
      ? (block.presentation as 'related' | 'end' | 'inline')
      : 'inline';
    return {
      type,
      title: plainText(block.title, `${label} başlığı`, 180),
      description: plainText(block.description, `${label} açıklaması`, 600),
      label: plainText(block.label, `${label} butonu`, 80),
      href: safeHref(block.href, `${label} bağlantısı`),
      presentation,
    };
  }

  throw new BlogValidationError(`${label} türü desteklenmiyor.`);
}

function parseFaq(value: unknown): BlogFaq[] {
  return array(value, 'SSS', 40).map((entry, index) => {
    const item = record(entry, `SSS ${index + 1}`);
    return {
      question: plainText(item.question, `SSS ${index + 1} sorusu`, 300),
      answer: plainText(item.answer, `SSS ${index + 1} cevabı`, 2_000),
    };
  });
}

function parseSources(value: unknown): BlogSource[] {
  return array(value, 'Kaynaklar', 50).map((entry, index) => {
    const item = record(entry, `Kaynak ${index + 1}`);
    return {
      organization: plainText(
        item.organization,
        `Kaynak ${index + 1} kurumu`,
        200,
      ),
      title: plainText(item.title, `Kaynak ${index + 1} başlığı`, 300),
      url: safeHref(item.url, `Kaynak ${index + 1} bağlantısı`),
      lastVerifiedAt: optionalDate(
        item.lastVerifiedAt,
        `Kaynak ${index + 1} doğrulama tarihi`,
      ),
    };
  });
}

export function parseBlogPostInput(
  value: unknown,
  { postId }: { postId: string },
): BlogPostWriteInput {
  const input = record(value, 'Yazı');
  const title = plainText(input.title, 'Başlık', textLimits.title);
  const slug = normalizeBlogSlug(plainText(input.slug, 'Slug', 160));
  if (!slug || slug !== input.slug) {
    throw new BlogValidationError(
      'Slug yalnızca küçük harf, rakam ve tire içermeli.',
    );
  }
  if (input.status !== 'draft' && input.status !== 'published') {
    throw new BlogValidationError('Yayın durumu geçerli değil.');
  }
  const allowedCategories = new Set<string>([...BLOG_CATEGORIES, 'Deneyim']);
  const category = plainText(input.category, 'Kategori', textLimits.category);
  if (!allowedCategories.has(category)) {
    throw new BlogValidationError(
      'Kategori desteklenen seçeneklerden biri olmalı.',
    );
  }
  const searchIntent = String(input.searchIntent);
  if (
    !['informational', 'fresh-current', 'transactional-process'].includes(
      searchIntent,
    )
  ) {
    throw new BlogValidationError('Arama niyeti geçerli değil.');
  }
  const coverImage =
    input.coverImage === null || input.coverImage === undefined
      ? null
      : parseImage(input.coverImage, 'Kapak görseli', postId);
  const ogImage =
    input.ogImage === null || input.ogImage === undefined
      ? null
      : parseImage(input.ogImage, 'OG görseli', postId);
  const quickSummary = textList(input.quickSummary, 'Kısa özet', 5, 400);
  const cardTitle = plainText(
    input.cardTitle,
    'Kart başlığı',
    textLimits.title,
    {
      required: false,
    },
  );
  if (input.status === 'published' && quickSummary.length < 2) {
    throw new BlogValidationError(
      'Yayınlanan bir yazının kısa özeti en az 2 madde içermeli.',
    );
  }

  return {
    title,
    ...(cardTitle ? { cardTitle } : {}),
    slug,
    excerpt: plainText(input.excerpt, 'Kısa açıklama', textLimits.excerpt),
    category,
    author: plainText(input.author, 'Yazar', textLimits.author),
    status: input.status,
    primarySearchQuery: plainText(
      input.primarySearchQuery,
      'Birincil arama sorgusu',
      220,
    ),
    secondaryQueries: textList(
      input.secondaryQueries ?? [],
      'İkincil sorgular',
      20,
      220,
    ),
    searchIntent: searchIntent as BlogSearchIntent,
    seoTitle: plainText(input.seoTitle, 'SEO başlığı', textLimits.seoTitle, {
      required: false,
    }),
    metaDescription: plainText(
      input.metaDescription,
      'Meta description',
      textLimits.metaDescription,
      { required: false },
    ),
    primaryIntent: plainText(input.primaryIntent, 'Ana konu', 500),
    excludedTopics: textList(
      input.excludedTopics ?? [],
      'Ayrı yazıya bırakılacak konular',
      30,
      300,
    ),
    standfirst: textList(input.standfirst ?? [], 'Giriş', 2, 500),
    quickSummary,
    contentBlocks: array(input.contentBlocks, 'İçerik blokları', 240).map(
      (block, index) => parseBlock(block, index, postId),
    ),
    faq: parseFaq(input.faq),
    sources: parseSources(input.sources),
    relatedArticleIds: textList(
      input.relatedArticleIds,
      'İlgili yazılar',
      4,
      160,
    ).map(normalizeBlogSlug),
    coverImage,
    ogImage,
    featured: Boolean(input.featured),
    noindex: Boolean(input.noindex),
    lastVerifiedAt: optionalDate(input.lastVerifiedAt, 'Son doğrulama tarihi'),
  };
}

export function isAllowedBlogImage(file: Pick<File, 'size' | 'type'>) {
  if (file.type !== 'image/webp') {
    throw new BlogValidationError(
      'Yalnızca optimize edilmiş WebP görseli yüklenebilir.',
    );
  }
  if (file.size <= 0 || file.size > 1024 * 1024) {
    throw new BlogValidationError(
      'Optimize edilmiş görsel boyutu en fazla 1 MB olabilir.',
    );
  }
}
