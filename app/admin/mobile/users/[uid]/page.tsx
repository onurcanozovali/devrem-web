import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AdminRecordGrid } from '@/components/admin/admin-record-grid';
import { ReasonAction } from '@/components/admin/reason-action';
import { AdminPageHeader, AdminStatusBadge } from '@/components/admin/admin-ui';
import { getAdminUserDetail } from '@/lib/admin/mobile-repository';
import { requireAdminPage } from '@/lib/admin/session';
import { hasPermission } from '@/src/admin/access';
import { accountStatusLabels, isAccountStatus } from '@/src/admin/domain';
import { displayText, formatAdminDate } from '@/src/admin/presentation';

export const dynamic = 'force-dynamic';

export default async function AdminUserDetailPage({ params }: { params: Promise<{ uid: string }> }) {
  const identity = await requireAdminPage('users.read');
  const { uid } = await params;
  const detail = await getAdminUserDetail(uid);
  if (!detail) notFound();
  const user = detail.user;
  const profile = detail.profile ?? {};
  const access = detail.access;
  const status = isAccountStatus(access.status) ? access.status : 'active';
  const canModerate = hasPermission(identity, 'users.moderate');
  const endpoint = `/api/admin/mobile/users/${encodeURIComponent(uid)}/actions`;
  return (
    <main className="admin-main" id="ana-icerik">
      <Link className="admin-back-link" href="/admin/mobile/users">← Kullanıcılara dön</Link>
      <AdminPageHeader
        eyebrow="Kullanıcı detayı"
        title={`${displayText(user.firstName, '')} ${displayText(user.lastName, '')}`.trim() || 'İsimsiz kullanıcı'}
        description={`UID: ${uid}`}
        action={<AdminStatusBadge tone={status === 'active' ? 'success' : status === 'banned' ? 'danger' : 'warning'}>{accountStatusLabels[status]}</AdminStatusBadge>}
      />
      <div className="admin-detail-grid">
        <section className="admin-detail-card"><h2>Özet</h2><AdminRecordGrid items={[{ label: 'Kayıt tarihi', value: formatAdminDate(user.createdAt) },{ label: 'Onboarding', value: user.onboardingCompleted === true ? 'Tamamlandı' : 'Tamamlanmadı' },{ label: 'Son güncelleme', value: formatAdminDate(user.updatedAt) },{ label: 'Profil görünürlüğü', value: access.publicProfileHidden === true ? 'Gizli' : 'Görünür' }]} /></section>
        <section className="admin-detail-card"><h2>Profil</h2><AdminRecordGrid items={[{ label: 'Ad', value: profile.firstName ?? user.firstName },{ label: 'İkamet şehri', value: user.residenceCity },{ label: 'Çıkış şehri', value: user.departureCity },{ label: 'Doğum yılı', value: user.birthYear }]} /></section>
        <section className="admin-detail-card"><h2>Askerlik</h2><AdminRecordGrid items={[{ label: 'Tür', value: user.militaryType },{ label: 'Dönem', value: `${displayText(user.militaryPeriodMonth)}/${displayText(user.militaryPeriodYear)}` },{ label: 'Askerî şehir', value: user.militaryCity },{ label: 'Birlik', value: user.militaryUnitNameSnapshot ?? user.militaryUnit },{ label: 'Kuvvet', value: user.forceCode },{ label: 'Katılış tarihi', value: formatAdminDate(user.reportingDate, false) }]} /></section>
        <section className="admin-detail-card"><h2>Devre / Grup</h2><AdminRecordGrid items={[{ label: 'Grup kimliği', value: detail.membership?.groupId },{ label: 'Kaynak', value: detail.membership?.source },{ label: 'Üyelik sürümü', value: detail.membership?.membershipVersion }]} />{displayText(detail.membership?.groupId, '') ? <Link className="admin-inline-link" href={`/admin/mobile/groups/${encodeURIComponent(displayText(detail.membership?.groupId, ''))}`}>Grubu aç →</Link> : null}</section>
        <section className="admin-detail-card admin-detail-wide"><h2>Moderasyon</h2><p className="admin-card-copy">Bu kullanıcı hakkında {detail.reports.length} sınırlı rapor kaydı gösteriliyor. Özel konuşmalar yalnızca ilgili rapor bağlamında açılır.</p>{detail.reports.length ? <ul className="admin-compact-list">{detail.reports.map((report) => <li key={report.id}><Link href={`/admin/mobile/moderation/${report.id}`}>{displayText(report.data.reason, 'Rapor')} <span>{formatAdminDate(report.data.createdAt)}</span></Link></li>)}</ul> : <p className="admin-muted-copy">Rapor bulunmuyor.</p>}</section>
        <section className="admin-detail-card admin-detail-wide"><h2>Hesap durumu</h2><p className="admin-card-copy">Askıya alma ve yasaklama sosyal özellik erişimini `_accountAccess` otoritesi üzerinden kısıtlar. Kalıcı hesap silme bu panelde sunulmaz.</p>{canModerate ? <div className="admin-action-row">{status !== 'suspended' ? <ReasonAction label="Askıya al" title="Kullanıcı askıya alınsın mı?" description="Kullanıcının sosyal özelliklere erişimi durdurulur." endpoint={endpoint} payload={{ action: 'accountStatus', status: 'suspended' }} tone="danger" successMessage="Kullanıcı askıya alındı." /> : null}{status !== 'banned' ? <ReasonAction label="Yasakla" title="Kullanıcı yasaklansın mı?" description="Kullanıcının sosyal özelliklere erişimi engellenir." endpoint={endpoint} payload={{ action: 'accountStatus', status: 'banned' }} tone="danger" successMessage="Kullanıcı yasaklandı." /> : null}{status !== 'active' ? <ReasonAction label="Erişimi geri aç" title="Hesap yeniden etkinleştirilsin mi?" description="Sosyal özelliklere erişim yeniden açılır." endpoint={endpoint} payload={{ action: 'accountStatus', status: 'active' }} successMessage="Kullanıcı yeniden etkinleştirildi." /> : null}<ReasonAction label={access.publicProfileHidden === true ? 'Profili görünür yap' : 'Public profili gizle'} title="Public profil görünürlüğü değişsin mi?" description="Yalnızca public profil keşif yüzeylerinden kaldırılır; kanıt kayıtları korunur." endpoint={endpoint} payload={{ action: 'profileVisibility', hidden: access.publicProfileHidden !== true }} tone={access.publicProfileHidden === true ? 'neutral' : 'danger'} /></div> : <p className="admin-muted-copy">Bu rol hesap durumunu değiştiremez.</p>}<Link className="admin-inline-link" href="/account-deletion">Kullanıcı hesap silme iş akışını görüntüle →</Link></section>
      </div>
    </main>
  );
}
