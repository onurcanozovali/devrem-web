import { Apple, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { siteConfig } from '@/src/config/site';

type StoreButtonProps = {
  className?: string;
  compact?: boolean;
};

const stores = [
  {
    key: 'app-store',
    label: 'App Store',
    icon: Apple,
    href: siteConfig.release.appStoreUrl,
  },
  {
    key: 'google-play',
    label: 'Google Play',
    icon: Play,
    href: siteConfig.release.googlePlayUrl,
  },
] as const;

export function StoreButtons({ className, compact = false }: StoreButtonProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      {stores.map((store) => {
        const Icon = store.icon;
        const badge = (
          <>
            <Icon
              className={cn(
                'size-5 shrink-0',
                store.key === 'google-play' && 'fill-current',
              )}
              aria-hidden="true"
            />
            <span>{store.label}</span>
          </>
        );

        return store.href ? (
          <a
            className={cn('store-badge-link', compact && 'store-badge-compact')}
            href={store.href}
            key={store.key}
            rel="noreferrer"
            target="_blank"
          >
            {badge}
          </a>
        ) : (
          <span
            aria-disabled="true"
            className={cn(
              'store-badge-pending',
              compact && 'store-badge-compact',
            )}
            key={store.key}
          >
            {badge}
          </span>
        );
      })}
    </div>
  );
}
