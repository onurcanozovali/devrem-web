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

export function CommunityFilters({
  category,
  sort,
}: {
  category: CommunityCategoryId | 'all';
  sort: CommunitySortId;
}) {
  const categories = [
    { id: 'all' as const, label: 'Tümü' },
    ...communityCategories,
  ];

  return (
    <div className="mt-6 space-y-3">
      <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
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
              {item.label}
            </Link>
          );
        })}
      </div>
      <div className="flex gap-2">
        {communitySorts.map((item) => {
          const active = item.id === sort;
          return (
            <Link
              key={item.id}
              href={hrefFor(category, item.id)}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-semibold',
                active
                  ? 'bg-foreground text-background'
                  : 'bg-muted text-secondary-foreground',
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
