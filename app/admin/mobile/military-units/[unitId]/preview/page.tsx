import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MilitaryUnitPage } from '@/components/military-units/military-unit-page';
import { getAdminMilitaryUnit } from '@/lib/admin/mobile-repository';
import { requireAdminPage } from '@/lib/admin/session';
import { listPublishedMilitaryUnits, mapMilitaryUnitRecord } from '@/lib/military-units';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Birlik önizlemesi', robots: { index: false, follow: false } };

export default async function MilitaryUnitPreviewPage({ params }: { params: Promise<{ unitId: string }> }) {
  await requireAdminPage('units.read');
  const { unitId } = await params;
  const record = await getAdminMilitaryUnit(unitId);
  if (!record) notFound();
  const unit = mapMilitaryUnitRecord(record.id, record.data);
  if (!unit) notFound();
  const sameCity = (await listPublishedMilitaryUnits()).filter(
    (item) => item.citySlug === unit.citySlug && item.id !== unit.id,
  );
  return <MilitaryUnitPage preview sameCity={sameCity} unit={unit} />;
}
