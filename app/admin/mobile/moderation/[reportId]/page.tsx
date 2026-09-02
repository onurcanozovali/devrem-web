import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AdminRecordGrid } from '@/components/admin/admin-record-grid';
import { ReasonAction } from '@/components/admin/reason-action';
import { AdminPageHeader, AdminStatusBadge } from '@/components/admin/admin-ui';
import { getModerationReportDetail } from '@/lib/admin/mobile-repository';
import { requireAdminPage } from '@/lib/admin/session';
import { hasPermission } from '@/src/admin/access';
import { reportStatusLabels } from '@/src/admin/domain';
import { displayText, formatAdminDate } from '@/src/admin/presentation';

export const dynamic = 'force-dynamic';

export default async function ModerationDetailPage({ params }: { params: Promise<{ reportId: string }> }) {
  const identity = await requireAdminPage('reports.read');
  const { reportId } = await params;
  const detail = await getModerationReportDetail(reportId);
  if (!detail) notFound();
  const { report } = detail;
  const canModerate = hasPermission(identity, 'reports.moderate');
  const endpoint = `/api/admin/mobile/moderation/${encodeURIComponent(reportId)}/actions`;
  const message = detail.reportedMessage ?? {};
  return (
    <main className="admin-main" id="ana-icerik">
      <Link className="admin-back-link" href="/admin/mobile/moderation">← Moderasyona dön</Link>
      <AdminPageHeader eyebrow="Moderasyon raporu" title={`Rapor ${reportId}`} description="Kanıt korunur; erişim yalnızca bu raporun sınırlı bağlamıyla sınırlıdır." action={<AdminStatusBadge tone={report.status === 'open' ? 'danger' : report.status === 'reviewing' ? 'warning' : report.status === 'resolved' ? 'success' : 'neutral'}>{reportStatusLabels[report.status]}</AdminStatusBadge>} />
      <div className="admin-detail-grid">
        <section className="admin-detail-card"><h2>Rapor</h2><AdminRecordGrid items={[{ label: 'Neden', value: report.reason },{ label: 'Tür', value: report.conversationType },{ label: 'Oluşturulma', value: formatAdminDate(report.createdAt) },{ label: 'Konuşma / grup', value: report.conversationId },{ label: 'Mesaj', value: report.messageId }]} /></section>
        <section className="admin-detail-card"><h2>Taraflar</h2><AdminRecordGrid items={[{ label: 'Bildiren UID', value: report.reporterUid },{ label: 'Bildiren ad', value: detail.reporter?.firstName },{ label: 'Bildirilen UID', value: report.reportedUid },{ label: 'Bildirilen ad', value: detail.reported?.firstName }]} />{report.reportedUid ? <Link className="admin-inline-link" href={`/admin/mobile/users/${encodeURIComponent(report.reportedUid)}`}>Kullanıcıyı aç →</Link> : null}</section>
        <section className="admin-detail-card admin-detail-wide"><h2>Bildirilen içerik</h2>{detail.reportedMessage ? <div className="admin-evidence"><p>{displayText(message.text ?? message.body ?? message.content, 'Metin içeriği yok veya mevcut şemada erişilemiyor.')}</p><small>Yalnızca bildirilen mesaj gösterilir. Genel DM/grup geçmişi taranmaz.</small></div> : <p className="admin-muted-copy">Rapora bağlı erişilebilir bir mesaj bulunamadı. Profil/kullanıcı raporu olabilir.</p>}</section>
        <section className="admin-detail-card"><h2>Önceki ilgili raporlar</h2><ul className="admin-compact-list">{detail.previousReports.filter((item) => item.id !== reportId).slice(0, 9).map((item) => <li key={item.id}><Link href={`/admin/mobile/moderation/${item.id}`}>{displayText(item.data.reason, item.id)} <span>{formatAdminDate(item.data.createdAt)}</span></Link></li>)}</ul>{detail.previousReports.length <= 1 ? <p className="admin-muted-copy">Başka rapor bulunmuyor.</p> : null}</section>
        <section className="admin-detail-card"><h2>Audit geçmişi</h2><ul className="admin-compact-list">{detail.audit.map((item) => <li key={item.id}><span>{displayText(item.data.action)}</span><span>{formatAdminDate(item.data.timestamp)}</span></li>)}</ul>{!detail.audit.length ? <p className="admin-muted-copy">Henüz admin işlemi yok.</p> : null}</section>
        <section className="admin-detail-card admin-detail-wide"><h2>Moderasyon işlemleri</h2>{canModerate ? <div className="admin-action-row">{report.status === 'open' ? <ReasonAction label="İncelemeye al" title="Rapor incelemeye alınsın mı?" description="Rapor bir moderatör tarafından ele alınıyor olarak işaretlenir." endpoint={endpoint} payload={{ action: 'status', status: 'reviewing' }} /> : null}{report.status === 'open' || report.status === 'reviewing' ? <><ReasonAction label="İşlem yapıldı" title="Rapor çözümlensin mi?" description="Rapor işlem yapıldı olarak kapatılır; kanıt korunur." endpoint={endpoint} payload={{ action: 'status', status: 'resolved' }} successMessage="Rapor çözümlendi." /><ReasonAction label="Reddet" title="Rapor reddedilsin mi?" description="Rapor işlem gerektirmedi olarak kapatılır." endpoint={endpoint} payload={{ action: 'status', status: 'dismissed' }} tone="danger" successMessage="Rapor reddedildi." /></> : null}{detail.reportedMessage ? <ReasonAction label="Bildirilen mesajı gizle" title="Mesaj moderasyonla gizlensin mi?" description="Orijinal kanıt silinmez; istemcide gösterilmemesi için moderasyon işareti eklenir." endpoint={endpoint} payload={{ action: 'hideMessage' }} tone="danger" successMessage="Mesaj gizlendi." /> : null}</div> : <p className="admin-muted-copy">Bu rol moderasyon işlemi yapamaz.</p>}</section>
      </div>
    </main>
  );
}
