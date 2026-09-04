'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MessageCircle, Search, X } from 'lucide-react';
import { categoryLabel } from '@/lib/community/constants';
import { formatRelativeCommunityDate } from '@/lib/community/text';
import type { CommunitySearchResult } from '@/lib/community/types';

export function CommunitySearch({
  toolbar,
  children,
}: {
  toolbar: ReactNode;
  children: ReactNode;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CommunitySearchResult[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const trimmedQuery = query.trim();
  const isSearching = trimmedQuery.length >= 2;

  useEffect(() => {
    if (!isSearching) return;
    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setPending(true);
      setError('');
      try {
        const response = await fetch(
          `/api/community/search?q=${encodeURIComponent(trimmedQuery)}`,
          { signal: controller.signal },
        );
        const payload = (await response.json()) as {
          results?: CommunitySearchResult[];
          error?: string;
        };
        if (!response.ok) {
          throw new Error(payload.error || 'Arama tamamlanamadı.');
        }
        setResults(payload.results ?? []);
      } catch (searchError) {
        if (
          searchError instanceof DOMException &&
          searchError.name === 'AbortError'
        ) {
          return;
        }
        setError(
          searchError instanceof Error
            ? searchError.message
            : 'Arama tamamlanamadı.',
        );
      } finally {
        if (!controller.signal.aborted) setPending(false);
      }
    }, 280);
    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [isSearching, trimmedQuery]);

  return (
    <>
      <div className="flex min-w-0 flex-col gap-3 border-b border-border px-3 py-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">{toolbar}</div>
        <label className="relative block w-full lg:w-[min(22rem,44%)]">
          <span className="sr-only">Toplulukta ara</span>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            maxLength={80}
            autoComplete="off"
            onChange={(event) => {
              const value = event.target.value;
              setQuery(value);
              if (value.trim().length < 2) {
                setResults([]);
                setError('');
                setPending(false);
              }
            }}
            placeholder="Konu ve yanıtlarda ara"
            className="h-10 w-full rounded-full border border-border bg-background pl-9 pr-10 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-3 focus:ring-primary/15"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setResults([]);
                setError('');
                setPending(false);
              }}
              className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
              aria-label="Aramayı temizle"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          ) : null}
        </label>
      </div>

      {!isSearching ? (
        children
      ) : (
        <div aria-live="polite" aria-busy={pending}>
          <div className="border-b border-border/80 px-4 py-3 text-xs text-secondary-foreground sm:px-5">
            <strong className="text-foreground">“{trimmedQuery}”</strong>
            {pending
              ? ' aranıyor…'
              : error
                ? ''
                : ` için ${results.length} sonuç`}
          </div>
          {error ? (
            <p className="px-5 py-10 text-center text-sm text-destructive">
              {error}
            </p>
          ) : pending ? (
            <div className="space-y-3 px-4 py-5 sm:px-5">
              {[0, 1, 2].map((item) => (
                <div
                  className="h-20 animate-pulse rounded-xl bg-muted"
                  key={item}
                />
              ))}
            </div>
          ) : results.length ? (
            <div>
              {results.map((result) => (
                <Link
                  key={`${result.type}-${result.id}`}
                  href={result.href}
                  className="group block border-b border-border/80 px-4 py-4 outline-none transition-colors last:border-b-0 hover:bg-muted/45 focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-ring/30 sm:px-5"
                >
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
                    <span className="rounded-full bg-primary-subtle px-2.5 py-1 text-primary-ink">
                      {result.type === 'topic' ? 'Konu' : 'Yanıt'}
                    </span>
                    <span className="text-primary-ink">
                      {categoryLabel(result.category)}
                    </span>
                    <span className="text-muted-foreground">
                      {result.authorDisplayName} ·{' '}
                      {formatRelativeCommunityDate(result.createdAt)}
                    </span>
                  </div>
                  <h2 className="mt-2 text-[15px] font-bold leading-5 tracking-[-0.02em] text-foreground group-hover:text-primary-ink sm:text-base">
                    {result.topicTitle}
                  </h2>
                  <p className="mt-1 line-clamp-2 text-sm leading-6 text-secondary-foreground">
                    {result.excerpt}
                  </p>
                  {result.type === 'reply' ? (
                    <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-primary-ink">
                      <MessageCircle className="size-3.5" aria-hidden="true" />
                      Eşleşen yanıta git
                    </span>
                  ) : null}
                </Link>
              ))}
            </div>
          ) : (
            <div className="px-5 py-12 text-center">
              <p className="font-semibold">
                Eşleşen konu veya yanıt bulunamadı.
              </p>
              <p className="mt-1 text-sm text-secondary-foreground">
                Daha kısa ya da farklı bir ifade deneyebilirsin.
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
