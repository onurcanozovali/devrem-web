'use client';

import { useDeferredValue, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Backpack,
  BookOpenText,
  CalendarDays,
  Clock3,
  Coins,
  MapPinned,
  Newspaper,
  Search,
  UsersRound,
  X,
} from 'lucide-react';
import type { BlogPost } from '@/src/fixtures/content';

const categories = [
  'Tümü',
  'Rehber',
  'Bedelli',
  'Celp Dönemleri',
  'Hazırlık',
  'Birlikler',
  'Haberler',
  'Deneyim',
] as const;

type Category = (typeof categories)[number];

function listingTitle(post: BlogPost) {
  return post.cardTitle?.trim() || post.title;
}

function normalizeSearch(value: string) {
  return value.toLocaleLowerCase('tr-TR').trim();
}

function CategoryIcon({ category }: { category: BlogPost['category'] }) {
  const className = 'size-10';

  if (category === 'Bedelli') return <Coins className={className} />;
  if (category === 'Celp Dönemleri') {
    return <CalendarDays className={className} />;
  }
  if (category === 'Hazırlık') return <Backpack className={className} />;
  if (category === 'Birlikler') return <MapPinned className={className} />;
  if (category === 'Haberler') return <Newspaper className={className} />;
  if (category === 'Deneyim') return <UsersRound className={className} />;
  return <BookOpenText className={className} />;
}

function CoverMedia({
  post,
  priority = false,
  sizes,
}: {
  post: BlogPost;
  priority?: boolean;
  sizes: string;
}) {
  if (post.coverImage?.src) {
    return (
      <Image
        alt={post.coverImage.alt}
        className="blog-index-cover-image"
        fill
        priority={priority}
        sizes={sizes}
        src={post.coverImage.src}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`blog-index-cover-fallback blog-index-cover-${post.tone}`}
    >
      <CategoryIcon category={post.category} />
    </span>
  );
}

function Meta({
  post,
  includeDate = true,
}: {
  post: BlogPost;
  includeDate?: boolean;
}) {
  return (
    <div className="blog-index-meta">
      <span className="blog-index-category">{post.category}</span>
      <span>
        <Clock3 className="size-3" aria-hidden="true" /> {post.readingTime}{' '}
        okuma
      </span>
      {includeDate ? (
        <time dateTime={post.publishedIso}>{post.publishedAt}</time>
      ) : null}
    </div>
  );
}

function MainFeatured({ post }: { post: BlogPost }) {
  return (
    <article className="blog-index-featured-card">
      <Link
        aria-label={`${post.title} yazısını oku`}
        className="blog-index-featured-cover blog-index-cover"
        href={`/blog/${post.slug}`}
      >
        <CoverMedia
          post={post}
          priority
          sizes="(max-width: 1023px) 100vw, 58vw"
        />
        <span className="blog-index-cover-badge">{post.category}</span>
      </Link>
      <div className="blog-index-featured-copy">
        <Meta post={post} />
        <h1>
          <Link href={`/blog/${post.slug}`}>{listingTitle(post)}</Link>
        </h1>
        <p>{post.excerpt}</p>
        <Link className="blog-index-read-link" href={`/blog/${post.slug}`}>
          Yazıyı oku <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

function HighlightRow({ post }: { post: BlogPost }) {
  return (
    <Link
      aria-label={`${post.title} yazısını oku`}
      className="blog-index-highlight-row"
      href={`/blog/${post.slug}`}
    >
      <span className="blog-index-highlight-cover blog-index-cover">
        <CoverMedia
          post={post}
          sizes="(max-width: 639px) 38vw, (max-width: 1023px) 210px, 150px"
        />
      </span>
      <span className="blog-index-highlight-copy">
        <strong>{listingTitle(post)}</strong>
        <Meta includeDate={false} post={post} />
      </span>
    </Link>
  );
}

function ArticleCard({ post }: { post: BlogPost }) {
  return (
    <article className="blog-index-card">
      <Link
        aria-label={`${post.title} yazısını oku`}
        className="blog-index-card-cover blog-index-cover"
        href={`/blog/${post.slug}`}
      >
        <CoverMedia
          post={post}
          sizes="(max-width: 767px) 100vw, (max-width: 1119px) 50vw, 33vw"
        />
      </Link>
      <div className="blog-index-card-copy">
        <Meta post={post} />
        <h3>
          <Link href={`/blog/${post.slug}`}>{listingTitle(post)}</Link>
        </h3>
        <p>{post.excerpt}</p>
        <Link className="blog-index-read-link" href={`/blog/${post.slug}`}>
          Yazıyı oku <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

export function BlogIndex({ posts }: { posts: BlogPost[] }) {
  const mainFeatured = posts.find((post) => post.featured) ?? posts[0] ?? null;
  const remainingPosts = mainFeatured
    ? posts.filter((post) => post.slug !== mainFeatured.slug)
    : [];
  const highlights = [...remainingPosts]
    .sort(
      (left, right) =>
        Number(Boolean(right.featured)) - Number(Boolean(left.featured)),
    )
    .slice(0, 3);
  const [activeCategory, setActiveCategory] = useState<Category>('Tümü');
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  const search = normalizeSearch(deferredQuery);
  const filteredPosts = remainingPosts.filter((post) => {
    const categoryMatches =
      activeCategory === 'Tümü' || post.category === activeCategory;
    if (!categoryMatches) return false;
    if (!search) return true;
    return normalizeSearch(
      [listingTitle(post), post.title, post.excerpt, post.category].join(' '),
    ).includes(search);
  });

  if (!mainFeatured) {
    return (
      <div className="blog-index-empty">
        <strong>Henüz yayınlanmış yazı yok.</strong>
        <p>Yeni rehberler yayınlandığında burada görünecek.</p>
      </div>
    );
  }

  return (
    <>
      <section
        aria-label="Öne çıkan blog yazıları"
        className={`blog-index-featured-layout ${highlights.length ? '' : 'blog-index-featured-layout-single'}`}
      >
        <MainFeatured post={mainFeatured} />
        {highlights.length ? (
          <div className="blog-index-highlights">
            <h2>Öne Çıkanlar</h2>
            <div className="blog-index-highlight-list">
              {highlights.map((post) => (
                <HighlightRow key={post.slug} post={post} />
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <section
        className="blog-index-latest"
        aria-labelledby="blog-latest-title"
      >
        <div className="blog-index-latest-header">
          <h2 id="blog-latest-title">Güncel Rehberler</h2>
          <label className="blog-index-search">
            <Search className="size-5" aria-hidden="true" />
            <span className="sr-only">Blog yazılarında ara</span>
            <input
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Blog yazılarında ara..."
              type="search"
              value={query}
            />
            {query ? (
              <button
                aria-label="Aramayı temizle"
                onClick={() => setQuery('')}
                type="button"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            ) : null}
          </label>
        </div>

        <div className="blog-index-filters" aria-label="Blog kategorileri">
          {categories.map((category) => (
            <button
              aria-pressed={activeCategory === category}
              className={activeCategory === category ? 'is-active' : ''}
              key={category}
              onClick={() => setActiveCategory(category)}
              type="button"
            >
              {category}
            </button>
          ))}
        </div>

        {filteredPosts.length ? (
          <div className="blog-index-grid">
            {filteredPosts.map((post) => (
              <ArticleCard key={post.slug} post={post} />
            ))}
          </div>
        ) : (
          <div className="blog-index-no-results">
            <strong>Bu seçimle eşleşen yazı bulunamadı.</strong>
            <p>Aramayı temizleyebilir veya başka bir kategori seçebilirsin.</p>
          </div>
        )}
      </section>
    </>
  );
}
