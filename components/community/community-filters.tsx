import Link from 'next/link';
import { ChevronRight, Hash } from 'lucide-react';
import {
  communityCategories,
  communitySorts,
  type CommunityCategoryId,
  type CommunitySortId,
} from '@/lib/community/constants';
import { cn } from '@/lib/utils';

function hrefFor(category: string, sort: string) {
  const params = new URLSearchParams();
  if (category !== 'all') params.set('kategori', category);
  if (sort !== 'aktif') params.set('sira', sort);
  const query = params.toString();
  return query ? `/topluluk?${query}` : '/topluluk';
}

const categories = [
  { id: 'all' as const, label: 'Tüm Konular', mobileLabel: 'Tümü' },
  ...communityCategories.map((item) => ({ ...item, mobileLabel: item.label })),
];

export function CommunityCategoryNavigation({
  category,
  sort,
}: {
  category: CommunityCategoryId | 'all';
  sort: CommunitySortId;
}) {
  return (
    <>
      <nav
        aria-label="Topluluk kategorileri"
        className="hidden min-w-0 lg:block"
      >
        <div className="sticky top-24">
          <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
            Kategoriler
          </p>
          <div className="space-y-1">
          {categories.map((item) => {
            const active = item.id === category;
            return (
              <Link
                key={item.id}
                href={hrefFor(item.id, sort)}
                className={cn(
                  'group flex min-w-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
                  active
                    ? 'bg-primary-subtle text-primary-ink ring-1 ring-primary/15'
                    : 'text-secondary-foreground hover:bg-surface hover:text-foreground',
                )}
              >
                <span
                  className={cn(
                    'flex size-7 shrink-0 items-center justify-center rounded-lg border transition-colors',
                    active
                      ? 'border-primary/25 bg-surface text-primary-ink'
                      : 'border-border bg-surface/70 text-muted-foreground',
                  )}
                >
                  <Hash className="size-3.5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                <ChevronRight
                  className={cn(
                    'size-3.5 shrink-0 transition-transform group-hover:translate-x-0.5',
                    active ? 'opacity-100' : 'opacity-0 group-hover:opacity-70',
                  )}
                  aria-hidden="true"
                />
              </Link>
            );
          })}
          </div>
        </div>
      </nav>
      <nav
        aria-label="Topluluk kategorileri"
        className="scrollbar-none flex w-full max-w-full gap-2 overflow-x-auto overscroll-x-contain pb-1 lg:hidden"
      >
        {categories.map((item) => {
          const active = item.id === category;
          return (
            <Link
              key={item.id}
              href={hrefFor(item.id, sort)}
              className={cn(
                'shrink-0 rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors',
                active
                  ? 'border-primary bg-primary-subtle text-primary-ink'
                  : 'border-border bg-surface text-secondary-foreground hover:border-primary/40 hover:text-foreground',
              )}
            >
              {item.mobileLabel}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

export function CommunitySortNavigation({
  category,
  sort,
}: {
  category: CommunityCategoryId | 'all';
  sort: CommunitySortId;
}) {
  return (
    <nav
      aria-label="Konu sıralaması"
      className="scrollbar-none flex max-w-full gap-1 overflow-x-auto"
    >
      {communitySorts.map((item) => {
        const active = item.id === sort;
        return (
          <Link
            key={item.id}
            href={hrefFor(category, item.id)}
            className={cn(
              'shrink-0 rounded-lg px-3 py-2 text-xs font-semibold transition-colors sm:text-sm',
              active
                ? 'bg-primary-subtle text-primary-ink'
                : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
