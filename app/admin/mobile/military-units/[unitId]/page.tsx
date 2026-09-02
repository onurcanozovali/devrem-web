import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MilitaryUnitEditor } from '@/components/admin/military-unit-editor';
import { AdminPageHeader, NotConnected } from '@/components/admin/admin-ui';
import { getAdminMilitaryUnit } from '@/lib/admin/mobile-repository';
import { requireAdminPage } from '@/lib/admin/session';
import { hasPermission } from '@/src/admin/access';
import type { MilitaryUnitInput } from '@/lib/admin/operations';
import { displayText } from '@/src/admin/presentation';

export const dynamic = 'force-dynamic';

export default async function MilitaryUnitDetailPage({ params }: { params: Promise<{ unitId: string }> }) {
  const identity = await requireAdminPage('units.read');
  const { unitId } = await params;
  const record = await getAdminMilitaryUnit(unitId);
  if (!record) notFound();
  return <main className="admin-main" id="ana-icerik"><Link className="admin-back-link" href="/admin/mobile/military-units">← Birliklere dön</Link><AdminPageHeader eyebrow="Askerî birlikler" title={displayText(record.data.name)} description={`CMS kimliği: ${unitId}`} /><NotConnected title="Mobil kaynak bağlı değil">Bu kayıt gelecekteki yayın akışına hazırdır; mobil uygulama henüz tüketmez.</NotConnected>{hasPermission(identity, 'units.write') ? <MilitaryUnitEditor initial={record.data as Partial<MilitaryUnitInput>} isNew={false} unitId={unitId} /> : <p className="admin-muted-copy">Bu rol birlik kaydını yalnızca görüntüleyebilir.</p>}</main>;
}
