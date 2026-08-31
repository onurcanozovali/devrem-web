import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export function SiteLogo({ className }: { className?: string }) {
  return (
    <Link className={cn('inline-flex items-center gap-2.5', className)} href="/" aria-label="Devrem ana sayfa">
      <Image src="/web-logo.png" width={200} height={45} alt="" />
    </Link>
  );
}
