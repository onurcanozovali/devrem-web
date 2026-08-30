import Link from 'next/link';
import { cn } from '@/lib/utils';

export function SiteLogo({ className }: { className?: string }) {
  return (
    <Link className={cn('inline-flex items-center gap-2.5', className)} href="/" aria-label="Devrem ana sayfa">
      <span className="devrem-mark" aria-hidden="true"><span>d</span></span>
      <span className="text-[1.28rem] font-bold tracking-[-0.055em] text-foreground">devrem</span>
    </Link>
  );
}
