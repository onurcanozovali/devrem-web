'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  ArrowDown,
  ArrowUp,
  Bold,
  Check,
  Eye,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Monitor,
  Plus,
  Save,
  Search,
  Send,
  Smartphone,
  Trash2,
  Undo2,
  X,
} from 'lucide-react';
import { BlogArticle } from '@/components/content/blog-article';
import { firestorePostToView } from '@/src/blog/legacy';
import { blogMediaUrl } from '@/src/blog/media';
import type {
  BlogContentBlock,
  BlogImage,
  BlogPostDocument,
  BlogPostWriteInput,
  BlogStatus,
} from '@/src/blog/types';
import { BLOG_CATEGORIES } from '@/src/blog/types';
import { normalizeBlogSlug } from '@/src/blog/validation';
import { siteConfig } from '@/src/config/site';

type RelatedOption = {
  id: string;
  title: string;
  status: BlogStatus;
};

type PreviewViewport = 'desktop' | 'mobile';

const emptyPost: BlogPostWriteInput = {
  title: '',
  slug: '',
  excerpt: '',
  category: 'Rehber',
  author: 'Devrem Editör',
  status: 'draft',
  primarySearchQuery: '',
  secondaryQueries: [],
  searchIntent: 'informational',
  seoTitle: '',
  metaDescription: '',
  primaryIntent: '',
  excludedTopics: [],
  standfirst: [],
  quickSummary: [],
  contentBlocks: [],
  faq: [],
  sources: [],
  relatedArticleIds: [],
  coverImage: null,
  ogImage: null,
  featured: false,
  noindex: false,
  lastVerifiedAt: null,
};

function editablePost(post?: BlogPostDocument): BlogPostWriteInput {
  if (!post) return emptyPost;
  const {
    id: _id,
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    publishedAt: _publishedAt,
    previousSlugs: _previousSlugs,
    ...fields
  } = post;
  return fields;
}

function cleanDraft(post: BlogPostWriteInput): BlogPostWriteInput {
  return {
    ...post,
    title: post.title.trim(),
    slug: post.slug.trim(),
    excerpt: post.excerpt.trim(),
    category: post.category.trim(),
    author: post.author.trim(),
    primarySearchQuery: post.primarySearchQuery.trim(),
    secondaryQueries: post.secondaryQueries
      .map((item) => item.trim())
      .filter(Boolean),
    seoTitle: post.seoTitle.trim(),
    metaDescription: post.metaDescription.trim(),
    primaryIntent: post.primaryIntent.trim(),
    excludedTopics: post.excludedTopics
      .map((item) => item.trim())
      .filter(Boolean),
    standfirst: post.standfirst.map((item) => item.trim()).filter(Boolean),
    quickSummary: post.quickSummary.map((item) => item.trim()).filter(Boolean),
    faq: post.faq
      .map((item) => ({
        question: item.question.trim(),
        answer: item.answer.trim(),
      }))
      .filter((item) => item.question || item.answer),
    sources: post.sources
      .map((item) => ({
        organization: item.organization.trim(),
        title: item.title.trim(),
        url: item.url.trim(),
        lastVerifiedAt: item.lastVerifiedAt || null,
      }))
      .filter((item) => item.organization || item.title || item.url),
  };
}

function newBlock(type: BlogContentBlock['type']): BlogContentBlock {
  if (type === 'paragraph') return { type, text: '' };
  if (type === 'heading') return { type, level: 2, text: '' };
  if (type === 'list') return { type, style: 'bullet', items: [''] };
  if (type === 'table') return { type, columns: [''], rows: [['']] };
  if (type === 'callout') {
    return { type, tone: 'info', title: '', body: '' };
  }
  if (type === 'checklist') return { type, items: [''] };
  if (type === 'image') return { type, path: '', url: '', alt: '' };
  return {
    type: 'cta',
    title: '',
    description: '',
    label: '',
    href: '/',
    presentation: 'inline',
  };
}

const blockTypeButtons: Array<{
  type: BlogContentBlock['type'];
  label: string;
}> = [
  { type: 'paragraph', label: 'Paragraf' },
  { type: 'heading', label: 'Başlık' },
  { type: 'list', label: 'Liste' },
  { type: 'table', label: 'Tablo' },
  { type: 'callout', label: 'Bilgi Kutusu' },
  { type: 'checklist', label: 'Kontrol Listesi' },
  { type: 'image', label: 'Görsel' },
  { type: 'cta', label: 'CTA' },
];

function TextListEditor({
  label,
  values,
  max,
  min = 0,
  reorderable = false,
  onChange,
}: {
  label: string;
  values: string[];
  max: number;
  min?: number;
  reorderable?: boolean;
  onChange: (values: string[]) => void;
}) {
  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= values.length) return;
    const next = [...values];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="admin-repeat-field">
      <div className="admin-repeat-heading">
        <strong>{label}</strong>
        <button
          disabled={values.length >= max}
          onClick={() => onChange([...values, ''])}
          type="button"
        >
          <Plus className="size-3.5" aria-hidden="true" /> Ekle
        </button>
      </div>
      {values.map((value, index) => (
        <div
          className={`admin-inline-field${reorderable ? ' admin-inline-field-reorderable' : ''}`}
          key={`${label}-${index}`}
        >
          <input
            aria-label={`${label} ${index + 1}`}
            onChange={(event) =>
              onChange(
                values.map((item, itemIndex) =>
                  itemIndex === index ? event.target.value : item,
                ),
              )
            }
            value={value}
          />
          {reorderable ? (
            <div className="admin-inline-actions">
              <button
                aria-label={`${label} ${index + 1} öğesini yukarı taşı`}
                disabled={index === 0}
                onClick={() => move(index, -1)}
                type="button"
              >
                <ArrowUp className="size-3.5" aria-hidden="true" />
              </button>
              <button
                aria-label={`${label} ${index + 1} öğesini aşağı taşı`}
                disabled={index === values.length - 1}
                onClick={() => move(index, 1)}
                type="button"
              >
                <ArrowDown className="size-3.5" aria-hidden="true" />
              </button>
              <button
                aria-label={`${label} ${index + 1} öğesini kaldır`}
                disabled={values.length <= min}
                onClick={() =>
                  onChange(values.filter((_, itemIndex) => itemIndex !== index))
                }
                type="button"
              >
                <Trash2 className="size-3.5" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <button
              aria-label={`${label} ${index + 1} öğesini kaldır`}
              disabled={values.length <= min}
              onClick={() =>
                onChange(values.filter((_, itemIndex) => itemIndex !== index))
              }
              type="button"
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </button>
          )}
        </div>
      ))}
      {!values.length ? <small>Henüz öğe eklenmedi.</small> : null}
    </div>
  );
}

function RichTextEditor({
  value,
  onChange,
  onConvertToList,
}: {
  value: string;
  onChange: (value: string) => void;
  onConvertToList: (style: 'bullet' | 'numbered') => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const replaceSelection = (
    prefix: string,
    suffix: string,
    placeholder: string,
  ) => {
    const textarea = textareaRef.current;
    const start = textarea?.selectionStart ?? value.length;
    const end = textarea?.selectionEnd ?? value.length;
    const selected = value.slice(start, end) || placeholder;
    const next = `${value.slice(0, start)}${prefix}${selected}${suffix}${value.slice(end)}`;
    onChange(next);
    requestAnimationFrame(() => {
      textarea?.focus();
      textarea?.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selected.length,
      );
    });
  };

  const addLink = (internal: boolean) => {
    const href = window.prompt(
      internal ? 'Blog bağlantısı' : 'Dış bağlantı',
      internal ? '/blog/' : 'https://',
    );
    if (!href) return;
    replaceSelection('[', `](${href})`, 'bağlantı metni');
  };

  return (
    <div className="admin-rich-text-field">
      <div className="admin-rich-text-toolbar" aria-label="Metin biçimlendirme">
        <button
          aria-label="Kalın"
          onClick={() => replaceSelection('**', '**', 'kalın metin')}
          title="Kalın"
          type="button"
        >
          <Bold className="size-3.5" aria-hidden="true" />
        </button>
        <button
          aria-label="İtalik"
          onClick={() => replaceSelection('*', '*', 'italik metin')}
          title="İtalik"
          type="button"
        >
          <Italic className="size-3.5" aria-hidden="true" />
        </button>
        <button
          aria-label="Dış bağlantı ekle"
          onClick={() => addLink(false)}
          title="Dış bağlantı"
          type="button"
        >
          <Link2 className="size-3.5" aria-hidden="true" />
        </button>
        <button
          aria-label="Blog bağlantısı ekle"
          onClick={() => addLink(true)}
          title="Blog bağlantısı"
          type="button"
        >
          <span className="admin-toolbar-blog">Blog</span>
        </button>
        <span aria-hidden="true" />
        <button
          aria-label="Madde işaretli listeye dönüştür"
          onClick={() => onConvertToList('bullet')}
          title="Madde listesine dönüştür"
          type="button"
        >
          <List className="size-3.5" aria-hidden="true" />
        </button>
        <button
          aria-label="Numaralı listeye dönüştür"
          onClick={() => onConvertToList('numbered')}
          title="Numaralı listeye dönüştür"
          type="button"
        >
          <ListOrdered className="size-3.5" aria-hidden="true" />
        </button>
      </div>
      <textarea
        aria-label="Paragraf"
        onChange={(event) => onChange(event.target.value)}
        ref={textareaRef}
        rows={5}
        value={value}
      />
      <small>
        Güvenli biçimlendirme desteklenir; HTML ve script çalıştırılmaz.
      </small>
    </div>
  );
}

function RelatedArticleSelect({
  options,
  value,
  onChange,
}: {
  options: RelatedOption[];
  value: string[];
  onChange: (value: string[]) => void;
}) {
  const [query, setQuery] = useState('');
  const selectable = options.filter(
    (option) => option.status === 'published' || value.includes(option.id),
  );
  const selected = value
    .map((id) => selectable.find((option) => option.id === id))
    .filter((option): option is RelatedOption => Boolean(option));
  const results = selectable.filter(
    (option) =>
      !value.includes(option.id) &&
      option.title
        .toLocaleLowerCase('tr-TR')
        .includes(query.toLocaleLowerCase('tr-TR')),
  );

  return (
    <div className="admin-related-select">
      <div
        className="admin-related-selected"
        aria-label="Seçili ilgili yazılar"
      >
        {selected.map((option) => (
          <span key={option.id}>
            {option.title}
            <button
              aria-label={`${option.title} seçimini kaldır`}
              onClick={() => onChange(value.filter((id) => id !== option.id))}
              type="button"
            >
              <X className="size-3" aria-hidden="true" />
            </button>
          </span>
        ))}
        {!selected.length ? <small>Henüz ilgili yazı seçilmedi.</small> : null}
      </div>
      <label className="admin-related-search">
        <Search className="size-4" aria-hidden="true" />
        <input
          aria-label="Yayınlanmış yazılarda ara"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Yayınlanmış yazılarda ara"
          value={query}
        />
        <small>{value.length}/4</small>
      </label>
      {query ? (
        <div className="admin-related-results">
          {results.slice(0, 8).map((option) => (
            <button
              disabled={value.length >= 4}
              key={option.id}
              onClick={() => {
                onChange([...value, option.id]);
                setQuery('');
              }}
              type="button"
            >
              <span>{option.title}</span>
              <Plus className="size-3.5" aria-hidden="true" />
            </button>
          ))}
          {!results.length ? <small>Eşleşen yayın bulunamadı.</small> : null}
        </div>
      ) : null}
    </div>
  );
}

type BlogImageKind = 'cover' | 'og' | 'content';

const acceptedBlogImageTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);
const maxBlogImageSourceBytes = 12 * 1024 * 1024;
const targetBlogImageBytes = 900 * 1024;

function canvasToWebp(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob || blob.type !== 'image/webp') {
          reject(new Error('Tarayıcı WebP dönüşümünü tamamlayamadı.'));
          return;
        }
        resolve(blob);
      },
      'image/webp',
      quality,
    );
  });
}

async function decodeBlogImage(file: File) {
  if ('createImageBitmap' in window) {
    const bitmap = await createImageBitmap(file);
    return {
      source: bitmap as CanvasImageSource,
      width: bitmap.width,
      height: bitmap.height,
      cleanup: () => bitmap.close(),
    };
  }

  const objectUrl = URL.createObjectURL(file);
  const image = document.createElement('img');
  image.decoding = 'async';
  image.src = objectUrl;
  await image.decode();
  return {
    source: image as CanvasImageSource,
    width: image.naturalWidth,
    height: image.naturalHeight,
    cleanup: () => URL.revokeObjectURL(objectUrl),
  };
}

async function optimizeBlogImage(file: File) {
  if (!acceptedBlogImageTypes.has(file.type)) {
    throw new Error('Yalnızca JPG, PNG veya WebP görsel yükleyebilirsin.');
  }
  if (file.size <= 0 || file.size > maxBlogImageSourceBytes) {
    throw new Error('Kaynak görsel en fazla 12 MB olabilir.');
  }

  const decoded = await decodeBlogImage(file);
  try {
    if (
      decoded.width <= 0 ||
      decoded.height <= 0 ||
      decoded.width * decoded.height > 60_000_000
    ) {
      throw new Error('Görsel çözünürlüğü güvenli sınırların dışında.');
    }

    const initialScale = Math.min(
      1,
      1600 / decoded.width,
      2400 / decoded.height,
    );
    let width = Math.max(1, Math.round(decoded.width * initialScale));
    let height = Math.max(1, Math.round(decoded.height * initialScale));
    let quality = 0.82;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { alpha: true });
    if (!context) throw new Error('Görsel işleme başlatılamadı.');

    for (let attempt = 0; attempt < 8; attempt += 1) {
      canvas.width = width;
      canvas.height = height;
      context.clearRect(0, 0, width, height);
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';
      context.drawImage(decoded.source, 0, 0, width, height);
      const blob = await canvasToWebp(canvas, quality);
      if (blob.size <= targetBlogImageBytes) {
        return new File([blob], 'image.webp', {
          type: 'image/webp',
          lastModified: Date.now(),
        });
      }

      if (quality > 0.68) {
        quality -= 0.07;
      } else {
        width = Math.max(1, Math.round(width * 0.84));
        height = Math.max(1, Math.round(height * 0.84));
        quality = 0.75;
      }
    }
  } finally {
    decoded.cleanup();
  }

  throw new Error('Görsel 1 MB sınırının altına indirilemedi.');
}

function referencesSameImage(left: BlogImage | null, right: BlogImage | null) {
  return Boolean(left?.path && right?.path && left.path === right.path);
}

function ImageUploader({
  postId,
  image,
  onChange,
  kind = 'content',
}: {
  postId: string;
  image: BlogImage;
  onChange: (image: BlogImage) => void;
  kind?: BlogImageKind;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [uploadInfo, setUploadInfo] = useState('');

  return (
    <div className="admin-image-fields">
      <label className="admin-upload-button">
        <ImagePlus className="size-4" aria-hidden="true" />
        {busy ? 'Yükleniyor…' : image.url ? 'Görseli değiştir' : 'Görsel yükle'}
        <input
          accept="image/jpeg,image/png,image/webp"
          disabled={busy}
          onChange={async (event) => {
            const input = event.currentTarget;
            const file = input.files?.[0];
            if (!file) return;
            setBusy(true);
            setError('');
            setUploadInfo('');
            try {
              const optimized = await optimizeBlogImage(file);
              const response = await fetch(
                `/api/admin/blog/${postId}/images?kind=${kind}`,
                {
                  method: 'POST',
                  headers: { 'content-type': 'image/webp' },
                  body: optimized,
                },
              );
              const result = (await response.json().catch(() => ({}))) as {
                path?: string;
                url?: string;
                error?: string;
              };
              if (!response.ok || !result.path || !result.url) {
                throw new Error(
                  result.error ??
                    (response.status === 413
                      ? 'Optimize edilmiş görsel sunucu sınırını aştı.'
                      : 'Görsel yüklenemedi.'),
                );
              }
              onChange({ ...image, path: result.path, url: result.url });
              setUploadInfo(
                `WebP olarak optimize edildi · ${Math.max(1, Math.round(optimized.size / 1024))} KB`,
              );
            } catch (uploadError) {
              setError(
                uploadError instanceof Error
                  ? uploadError.message
                  : 'Görsel yüklenemedi.',
              );
            } finally {
              input.value = '';
              setBusy(false);
            }
          }}
          type="file"
        />
      </label>
      {image.url ? (
        <Image
          className="admin-image-preview"
          alt="Yüklenen önizleme"
          height={360}
          src={blogMediaUrl(image)}
          unoptimized
          width={640}
        />
      ) : null}
      <label>
        <span>Alt metin *</span>
        <input
          onChange={(event) => onChange({ ...image, alt: event.target.value })}
          value={image.alt}
        />
      </label>
      <label>
        <span>Görsel açıklaması</span>
        <input
          onChange={(event) =>
            onChange({ ...image, caption: event.target.value })
          }
          value={image.caption ?? ''}
        />
      </label>
      {uploadInfo ? (
        <small className="admin-upload-info">{uploadInfo}</small>
      ) : null}
      {error ? <p className="admin-form-error">{error}</p> : null}
    </div>
  );
}

function ContentBlockEditor({
  postId,
  blocks,
  onChange,
}: {
  postId: string;
  blocks: BlogContentBlock[];
  onChange: (blocks: BlogContentBlock[]) => void;
}) {
  const blockListRef = useRef<HTMLDivElement>(null);
  const pendingFocusIndex = useRef<number | null>(null);
  const update = (index: number, block: BlogContentBlock) =>
    onChange(
      blocks.map((item, itemIndex) => (itemIndex === index ? block : item)),
    );

  useEffect(() => {
    const index = pendingFocusIndex.current;
    if (index === null || index >= blocks.length) return;
    pendingFocusIndex.current = null;

    const frame = requestAnimationFrame(() => {
      const block = blockListRef.current?.querySelector<HTMLElement>(
        `[data-block-index="${index}"]`,
      );
      const firstField = block?.querySelector<HTMLElement>(
        'input:not([type="file"]), textarea, select',
      );
      firstField?.focus({ preventScroll: true });
      block?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });

    return () => cancelAnimationFrame(frame);
  }, [blocks.length]);

  const appendBlock = (type: BlogContentBlock['type']) => {
    pendingFocusIndex.current = blocks.length;
    onChange([...blocks, newBlock(type)]);
  };

  return (
    <section className="admin-editor-section admin-block-editor">
      <div className="admin-section-heading">
        <div>
          <p className="admin-kicker">Makale gövdesi</p>
          <h2>İçerik blokları</h2>
        </div>
      </div>

      <div className="admin-block-list" ref={blockListRef}>
        {blocks.map((block, index) => (
          <article
            className="admin-block-card"
            data-block-index={index}
            key={`${block.type}-${index}`}
          >
            <div className="admin-block-toolbar">
              <strong>
                {index + 1}. {block.type}
              </strong>
              <div>
                <button
                  aria-label="Yukarı taşı"
                  disabled={index === 0}
                  onClick={() => {
                    const next = [...blocks];
                    [next[index - 1], next[index]] = [
                      next[index],
                      next[index - 1],
                    ];
                    onChange(next);
                  }}
                  type="button"
                >
                  <ArrowUp className="size-4" aria-hidden="true" />
                </button>
                <button
                  aria-label="Aşağı taşı"
                  disabled={index === blocks.length - 1}
                  onClick={() => {
                    const next = [...blocks];
                    [next[index], next[index + 1]] = [
                      next[index + 1],
                      next[index],
                    ];
                    onChange(next);
                  }}
                  type="button"
                >
                  <ArrowDown className="size-4" aria-hidden="true" />
                </button>
                <button
                  aria-label="Bloğu sil"
                  onClick={() =>
                    onChange(
                      blocks.filter((_, itemIndex) => itemIndex !== index),
                    )
                  }
                  type="button"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            {block.type === 'paragraph' ? (
              <RichTextEditor
                onChange={(text) => update(index, { ...block, text })}
                onConvertToList={(style) =>
                  update(index, {
                    type: 'list',
                    style,
                    items: block.text
                      ? block.text.split('\n').filter(Boolean)
                      : [''],
                  })
                }
                value={block.text}
              />
            ) : null}
            {block.type === 'heading' ? (
              <div className="admin-grid-two">
                <label>
                  <span>Seviye</span>
                  <select
                    onChange={(event) =>
                      update(index, {
                        ...block,
                        level: Number(event.target.value) as 2 | 3,
                      })
                    }
                    value={block.level}
                  >
                    <option value="2">H2</option>
                    <option value="3">H3</option>
                  </select>
                </label>
                <label>
                  <span>Başlık</span>
                  <input
                    onChange={(event) =>
                      update(index, { ...block, text: event.target.value })
                    }
                    value={block.text}
                  />
                </label>
              </div>
            ) : null}
            {block.type === 'list' ? (
              <div className="admin-grid-two admin-grid-wide-second">
                <label>
                  <span>Liste türü</span>
                  <select
                    onChange={(event) =>
                      update(index, {
                        ...block,
                        style: event.target.value as 'bullet' | 'numbered',
                      })
                    }
                    value={block.style}
                  >
                    <option value="bullet">Madde işaretli</option>
                    <option value="numbered">Numaralı</option>
                  </select>
                </label>
                <label>
                  <span>Her satır bir madde</span>
                  <textarea
                    onChange={(event) =>
                      update(index, {
                        ...block,
                        items: event.target.value.split('\n'),
                      })
                    }
                    rows={5}
                    value={block.items.join('\n')}
                  />
                </label>
              </div>
            ) : null}
            {block.type === 'table' ? (
              <div className="admin-table-fields">
                <label>
                  <span>Sütunlar (| ile ayır)</span>
                  <input
                    onChange={(event) =>
                      update(index, {
                        ...block,
                        columns: event.target.value
                          .split('|')
                          .map((item) => item.trim()),
                      })
                    }
                    value={block.columns.join(' | ')}
                  />
                </label>
                <label>
                  <span>Satırlar (her satırda | ile ayır)</span>
                  <textarea
                    onChange={(event) =>
                      update(index, {
                        ...block,
                        rows: event.target.value
                          .split('\n')
                          .map((row) =>
                            row.split('|').map((cell) => cell.trim()),
                          ),
                      })
                    }
                    rows={6}
                    value={block.rows.map((row) => row.join(' | ')).join('\n')}
                  />
                </label>
                <div className="admin-grid-two">
                  <label>
                    <span>Tablo başlığı</span>
                    <input
                      onChange={(event) =>
                        update(index, { ...block, caption: event.target.value })
                      }
                      value={block.caption ?? ''}
                    />
                  </label>
                  <label>
                    <span>Tablo notu</span>
                    <input
                      onChange={(event) =>
                        update(index, { ...block, note: event.target.value })
                      }
                      value={block.note ?? ''}
                    />
                  </label>
                </div>
              </div>
            ) : null}
            {block.type === 'callout' ? (
              <div className="admin-table-fields">
                <div className="admin-grid-two">
                  <label>
                    <span>Tür</span>
                    <select
                      onChange={(event) =>
                        update(index, {
                          ...block,
                          tone: event.target.value as typeof block.tone,
                        })
                      }
                      value={block.tone}
                    >
                      <option value="info">Bilgi</option>
                      <option value="important">Önemli</option>
                      <option value="warning">Uyarı</option>
                      <option value="tip">İpucu</option>
                    </select>
                  </label>
                  <label>
                    <span>Başlık</span>
                    <input
                      onChange={(event) =>
                        update(index, { ...block, title: event.target.value })
                      }
                      value={block.title}
                    />
                  </label>
                </div>
                <label>
                  <span>Metin</span>
                  <textarea
                    onChange={(event) =>
                      update(index, { ...block, body: event.target.value })
                    }
                    rows={4}
                    value={block.body}
                  />
                </label>
              </div>
            ) : null}
            {block.type === 'checklist' ? (
              <label>
                <span>Her satır bir kontrol maddesi</span>
                <textarea
                  onChange={(event) =>
                    update(index, {
                      ...block,
                      items: event.target.value.split('\n'),
                    })
                  }
                  rows={5}
                  value={block.items.join('\n')}
                />
              </label>
            ) : null}
            {block.type === 'image' ? (
              <ImageUploader
                kind="content"
                postId={postId}
                image={block}
                onChange={(image) => update(index, { type: 'image', ...image })}
              />
            ) : null}
            {block.type === 'cta' ? (
              <div className="admin-table-fields">
                <div className="admin-grid-two">
                  <label>
                    <span>Sunum</span>
                    <select
                      onChange={(event) =>
                        update(index, {
                          ...block,
                          presentation: event.target.value as
                            | 'inline'
                            | 'related'
                            | 'end',
                        })
                      }
                      value={block.presentation ?? 'inline'}
                    >
                      <option value="inline">İçerik içi</option>
                      <option value="related">İlgili bağlantı</option>
                      <option value="end">Yazı sonu</option>
                    </select>
                  </label>
                  <label>
                    <span>Başlık</span>
                    <input
                      onChange={(event) =>
                        update(index, { ...block, title: event.target.value })
                      }
                      value={block.title}
                    />
                  </label>
                </div>
                <label>
                  <span>Açıklama</span>
                  <textarea
                    onChange={(event) =>
                      update(index, {
                        ...block,
                        description: event.target.value,
                      })
                    }
                    rows={3}
                    value={block.description}
                  />
                </label>
                <div className="admin-grid-two">
                  <label>
                    <span>Buton metni</span>
                    <input
                      onChange={(event) =>
                        update(index, { ...block, label: event.target.value })
                      }
                      value={block.label}
                    />
                  </label>
                  <label>
                    <span>Bağlantı</span>
                    <input
                      onChange={(event) =>
                        update(index, { ...block, href: event.target.value })
                      }
                      value={block.href}
                    />
                  </label>
                </div>
              </div>
            ) : null}
          </article>
        ))}
        {!blocks.length ? (
          <p className="admin-block-empty-hint">
            İlk içerik türünü seçerek yazmaya başla.
          </p>
        ) : null}
        <div className="admin-block-inserter">
          <p>İçerik ekle</p>
          <div className="admin-block-type-buttons">
            {blockTypeButtons.map((option) => (
              <button
                key={option.type}
                onClick={() => appendBlock(option.type)}
                type="button"
              >
                <Plus className="size-3.5" aria-hidden="true" />
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function BlogPreviewDialog({
  post,
  viewport,
  onViewportChange,
  onClose,
}: {
  post: ReturnType<typeof firestorePostToView>;
  viewport: PreviewViewport;
  onViewportChange: (viewport: PreviewViewport) => void;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [previewRoot, setPreviewRoot] = useState<HTMLElement | null>(null);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (!dialog.open) dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const updateSize = () => {
      const styles = window.getComputedStyle(stage);
      const horizontalPadding =
        Number.parseFloat(styles.paddingLeft) +
        Number.parseFloat(styles.paddingRight);
      const verticalPadding =
        Number.parseFloat(styles.paddingTop) +
        Number.parseFloat(styles.paddingBottom);
      setStageSize({
        width: Math.max(0, stage.clientWidth - horizontalPadding),
        height: Math.max(0, stage.clientHeight - verticalPadding),
      });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  const requestedWidth = viewport === 'desktop' ? 1240 : 390;
  const previewScale =
    viewport === 'desktop' && stageSize.width
      ? Math.min(1, stageSize.width / requestedWidth)
      : 1;
  const previewWidth =
    viewport === 'mobile' && stageSize.width
      ? Math.min(requestedWidth, stageSize.width)
      : requestedWidth;
  const previewHeight = stageSize.height
    ? stageSize.height / previewScale
    : 720;

  function initializePreviewDocument() {
    const previewDocument = iframeRef.current?.contentDocument;
    if (!previewDocument) return;

    const base = previewDocument.createElement('base');
    base.href = window.location.origin;

    const viewportMeta = previewDocument.createElement('meta');
    viewportMeta.name = 'viewport';
    viewportMeta.content = 'width=device-width, initial-scale=1';

    const previewStyle = previewDocument.createElement('style');
    previewStyle.textContent =
      'html, body, #devrem-blog-preview-root { min-height: 100%; margin: 0; } body { overflow-y: scroll; }';

    const sharedStyles = Array.from(
      document.head.querySelectorAll('link[rel="stylesheet"], style'),
      (node) => node.cloneNode(true),
    );

    previewDocument.head.replaceChildren(
      base,
      viewportMeta,
      ...sharedStyles,
      previewStyle,
    );
    previewDocument.documentElement.lang = 'tr';
    previewDocument.documentElement.className = document.documentElement.className;
    previewDocument.body.className = document.body.className;

    const root = previewDocument.createElement('div');
    root.id = 'devrem-blog-preview-root';
    previewDocument.body.replaceChildren(root);
    setPreviewRoot(root);
  }

  return (
    <dialog
      className="admin-preview-overlay"
      ref={dialogRef}
      aria-label="Yazı önizlemesi"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <div className="admin-preview-toolbar">
        <div className="admin-preview-toolbar-copy">
          <strong>Canlı yazı önizlemesi</strong>
          <span>Kaydetmeden önce güncel taslağı gösterir.</span>
        </div>
        <div className="admin-preview-tools">
          <div
            className="admin-preview-toggle"
            aria-label="Önizleme genişliği"
          >
            <button
              aria-pressed={viewport === 'desktop'}
              onClick={() => onViewportChange('desktop')}
              type="button"
            >
              <Monitor className="size-4" aria-hidden="true" /> Masaüstü
            </button>
            <button
              aria-pressed={viewport === 'mobile'}
              onClick={() => onViewportChange('mobile')}
              type="button"
            >
              <Smartphone className="size-4" aria-hidden="true" /> Mobil
            </button>
          </div>
          <button onClick={onClose} type="button">
            <X className="size-4" aria-hidden="true" /> Kapat
          </button>
        </div>
      </div>
      <div className="admin-preview-stage" ref={stageRef}>
        <div
          className="admin-preview-viewport"
          style={{
            height: stageSize.height || undefined,
            width: previewWidth * previewScale,
          }}
        >
          <div
            className={`admin-preview-frame admin-preview-frame-${viewport}`}
            style={{
              height: previewHeight,
              transform: `scale(${previewScale})`,
              width: previewWidth,
            }}
          >
            {!previewRoot ? (
              <output className="admin-preview-loading">
                Önizleme hazırlanıyor…
              </output>
            ) : null}
            <iframe
              className="admin-preview-iframe"
              onLoad={initializePreviewDocument}
              ref={iframeRef}
              srcDoc="<!doctype html><html lang='tr'><head></head><body></body></html>"
              title={`${viewport === 'desktop' ? 'Masaüstü' : 'Mobil'} blog yazısı önizlemesi`}
            />
            {previewRoot
              ? createPortal(
                  <div
                    className="admin-preview-document article-page editorial-surface"
                    onClickCapture={(event) => {
                      const target = event.target as Element;
                      const link = target.closest('a');
                      if (!link || link.getAttribute('href')?.startsWith('#')) {
                        return;
                      }
                      event.preventDefault();
                      event.stopPropagation();
                    }}
                  >
                    <div className="container-shell">
                      <BlogArticle post={post} />
                    </div>
                  </div>,
                  previewRoot,
                )
              : null}
          </div>
        </div>
      </div>
    </dialog>
  );
}

export function BlogEditor({
  postId,
  initialPost,
  relatedOptions,
  previewOnLoad = false,
}: {
  postId: string;
  initialPost?: BlogPostDocument;
  relatedOptions: RelatedOption[];
  previewOnLoad?: boolean;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState(() => editablePost(initialPost));
  const [persisted, setPersisted] = useState(Boolean(initialPost));
  const [savedSlug, setSavedSlug] = useState(initialPost?.slug ?? '');
  const [publishedAt, setPublishedAt] = useState(
    initialPost?.publishedAt ?? null,
  );
  const [slugTouched, setSlugTouched] = useState(Boolean(initialPost));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [previewOpen, setPreviewOpen] = useState(previewOnLoad);
  const [previewViewport, setPreviewViewport] =
    useState<PreviewViewport>('desktop');
  const isNew = !persisted;
  const previewPost = useMemo(() => {
    const now = new Date().toISOString();
    return firestorePostToView({
      id: postId,
      ...cleanDraft(draft),
      publishedAt: publishedAt ?? (draft.status === 'published' ? now : null),
      createdAt: initialPost?.createdAt ?? now,
      updatedAt: now,
      previousSlugs: initialPost?.previousSlugs ?? [],
    });
  }, [
    draft,
    initialPost?.createdAt,
    initialPost?.previousSlugs,
    postId,
    publishedAt,
  ]);
  const canonicalUrl = `${siteConfig.url}/blog/${draft.slug || 'yazi-slug'}`;
  const hasLegacyCategory = !BLOG_CATEGORIES.some(
    (category) => category === draft.category,
  );
  const slugWillRedirect = Boolean(
    publishedAt && savedSlug && draft.slug !== savedSlug,
  );
  const hasInternalLink = Boolean(
    draft.relatedArticleIds.length ||
      draft.contentBlocks.some((block) => {
        if (block.type === 'cta') return block.href.startsWith('/');
        if (block.type === 'paragraph') {
          return /href=["']\//i.test(block.text);
        }
        return false;
      }),
  );

  async function save(status: BlogStatus) {
    setBusy(true);
    setError('');
    setMessage('');
    const payload = cleanDraft({ ...draft, status });
    if (
      publishedAt &&
      savedSlug &&
      payload.slug !== savedSlug &&
      !window.confirm(
        `Bu yazı daha önce /blog/${savedSlug} adresinde yayınlandı. Slug değişirse eski adres yeni adrese kalıcı olarak yönlendirilecek. Devam edilsin mi?`,
      )
    ) {
      setBusy(false);
      return;
    }
    const response = await fetch(
      isNew ? '/api/admin/blog' : `/api/admin/blog/${postId}`,
      {
        method: isNew ? 'POST' : 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(
          isNew ? { id: postId, post: payload } : { post: payload },
        ),
      },
    );
    const result = (await response.json()) as {
      post?: BlogPostDocument;
      error?: string;
    };
    setBusy(false);
    if (!response.ok || !result.post) {
      setError(result.error ?? 'Yazı kaydedilemedi.');
      return;
    }
    setDraft(editablePost(result.post));
    setPersisted(true);
    setSavedSlug(result.post.slug);
    setPublishedAt(result.post.publishedAt);
    setMessage(
      status === 'published' ? 'Yazı yayınlandı.' : 'Taslak kaydedildi.',
    );
    if (isNew) router.replace(`/admin/blog/${postId}`);
    router.refresh();
  }

  return (
    <main className="admin-main admin-editor-page" id="ana-icerik">
      <div className="admin-page-heading">
        <div>
          <p className="admin-kicker">
            {isNew ? 'Yeni içerik' : 'Yazıyı düzenle'}
          </p>
          <h1>{isNew ? 'Yeni Blog Yazısı' : draft.title}</h1>
          <p>
            Alanları doldur, içerik bloklarını sırala ve yayınlamadan önce
            önizle.
          </p>
        </div>
        <span className={`admin-status admin-status-${draft.status}`}>
          {draft.status === 'published' ? 'Yayında' : 'Taslak'}
        </span>
      </div>

      <div className="admin-editor-layout">
        <div className="admin-editor-content">
          <section className="admin-editor-section">
            <div className="admin-section-heading">
              <div>
                <p className="admin-kicker">Temel bilgiler</p>
                <h2>Yazı bilgileri</h2>
              </div>
            </div>
            <div className="admin-form-grid">
              <label className="admin-field-full">
                <span>Başlık</span>
                <input
                  onChange={(event) => {
                    const title = event.target.value;
                    setDraft((current) => ({
                      ...current,
                      title,
                      slug: slugTouched
                        ? current.slug
                        : normalizeBlogSlug(title),
                    }));
                  }}
                  value={draft.title}
                />
              </label>
              <label>
                <span>Slug</span>
                <input
                  onChange={(event) => {
                    setSlugTouched(true);
                    setDraft({
                      ...draft,
                      slug: normalizeBlogSlug(event.target.value),
                    });
                  }}
                  value={draft.slug}
                />
                {slugWillRedirect ? (
                  <small className="admin-field-warning">
                    Eski adres kalıcı olarak yeni slug’a yönlendirilecek.
                  </small>
                ) : null}
              </label>
              <label>
                <span>Kategori</span>
                <select
                  onChange={(event) =>
                    setDraft({ ...draft, category: event.target.value })
                  }
                  value={draft.category}
                >
                  {hasLegacyCategory ? (
                    <option value={draft.category}>
                      {draft.category} (mevcut)
                    </option>
                  ) : null}
                  {BLOG_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Yazar</span>
                <input
                  onChange={(event) =>
                    setDraft({ ...draft, author: event.target.value })
                  }
                  value={draft.author}
                />
              </label>
              <label className="admin-field-full">
                <span>Kısa açıklama</span>
                <textarea
                  onChange={(event) =>
                    setDraft({ ...draft, excerpt: event.target.value })
                  }
                  rows={3}
                  value={draft.excerpt}
                />
              </label>
              <label className="admin-field-full admin-checkbox-field">
                <input
                  checked={draft.featured}
                  onChange={(event) =>
                    setDraft({ ...draft, featured: event.target.checked })
                  }
                  type="checkbox"
                />
                <span>Öne çıkan yazı olarak göster</span>
              </label>
            </div>
          </section>

          <section className="admin-editor-section">
            <div className="admin-section-heading">
              <div>
                <p className="admin-kicker">Arama görünümü</p>
                <h2>SEO</h2>
              </div>
            </div>
            <div className="admin-form-grid">
              <label className="admin-field-full">
                <span>Primary Search Query *</span>
                <input
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      primarySearchQuery: event.target.value,
                    })
                  }
                  required
                  value={draft.primarySearchQuery}
                />
                <small>Yalnızca editoryal planlamada kullanılır.</small>
              </label>
              <div className="admin-field-full">
                <TextListEditor
                  label="Secondary Queries"
                  max={20}
                  onChange={(secondaryQueries) =>
                    setDraft({ ...draft, secondaryQueries })
                  }
                  values={draft.secondaryQueries}
                />
              </div>
              <label>
                <span>Search Intent</span>
                <select
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      searchIntent: event.target
                        .value as typeof draft.searchIntent,
                    })
                  }
                  value={draft.searchIntent}
                >
                  <option value="informational">Informational</option>
                  <option value="fresh-current">Fresh / Current</option>
                  <option value="transactional-process">
                    Transactional / Process
                  </option>
                </select>
              </label>
              <label>
                <span>Canonical URL</span>
                <input aria-readonly="true" readOnly value={canonicalUrl} />
                <small>Slug’dan otomatik üretilir.</small>
              </label>
              <label className="admin-field-full">
                <span>SEO Başlığı</span>
                <input
                  onChange={(event) =>
                    setDraft({ ...draft, seoTitle: event.target.value })
                  }
                  value={draft.seoTitle}
                />
                <small
                  className={
                    draft.seoTitle.length > 60 ? 'admin-counter-warning' : ''
                  }
                >
                  {draft.seoTitle.length} karakter · yaklaşık 60 önerilir
                </small>
              </label>
              <label className="admin-field-full">
                <span>Meta Description</span>
                <textarea
                  onChange={(event) =>
                    setDraft({ ...draft, metaDescription: event.target.value })
                  }
                  rows={3}
                  value={draft.metaDescription}
                />
                <small
                  className={
                    draft.metaDescription.length > 160 ||
                    (draft.metaDescription.length > 0 &&
                      draft.metaDescription.length < 145)
                      ? 'admin-counter-warning'
                      : ''
                  }
                >
                  {draft.metaDescription.length} karakter · 155–160 önerilir
                </small>
              </label>
              <label className="admin-field-full admin-checkbox-field">
                <input
                  checked={draft.noindex}
                  onChange={(event) =>
                    setDraft({ ...draft, noindex: event.target.checked })
                  }
                  type="checkbox"
                />
                <span>
                  Arama motorlarından gizle (noindex; sitemap dışında tutulur)
                </span>
              </label>
            </div>
            {draft.status === 'published' && draft.noindex ? (
              <output className="admin-field-warning">
                Bu yazı yayınlandığında erişilebilir kalır; ancak arama
                motorlarına noindex gönderilir ve sitemap’e eklenmez.
              </output>
            ) : null}
            {draft.status === 'published' &&
            (!draft.seoTitle.trim() || !draft.metaDescription.trim()) ? (
              <output className="admin-field-warning">
                Yayın öncesi SEO başlığı ve meta açıklamasını tamamlayın.
              </output>
            ) : null}
            {draft.status === 'published' &&
            !draft.ogImage &&
            !draft.coverImage ? (
              <output className="admin-field-warning">
                Yazıya özel OG veya kapak görseli yok; varsayılan Devrem görseli
                kullanılacak.
              </output>
            ) : null}
            {draft.status === 'published' && !hasInternalLink ? (
              <output className="admin-field-warning">
                Yazıda ölçülebilen bir iç bağlantı yok. İlgili bir rehber veya
                araç bağlantısı eklemeyi değerlendirin.
              </output>
            ) : null}
            <div
              className="admin-serp-preview"
              aria-label="Google arama sonucu önizlemesi"
            >
              <span>{canonicalUrl.replace('https://', '')}</span>
              <strong>{draft.seoTitle || draft.title || 'SEO başlığı'}</strong>
              <p>
                {draft.metaDescription ||
                  draft.excerpt ||
                  'Meta açıklaması burada görünür.'}
              </p>
            </div>
            <div className="admin-seo-image">
              <div className="admin-section-heading">
                <div>
                  <p className="admin-kicker">Opsiyonel</p>
                  <h3>OG görseli</h3>
                </div>
                {draft.ogImage ? (
                  <button
                    onClick={() => setDraft({ ...draft, ogImage: null })}
                    type="button"
                  >
                    <Trash2 className="size-4" aria-hidden="true" /> Kaldır
                  </button>
                ) : null}
              </div>
              {draft.ogImage ? (
                <ImageUploader
                  kind="og"
                  postId={postId}
                  image={draft.ogImage}
                  onChange={(ogImage) => setDraft({ ...draft, ogImage })}
                />
              ) : (
                <button
                  className="admin-dashed-button"
                  onClick={() =>
                    setDraft({
                      ...draft,
                      ogImage: { path: '', url: '', alt: '' },
                    })
                  }
                  type="button"
                >
                  <ImagePlus className="size-4" aria-hidden="true" /> OG görseli
                  ekle
                </button>
              )}
            </div>
          </section>

          <section className="admin-editor-section">
            <div className="admin-section-heading">
              <div>
                <p className="admin-kicker">Editoryal kapsam</p>
                <h2>İçerik odağı</h2>
              </div>
            </div>
            <div className="admin-form-grid">
              <label className="admin-field-full">
                <span>Ana konu / Primary intent</span>
                <textarea
                  onChange={(event) =>
                    setDraft({ ...draft, primaryIntent: event.target.value })
                  }
                  rows={2}
                  value={draft.primaryIntent}
                />
                <small>
                  Bu alan ve aşağıdaki kapsam notları public sayfada görünmez.
                </small>
              </label>
              <div className="admin-field-full">
                <TextListEditor
                  label="Ayrı yazıya bırakılacak konular"
                  max={30}
                  onChange={(excludedTopics) =>
                    setDraft({ ...draft, excludedTopics })
                  }
                  values={draft.excludedTopics}
                />
              </div>
              <label>
                <span>Son doğrulama tarihi</span>
                <input
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      lastVerifiedAt: event.target.value || null,
                    })
                  }
                  type="date"
                  value={draft.lastVerifiedAt ?? ''}
                />
                <small>Yalnızca editör açıkça güncellediğinde değişir.</small>
              </label>
              <div className="admin-verified-action">
                <button
                  onClick={() =>
                    setDraft({
                      ...draft,
                      lastVerifiedAt: new Date().toISOString().slice(0, 10),
                    })
                  }
                  type="button"
                >
                  <Check className="size-4" aria-hidden="true" /> Bilgiyi bugün
                  doğruladım
                </button>
              </div>
            </div>
          </section>

          <section className="admin-editor-section admin-summary-grid">
            <TextListEditor
              label="Giriş / standfirst"
              max={2}
              onChange={(standfirst) => setDraft({ ...draft, standfirst })}
              values={draft.standfirst}
            />
            <TextListEditor
              label="Kısa Özet"
              max={5}
              reorderable
              onChange={(quickSummary) => setDraft({ ...draft, quickSummary })}
              values={draft.quickSummary}
            />
          </section>

          <ContentBlockEditor
            postId={postId}
            blocks={draft.contentBlocks}
            onChange={(contentBlocks) => setDraft({ ...draft, contentBlocks })}
          />

          <section className="admin-editor-section admin-pair-editor">
            <div className="admin-section-heading">
              <div>
                <p className="admin-kicker">Yapılandırılmış içerik</p>
                <h2>SSS</h2>
              </div>
              <button
                onClick={() =>
                  setDraft({
                    ...draft,
                    faq: [...draft.faq, { question: '', answer: '' }],
                  })
                }
                type="button"
              >
                <Plus className="size-4" aria-hidden="true" /> Soru ekle
              </button>
            </div>
            {draft.faq.map((item, index) => (
              <div className="admin-pair-row" key={`faq-${index}`}>
                <input
                  aria-label={`SSS ${index + 1} sorusu`}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      faq: draft.faq.map((faq, itemIndex) =>
                        itemIndex === index
                          ? { ...faq, question: event.target.value }
                          : faq,
                      ),
                    })
                  }
                  placeholder="Soru"
                  value={item.question}
                />
                <textarea
                  aria-label={`SSS ${index + 1} cevabı`}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      faq: draft.faq.map((faq, itemIndex) =>
                        itemIndex === index
                          ? { ...faq, answer: event.target.value }
                          : faq,
                      ),
                    })
                  }
                  placeholder="Cevap"
                  rows={3}
                  value={item.answer}
                />
                <button
                  aria-label="Soruyu kaldır"
                  onClick={() =>
                    setDraft({
                      ...draft,
                      faq: draft.faq.filter(
                        (_, itemIndex) => itemIndex !== index,
                      ),
                    })
                  }
                  type="button"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </button>
              </div>
            ))}
          </section>

          <section className="admin-editor-section admin-pair-editor">
            <div className="admin-section-heading">
              <div>
                <p className="admin-kicker">Referanslar</p>
                <h2>Kaynaklar</h2>
              </div>
              <button
                onClick={() =>
                  setDraft({
                    ...draft,
                    sources: [
                      ...draft.sources,
                      {
                        organization: '',
                        title: '',
                        url: '',
                        lastVerifiedAt: null,
                      },
                    ],
                  })
                }
                type="button"
              >
                <Plus className="size-4" aria-hidden="true" /> Kaynak ekle
              </button>
            </div>
            {draft.sources.map((item, index) => (
              <div className="admin-source-card" key={`source-${index}`}>
                <div className="admin-source-card-heading">
                  <strong>{index + 1}. kaynak</strong>
                  <button
                    aria-label="Kaynağı kaldır"
                    onClick={() =>
                      setDraft({
                        ...draft,
                        sources: draft.sources.filter(
                          (_, itemIndex) => itemIndex !== index,
                        ),
                      })
                    }
                    type="button"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </button>
                </div>
                <div className="admin-form-grid">
                  <label>
                    <span>Kurum</span>
                    <input
                      aria-label={`Kaynak ${index + 1} kurumu`}
                      onChange={(event) =>
                        setDraft({
                          ...draft,
                          sources: draft.sources.map((source, itemIndex) =>
                            itemIndex === index
                              ? { ...source, organization: event.target.value }
                              : source,
                          ),
                        })
                      }
                      placeholder="Millî Savunma Bakanlığı"
                      value={item.organization}
                    />
                  </label>
                  <label>
                    <span>Kaynak başlığı</span>
                    <input
                      aria-label={`Kaynak ${index + 1} başlığı`}
                      onChange={(event) =>
                        setDraft({
                          ...draft,
                          sources: draft.sources.map((source, itemIndex) =>
                            itemIndex === index
                              ? { ...source, title: event.target.value }
                              : source,
                          ),
                        })
                      }
                      placeholder="2026 Yılı Celp-Sevk Takvimi"
                      value={item.title}
                    />
                  </label>
                  <label className="admin-field-full">
                    <span>URL</span>
                    <input
                      aria-label={`Kaynak ${index + 1} bağlantısı`}
                      onChange={(event) =>
                        setDraft({
                          ...draft,
                          sources: draft.sources.map((source, itemIndex) =>
                            itemIndex === index
                              ? { ...source, url: event.target.value }
                              : source,
                          ),
                        })
                      }
                      placeholder="https://"
                      value={item.url}
                    />
                  </label>
                  <label>
                    <span>Son kontrol</span>
                    <input
                      aria-label={`Kaynak ${index + 1} doğrulama tarihi`}
                      onChange={(event) =>
                        setDraft({
                          ...draft,
                          sources: draft.sources.map((source, itemIndex) =>
                            itemIndex === index
                              ? {
                                  ...source,
                                  lastVerifiedAt: event.target.value || null,
                                }
                              : source,
                          ),
                        })
                      }
                      type="date"
                      value={item.lastVerifiedAt ?? ''}
                    />
                  </label>
                </div>
              </div>
            ))}
          </section>

          <section className="admin-editor-section">
            <div className="admin-section-heading">
              <div>
                <p className="admin-kicker">İç bağlantılar</p>
                <h2>İlgili yazılar</h2>
              </div>
            </div>
            <RelatedArticleSelect
              onChange={(relatedArticleIds) =>
                setDraft({ ...draft, relatedArticleIds })
              }
              options={relatedOptions.filter((option) => option.id !== postId)}
              value={draft.relatedArticleIds}
            />
          </section>

          <section className="admin-editor-section">
            <div className="admin-section-heading">
              <div>
                <p className="admin-kicker">Opsiyonel</p>
                <h2>Kapak görseli</h2>
              </div>
              {draft.coverImage ? (
                <button
                  onClick={() =>
                    setDraft((current) => ({
                      ...current,
                      ogImage: referencesSameImage(
                        current.coverImage,
                        current.ogImage,
                      )
                        ? null
                        : current.ogImage,
                      coverImage: null,
                    }))
                  }
                  type="button"
                >
                  <Trash2 className="size-4" aria-hidden="true" /> Kaldır
                </button>
              ) : null}
            </div>
            {draft.coverImage ? (
              <ImageUploader
                kind="cover"
                postId={postId}
                image={draft.coverImage}
                onChange={(coverImage) =>
                  setDraft((current) => ({
                    ...current,
                    ogImage: referencesSameImage(
                      current.coverImage,
                      current.ogImage,
                    )
                      ? coverImage
                      : current.ogImage,
                    coverImage,
                  }))
                }
              />
            ) : (
              <button
                className="admin-dashed-button"
                onClick={() =>
                  setDraft({
                    ...draft,
                    coverImage: { path: '', url: '', alt: '' },
                  })
                }
                type="button"
              >
                <ImagePlus className="size-4" aria-hidden="true" /> Kapak
                görseli ekle
              </button>
            )}
            <label className="admin-checkbox-field admin-cover-og-toggle">
              <input
                checked={referencesSameImage(draft.coverImage, draft.ogImage)}
                disabled={!draft.coverImage?.path}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    ogImage:
                      event.target.checked && current.coverImage
                        ? current.coverImage
                        : referencesSameImage(
                              current.coverImage,
                              current.ogImage,
                            )
                          ? null
                          : current.ogImage,
                  }))
                }
                type="checkbox"
              />
              <span>OG görseli olarak da kullan</span>
            </label>
          </section>
        </div>

        <aside className="admin-editor-actions">
          <strong>Yayın işlemleri</strong>
          <p>Önizleme kaydetmeden de güncel alanları gösterir.</p>
          <button onClick={() => setPreviewOpen(true)} type="button">
            <Eye className="size-4" aria-hidden="true" /> Önizle
          </button>
          <button
            disabled={busy}
            onClick={() => save(draft.status)}
            type="button"
          >
            <Save className="size-4" aria-hidden="true" />{' '}
            {isNew ? 'Taslak Kaydet' : 'Güncelle'}
          </button>
          {draft.status === 'published' ? (
            <button
              className="admin-secondary-danger"
              disabled={busy}
              onClick={() => save('draft')}
              type="button"
            >
              <Undo2 className="size-4" aria-hidden="true" /> Yayından Kaldır
            </button>
          ) : (
            <button
              className="admin-publish-button"
              disabled={busy}
              onClick={() => save('published')}
              type="button"
            >
              <Send className="size-4" aria-hidden="true" /> Yayınla
            </button>
          )}
          {message ? (
            <output className="admin-form-success">{message}</output>
          ) : null}
          {error ? (
            <p className="admin-form-error" role="alert">
              {error}
            </p>
          ) : null}
        </aside>
      </div>

      {previewOpen ? (
        <BlogPreviewDialog
          onClose={() => setPreviewOpen(false)}
          onViewportChange={setPreviewViewport}
          post={previewPost}
          viewport={previewViewport}
        />
      ) : null}
    </main>
  );
}
