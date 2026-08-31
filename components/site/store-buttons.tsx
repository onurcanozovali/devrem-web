import Image from 'next/image';
import { cn } from '@/lib/utils';
import { siteConfig } from '@/src/config/site';

type StoreButtonProps = {
  className?: string;
  compact?: boolean;
  showStatus?: boolean;
};

const stores = [
  {
    key: 'app-store',
    label: 'App Store',
    image: '/store-app-store.svg',
    width: 151,
    height: 40,
    href: siteConfig.release.appStoreUrl,
  },
  {
    key: 'google-play',
    label: 'Google Play',
    image: '/store-google-play.svg',
    width: 135,
    height: 40,
    href: siteConfig.release.googlePlayUrl,
  },
] as const;

export function StoreButtons({
  className,
  compact = false,
  showStatus = true,
}: StoreButtonProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      {stores.map((store) => {
        const badge = (
          <Image
            alt={`${store.label} üzerinden indir`}
            className={cn('h-10 w-auto', compact && 'h-9')}
            height={store.height}
            src={store.image}
            width={store.width}
          />
        );

        return store.href ? (
          <a
            className="store-badge-link"
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
            className="store-badge-pending"
            key={store.key}
            title={`${store.label} bağlantısı yakında`}
          >
            {badge}
            <span className="store-badge-status">Yakında</span>
          </span>
        );
      })}
      {showStatus ? (
        <p className="w-full text-[10px] font-medium text-secondary-foreground">
          Mağaza sayfaları yayınlandığında bağlantılar burada etkinleşecek.
        </p>
      ) : null}
    </div>
  );
}
