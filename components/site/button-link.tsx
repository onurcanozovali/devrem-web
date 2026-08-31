import Link from 'next/link';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonLinkVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/35 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground shadow-[0_12px_30px_rgb(85_200_157/14%)] hover:bg-primary-hover hover:-translate-y-0.5',
        outline: 'border border-border bg-surface-elevated text-foreground hover:border-primary/35 hover:bg-surface-secondary',
        light: 'bg-primary text-primary-foreground shadow-[0_12px_28px_rgb(0_0_0/18%)] hover:bg-primary-hover hover:-translate-y-0.5',
        ghost: 'text-primary-ink hover:bg-primary-subtle',
      },
      size: {
        sm: 'h-10 px-4 text-sm',
        md: 'h-11 px-5 text-sm',
        lg: 'h-13 px-6 text-[0.95rem]',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

type ButtonLinkProps = React.ComponentPropsWithoutRef<typeof Link> &
  VariantProps<typeof buttonLinkVariants>;

export function ButtonLink({ className, variant, size, ...props }: ButtonLinkProps) {
  return <Link className={cn(buttonLinkVariants({ variant, size }), className)} {...props} />;
}
