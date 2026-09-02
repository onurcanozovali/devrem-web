import Link from 'next/link';
import { ArrowLeft, ArrowRight, CircleOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="admin-page-heading admin-ops-heading">
      <div>
        <p className="admin-kicker">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}

export function AdminMetricCard({
  label,
  value,
  detail,
  unavailable = false,
}: {
  label: string;
  value: number | string | null;
  detail?: string;
  unavailable?: boolean;
}) {
  return (
    <article className={cn('admin-metric-card', unavailable && 'is-muted')}>
      <span>{label}</span>
      <strong>{value === null ? '—' : value}</strong>
      {detail ? <small>{detail}</small> : null}
    </article>
  );
}

export function AdminStatusBadge({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode;
  tone?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
}) {
  return <span className={`admin-ops-status is-${tone}`}>{children}</span>;
}

export function AdminEmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="admin-ops-empty">
      <CircleOff className="size-5" aria-hidden="true" />
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  );
}

export function NotConnected({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <aside className="admin-not-connected">
      <AdminStatusBadge tone="warning">Bağlı değil</AdminStatusBadge>
      <div>
        <strong>{title}</strong>
        <p>{children}</p>
      </div>
    </aside>
  );
}

export function AdminPagination({
  nextCursor,
  previousHref,
  nextHref,
}: {
  nextCursor: string | null;
  previousHref?: string;
  nextHref: string;
}) {
  if (!previousHref && !nextCursor) return null;
  return (
    <nav className="admin-pagination" aria-label="Sayfalama">
      {previousHref ? (
        <Link href={previousHref}>
          <ArrowLeft className="size-4" aria-hidden="true" /> Önceki
        </Link>
      ) : (
        <span />
      )}
      {nextCursor ? (
        <Link href={`${nextHref}${nextHref.includes('?') ? '&' : '?'}cursor=${encodeURIComponent(nextCursor)}`}>
          Sonraki <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      ) : null}
    </nav>
  );
}
