import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AdminRecordGrid } from '@/components/admin/admin-record-grid';
import { ReasonAction } from '@/components/admin/reason-action';
import { AdminPageHeader, AdminPagination, AdminStatusBadge } from '@/components/admin/admin-ui';
import { getAdminGroupDetail } from '@/lib/admin/mobile-repository';
import { requireAdminPage } from '@/lib/admin/session';
import { hasPermission } from '@/src/admin/access';
import { groupDisplayName } from '@/src/admin/domain';
import { displayText, formatAdminDate } from '@/src/admin/presentation';

export const dynamic = 'force-dynamic';

export default async function AdminGroupDetailPage({ params, searchParams }: { params: Promise<{ groupId: string }>; searchParams: Promise<{ cursor?: string }> }) {
  const identity = await requireAdminPage('groups.read');
  const { groupId } = await params;
  const { cursor } = await searchParams;
  const detail = await getAdminGroupDetail(groupId, cursor);
  if (!detail) notFound();
  const disabled = detail.control.status === 'disabled';
  return (
    <main className="admin-main" id="ana-icerik">
      <Link className="admin-back-link" href="/admin/mobile/groups">← Gruplara dön</Link>
      <AdminPageHeader eyebrow="Devre grubu" title={groupDisplayName(detail.group)} description={`Kanonik grup kimliği: ${groupId}`} action={<AdminStatusBadge tone={disabled ? 'danger' : 'success'}>{disabled ? 'Devre dışı' : 'Aktif'}</AdminStatusBadge>} />
      <div className="admin-detail-grid">
        <section className="admin-detail-card"><h2>Kanonik kimlik</h2><AdminRecordGrid items={[{ label: 'Grup türü', value: detail.group.kind },{ label: 'Dönem ayı', value: detail.group.militaryPeriodMonth },{ label: 'Dönem yılı', value: detail.group.militaryPeriodYear },{ label: 'Şehir', value: detail.group.militaryCity },{ label: 'Birlik kimliği', value: detail.group.militaryUnitId },{ label: 'Askerlik türü', value: detail.group.militaryType },{ label: 'Kuvvet', value: detail.group.forceCode }]} /></section>
        <section className="admin-detail-card"><h2>Aktivite özeti</h2><AdminRecordGrid items={[{ label: 'Üye sayısı', value: detail.memberCount },{ label: 'Oluşturma', value: formatAdminDate(detail.group.createdAt) },{ label: 'Son güncelleme', value: formatAdminDate(detail.group.updatedAt) },{ label: 'İlgili rapor', value: detail.incidents.length }]} /><p className="admin-muted-copy">Mesaj içeriği genel amaçlı gösterilmez.</p></section>
        <section className="admin-detail-card admin-detail-wide"><h2>Üyeler</h2><div className="admin-member-grid">{detail.members.map((member) => { const uid = displayText(member.data.uid, member.id); return <Link href={`/admin/mobile/users/${encodeURIComponent(uid)}`} key={member.id}><strong>{uid}</strong><small>{formatAdminDate(member.data.createdAt)}</small></Link>; })}</div>{!detail.members.length ? <p className="admin-muted-copy">Üye bulunamadı.</p> : null}<AdminPagination nextCursor={detail.nextCursor} nextHref={`/admin/mobile/groups/${encodeURIComponent(groupId)}`} /></section>
        <section className="admin-detail-card"><h2>Moderasyon olayları</h2><ul className="admin-compact-list">{detail.incidents.map((item) => <li key={item.id}><Link href={`/admin/mobile/moderation/${item.id}`}>{displayText(item.data.reason, item.id)} <span>{formatAdminDate(item.data.createdAt)}</span></Link></li>)}</ul>{!detail.incidents.length ? <p className="admin-muted-copy">İlgili rapor yok.</p> : null}</section>
        <section className="admin-detail-card"><h2>Grup işlemleri</h2><p className="admin-card-copy">Devre dışı bırakma kanonik kimliği veya üyelikleri değiştirmez; sosyal erişim kurallarıyla uygulanır.</p>{hasPermission(identity, 'groups.manage') ? <ReasonAction label={disabled ? 'Grubu yeniden etkinleştir' : 'Grubu devre dışı bırak'} title={disabled ? 'Grup yeniden etkinleştirilsin mi?' : 'Grup devre dışı bırakılsın mı?'} description="Bu işlem grup üyeliklerini taşımaz veya silmez." endpoint={`/api/admin/mobile/groups/${encodeURIComponent(groupId)}/actions`} payload={{ disabled: !disabled }} tone={disabled ? 'neutral' : 'danger'} /> : <p className="admin-muted-copy">Bu rol grup durumunu değiştiremez.</p>}</section>
      </div>
    </main>
  );
}
