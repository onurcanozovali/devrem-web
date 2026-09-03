import Image from 'next/image';
import { cn } from '@/lib/utils';
import { siteConfig } from '@/src/config/site';

type StoreButtonProps = {
  className?: string;
  compact?: boolean;
  tone?: 'dark' | 'light';
};

const stores = [
  {
    key: 'app-store',
    label: 'App Store’dan indir',
    badges: {
      dark: '/store-badges/app-store-dark.webp',
      light: '/store-badges/app-store-light.webp',
    },
    href: siteConfig.release.appStoreUrl,
  },
  {
    key: 'google-play',
    label: 'Google Play’den indir',
    badges: {
      dark: '/store-badges/google-play-dark.webp',
      light: '/store-badges/google-play-light.webp',
    },
    href: siteConfig.release.googlePlayUrl,
  },
] as const;

export function StoreButtons({
  className,
  compact = false,
  tone = 'dark',
}: StoreButtonProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      {stores.map((store) => {
        const badge = (
          <Image
            alt={store.label}
            className="store-badge-image"
            height={802}
            src={store.badges[tone]}
            width={2500}
          />
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
