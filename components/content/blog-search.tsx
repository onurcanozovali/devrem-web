'use client';

import { useId, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { blogPosts } from '@/src/fixtures/content';

type BlogSearchProps = {
  className?: string;
  variant?: 'header' | 'mobile' | 'page';
};

function normalizeSearchText(value: string) {
  return value
    .toLocaleLowerCase('tr-TR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[ıİ]/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ş/g, 's')
    .replace(/ç/g, 'c')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u');
}

const searchEntries = blogPosts.map((post) => ({
  post,
  searchText: normalizeSearchText(
    [
      post.title,
      post.excerpt,
      post.category,
      ...(post.standfirst ?? []),
      ...(post.quickSummary ?? []),
      ...post.sections.flatMap((section) => [
        section.heading,
        ...(section.subsections?.map((subsection) => subsection.heading) ?? []),
      ]),
    ].join(' '),
  ),
}));

export function BlogSearch({ className, variant = 'page' }: BlogSearchProps) {
  const inputId = useId();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const normalizedQuery = normalizeSearchText(query.trim());
  const results = useMemo(
    () =>
      normalizedQuery.length < 2
        ? []
        : searchEntries
            .filter((entry) => entry.searchText.includes(normalizedQuery))
            .slice(0, 6),
    [normalizedQuery],
  );
  const showResults = open && normalizedQuery.length >= 2;

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
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') setOpen(false);
          }}
          placeholder="Blogda ara"
          type="search"
          value={query}
        />
        {query ? (
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
          {results.length ? (
            <ul>
              {results.map(({ post }) => (
                <li key={post.slug}>
                  <Link
                    className="blog-search-result"
                    href={`/blog/${post.slug}`}
                    onClick={() => setOpen(false)}
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
