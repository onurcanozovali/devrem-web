import Link from 'next/link';
import { Plus } from 'lucide-react';
import { AdminEmptyState, AdminPageHeader, AdminPagination, AdminStatusBadge, NotConnected } from '@/components/admin/admin-ui';
import { listAdminMilitaryUnits } from '@/lib/admin/mobile-repository';
import { requireAdminPage } from '@/lib/admin/session';
import { hasPermission } from '@/src/admin/access';
import { displayText, formatAdminDate } from '@/src/admin/presentation';

export const dynamic = 'force-dynamic';

const verificationLabels: Record<string, string> = {
  unverified: 'Doğrulanmadı',
  reviewing: 'İnceleniyor',
  partially_verified: 'Kısmen doğrulandı',
  verified: 'Doğrulandı',
};

const publicationLabels: Record<string, string> = { draft: 'Taslak', published: 'Yayında' };

export default async function AdminMilitaryUnitsPage({ searchParams }: { searchParams: Promise<{ cursor?: string }> }) {
  const identity = await requireAdminPage('units.read');
  const { cursor } = await searchParams;
  const { units, nextCursor } = await listAdminMilitaryUnits(cursor);
  return (
    <main className="admin-main" id="ana-icerik">
      <AdminPageHeader eyebrow="Web içerik yönetimi" title="Askerî Birlikler" description="Public web birlik sayfalarının yayın, doğrulama ve kaynak durumunu yönetin." action={hasPermission(identity, 'units.write') ? <Link className="admin-primary-action" href="/admin/mobile/military-units/new"><Plus className="size-4" aria-hidden="true" /> Yeni birlik</Link> : undefined} />
      <NotConnected title="Mobil katalog ayrı kalır">Buradaki yayın akışı web sayfalarını besler. Mobil uygulama paketli kataloğundan okumaya devam eder.</NotConnected>
      <div className="admin-table-wrap"><table className="admin-post-table admin-ops-table"><thead><tr><th>Birlik</th><th>Şehir / İlçe</th><th>Kuvvet</th><th>Doğrulama</th><th>Harita</th><th>Yayın</th><th>Güncelleme</th><th><span className="sr-only">İşlem</span></th></tr></thead><tbody>{units.map((unit) => { const verification = displayText(unit.data.verificationStatus, 'unverified'); const publication = displayText(unit.data.publicationStatus, 'draft'); return <tr key={unit.id}><td><strong>{displayText(unit.data.name)}</strong><small>{unit.id}</small></td><td><strong>{displayText(unit.data.city)}</strong><small>{displayText(unit.data.district)}</small></td><td>{displayText(unit.data.force)}</td><td><AdminStatusBadge tone={verification === 'verified' ? 'success' : verification === 'reviewing' || verification === 'partially_verified' ? 'warning' : 'neutral'}>{verificationLabels[verification] ?? verification}</AdminStatusBadge></td><td>{displayText(unit.data.mapStatus, 'query-only')}</td><td>{publicationLabels[publication] ?? publication}</td><td>{formatAdminDate(unit.data.updatedAt)}</td><td><Link className="admin-table-link" href={`/admin/mobile/military-units/${encodeURIComponent(unit.id)}`}>Düzenle →</Link></td></tr>; })}</tbody></table>{!units.length ? <AdminEmptyState title="CMS birlik kaydı yok" description="Yeni bir taslak oluşturarak public web birlik içeriğini hazırlayabilirsiniz." /> : null}</div>
      <AdminPagination nextCursor={nextCursor} nextHref="/admin/mobile/military-units" />
    </main>
  );
}
