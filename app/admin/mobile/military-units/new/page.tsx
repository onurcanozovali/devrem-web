import Link from 'next/link';
import { MilitaryUnitEditor } from '@/components/admin/military-unit-editor';
import { AdminPageHeader, NotConnected } from '@/components/admin/admin-ui';
import { requireAdminPage } from '@/lib/admin/session';

export default async function NewMilitaryUnitPage() {
  await requireAdminPage('units.write');
  const unitId = crypto.randomUUID();
  return <main className="admin-main" id="ana-icerik"><Link className="admin-back-link" href="/admin/mobile/military-units">← Birliklere dön</Link><AdminPageHeader eyebrow="Askerî birlikler" title="Yeni birlik taslağı" description="Kimliği, konumu ve bilgilendirici içeriği kontrollü yayın akışına hazırla." /><NotConnected title="Mobil kaynak bağlı değil">Kaydetmek mobil uygulamanın paketli kataloğunu değiştirmez.</NotConnected><MilitaryUnitEditor isNew unitId={unitId} /></main>;
}
