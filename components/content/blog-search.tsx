'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type BlogSearchProps = {
  className?: string;
  variant?: 'header' | 'mobile' | 'page';
  onSearchStateChange?: (active: boolean) => void;
  onResultSelect?: () => void;
  headerExpanded?: boolean;
  onHeaderExpand?: () => void;
  onHeaderDismiss?: () => void;
};

type SearchResult = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
};

export function BlogSearch({
  className,
  variant = 'page',
  onSearchStateChange,
  onResultSelect,
  headerExpanded = false,
  onHeaderExpand,
  onHeaderDismiss,
}: BlogSearchProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const normalizedQuery = query.trim();
  const minimumLength = variant === 'mobile' ? 1 : 2;
  const showResults = open && normalizedQuery.length >= minimumLength;

  useEffect(() => {
    onSearchStateChange?.(query.trim().length > 0);
  }, [onSearchStateChange, query]);

  useEffect(() => {
    if (variant === 'header' && headerExpanded) {
      inputRef.current?.focus();
    }
  }, [headerExpanded, variant]);

  useEffect(() => {
    if (normalizedQuery.length < minimumLength) {
      return;
    }
    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/blog/search?q=${encodeURIComponent(normalizedQuery)}`,
          { signal: controller.signal },
        );
        const payload = (await response.json()) as { results?: SearchResult[] };
        if (!controller.signal.aborted) setResults(payload.results ?? []);
      } catch {
        if (!controller.signal.aborted) setResults([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 180);
    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [minimumLength, normalizedQuery]);

  const dismissHeaderSearch = () => {
    setQuery('');
    setOpen(false);
    onHeaderDismiss?.();
  };

  if (variant === 'header' && !headerExpanded) {
    return (
      <button
        aria-label="Blogda ara"
        className={cn('header-search-trigger', className)}
        onClick={onHeaderExpand}
        type="button"
      >
        <Search className="size-[18px]" aria-hidden="true" />
      </button>
    );
  }

  return (
    <div
      className={cn('blog-search', `blog-search-${variant}`, className)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setOpen(false);
        }
      }}
      onFocusCapture={() => setOpen(true)}
    >
      <form
        className="blog-search-field"
        onSubmit={(event) => event.preventDefault()}
      >
        <Search className="size-4 shrink-0" aria-hidden="true" />
        <label className="sr-only" htmlFor={inputId}>
          Blog yazılarında ara
        </label>
        <input
          autoComplete="off"
          id={inputId}
          ref={inputRef}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              if (variant === 'header') dismissHeaderSearch();
              else {
                setQuery('');
                setOpen(false);
              }
            }
          }}
          placeholder="Blogda ara"
          type="search"
          value={query}
        />
        {variant === 'header' ? (
          <button
            aria-label="Aramayı kapat"
            onClick={dismissHeaderSearch}
            type="button"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        ) : query ? (
          <button
            aria-label="Aramayı temizle"
            onClick={() => {
              setQuery('');
              setOpen(false);
            }}
            type="button"
          >
            <X className="size-3.5" aria-hidden="true" />
          </button>
        ) : null}
      </form>

      {showResults ? (
        <div className="blog-search-results" aria-live="polite">
          {loading ? (
            <p className="blog-search-empty">Aranıyor…</p>
          ) : results.length ? (
            <ul>
              {results.map((post) => (
                <li key={post.slug}>
                  <Link
                    className="blog-search-result"
                    href={`/blog/${post.slug}`}
                    onClick={() => {
                      setOpen(false);
                      onResultSelect?.();
                      if (variant === 'header') dismissHeaderSearch();
                    }}
                  >
                    <span>{post.category}</span>
                    <strong>{post.title}</strong>
                    {variant === 'page' ? <small>{post.excerpt}</small> : null}
                    <ArrowUpRight className="size-4" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="blog-search-empty">Eşleşen yazı bulunamadı.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
