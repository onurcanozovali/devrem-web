import Link from 'next/link';
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
        className="hidden w-[220px] shrink-0 lg:block"
      >
        <div className="sticky top-28 space-y-1">
          {categories.map((item) => {
            const active = item.id === category;
            return (
              <Link
                key={item.id}
                href={hrefFor(item.id, sort)}
                className={cn(
                  'block rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors',
                  active
                    ? 'bg-primary-subtle text-primary-ink'
                    : 'text-secondary-foreground hover:bg-surface hover:text-foreground',
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
      <nav
        aria-label="Topluluk kategorileri"
        className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-2 lg:hidden"
      >
        {categories.map((item) => {
          const active = item.id === category;
          return (
            <Link
              key={item.id}
              href={hrefFor(item.id, sort)}
              className={cn(
                'shrink-0 rounded-full border px-3.5 py-2 text-sm font-medium',
                active
                  ? 'border-primary bg-primary-subtle text-primary-ink'
                  : 'border-border bg-surface text-secondary-foreground',
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
    <nav aria-label="Konu sıralaması" className="flex gap-1 border-b border-border">
      {communitySorts.map((item) => {
        const active = item.id === sort;
        return (
          <Link
            key={item.id}
            href={hrefFor(category, item.id)}
            className={cn(
              '-mb-px border-b-2 px-3 py-3 text-sm font-semibold transition-colors',
              active
                ? 'border-primary text-primary-ink'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function CommunityFilters(props: {
  category: CommunityCategoryId | 'all';
  sort: CommunitySortId;
}) {
  return (
    <div className="mt-6 lg:hidden">
      <CommunityCategoryNavigation {...props} />
      <CommunitySortNavigation {...props} />
    </div>
  );
}
