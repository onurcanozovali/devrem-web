import Link from 'next/link';
import { AdminEmptyState, AdminPageHeader, AdminPagination, AdminStatusBadge } from '@/components/admin/admin-ui';
import { listAdminGroups } from '@/lib/admin/mobile-repository';
import { requireAdminPage } from '@/lib/admin/session';
import { formatAdminDate } from '@/src/admin/presentation';

export const dynamic = 'force-dynamic';

export default async function AdminGroupsPage({ searchParams }: { searchParams: Promise<{ cursor?: string }> }) {
  await requireAdminPage('groups.read');
  const { cursor } = await searchParams;
  const { groups, nextCursor } = await listAdminGroups(cursor);
  return (
    <main className="admin-main" id="ana-icerik">
      <AdminPageHeader eyebrow="Mobil uygulama" title="Devre Grupları" description="Kanonik Devre kimliğini değiştirmeden grup durumunu ve özetini yönet." />
      <div className="admin-table-wrap">
        <table className="admin-post-table admin-ops-table"><thead><tr><th>Grup</th><th>Tür</th><th>Dönem</th><th>Şehir</th><th>Birlik</th><th>Üye</th><th>Son aktivite</th><th>Durum</th><th><span className="sr-only">İşlem</span></th></tr></thead><tbody>{groups.map((group) => <tr key={group.id}><td><strong>{group.name}</strong><small>{group.id}</small></td><td><strong>{group.kind}</strong><small>{group.militaryType} · {group.force}</small></td><td>{group.period}</td><td>{group.city ?? '—'}</td><td>{group.unit}</td><td>{group.memberCount ?? 'Detayda'}</td><td>{formatAdminDate(group.lastActivityAt)}</td><td><AdminStatusBadge tone={group.status === 'active' ? 'success' : 'danger'}>{group.status === 'active' ? 'Aktif' : 'Devre dışı'}</AdminStatusBadge></td><td><Link className="admin-table-link" href={`/admin/mobile/groups/${encodeURIComponent(group.id)}`}>İncele →</Link></td></tr>)}</tbody></table>
        {!groups.length ? <AdminEmptyState title="Grup bulunamadı" description="Üretim veri kaynağında listelenecek Devre grubu yok." /> : null}
      </div>
      <AdminPagination nextCursor={nextCursor} nextHref="/admin/mobile/groups" />
    </main>
  );
}
