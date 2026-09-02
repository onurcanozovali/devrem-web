import Link from 'next/link';
import { AdminEmptyState, AdminPageHeader, AdminPagination, AdminStatusBadge } from '@/components/admin/admin-ui';
import { listAuditLogs } from '@/lib/admin/mobile-repository';
import { requireAdminPage } from '@/lib/admin/session';
import { displayText, formatAdminDate } from '@/src/admin/presentation';

export const dynamic = 'force-dynamic';

function first(value: string | string[] | undefined) { return Array.isArray(value) ? value[0] : value; }

export default async function AuditLogPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdminPage('audit.read');
  const raw = await searchParams;
  const filters = { admin: first(raw.admin), action: first(raw.action), targetType: first(raw.targetType), from: first(raw.from), to: first(raw.to), cursor: first(raw.cursor) };
  const { logs, nextCursor } = await listAuditLogs(filters);
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) if (key !== 'cursor' && value) query.set(key, value);
  return <main className="admin-main" id="ana-icerik"><AdminPageHeader eyebrow="Sistem" title="Audit Log" description="Anlamlı admin değişikliklerinin salt okunur ve silinemez operasyon izi." /><form className="admin-filter-panel"><label><span>Admin UID</span><input defaultValue={filters.admin} name="admin" /></label><label><span>Aksiyon</span><input defaultValue={filters.action} name="action" placeholder="USER_SUSPENDED" /></label><label><span>Hedef türü</span><input defaultValue={filters.targetType} name="targetType" placeholder="user" /></label><label><span>Başlangıç</span><input defaultValue={filters.from} name="from" type="date" /></label><label><span>Bitiş</span><input defaultValue={filters.to} name="to" type="date" /></label><div className="admin-filter-actions"><button type="submit">Filtrele</button><Link href="/admin/system/audit-log">Temizle</Link></div></form><div className="admin-table-wrap"><table className="admin-post-table admin-ops-table"><thead><tr><th>Zaman</th><th>Admin</th><th>Rol</th><th>Aksiyon</th><th>Hedef</th><th>Gerekçe</th></tr></thead><tbody>{logs.map((log) => <tr key={log.id}><td>{formatAdminDate(log.data.timestamp)}</td><td><strong>{displayText(log.data.adminEmail)}</strong><small>{displayText(log.data.adminUid, '')}</small></td><td><AdminStatusBadge>{displayText(log.data.adminRole)}</AdminStatusBadge></td><td><code>{displayText(log.data.action)}</code></td><td><strong>{displayText(log.data.targetType)}</strong><small>{displayText(log.data.targetId, '')}</small></td><td className="admin-table-reason">{displayText(log.data.reason)}</td></tr>)}</tbody></table>{!logs.length ? <AdminEmptyState title="Audit kaydı bulunamadı" description="Seçilen filtrelerde kayıtlı admin işlemi yok." /> : null}</div><AdminPagination nextCursor={nextCursor} nextHref={`/admin/system/audit-log${query.size ? `?${query}` : ''}`} /></main>;
}
