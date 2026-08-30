import { cn } from '@/lib/utils';

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  inverse = false,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  inverse?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-6 md:flex-row md:items-end md:justify-between', className)}>
      <div className="max-w-2xl">
        {eyebrow ? <p className={cn('text-xs font-bold uppercase tracking-[0.14em] text-primary', inverse && 'text-[#9EA6FF]')}>{eyebrow}</p> : null}
        <h2 className={cn('section-title mt-3 text-balance', inverse && 'text-white')}>{title}</h2>
        {description ? <p className={cn('mt-4 max-w-xl text-base leading-7 text-secondary-foreground sm:text-lg', inverse && 'text-[#B8BCD3]')}>{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
