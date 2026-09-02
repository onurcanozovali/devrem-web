import Link from 'next/link';
import {
  AdminEmptyState,
  AdminPageHeader,
  AdminPagination,
  AdminStatusBadge,
} from '@/components/admin/admin-ui';
import { listModerationReports } from '@/lib/admin/mobile-repository';
import { requireAdminPage } from '@/lib/admin/session';
import { isReportStatus, reportStatusLabels } from '@/src/admin/domain';
import { formatAdminDate } from '@/src/admin/presentation';

export const dynamic = 'force-dynamic';

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function statusTone(status: string) {
  if (status === 'resolved') return 'success' as const;
  if (status === 'dismissed') return 'neutral' as const;
  if (status === 'reviewing') return 'warning' as const;
  return 'danger' as const;
}

export default async function AdminModerationPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdminPage('reports.read');
  const raw = await searchParams;
  const status = first(raw.status);
  const type = first(raw.type);
  const cursor = first(raw.cursor);
  const { reports, nextCursor } = await listModerationReports({ status, type, cursor });
  const nextQuery = new URLSearchParams();
  if (status) nextQuery.set('status', status);
  if (type) nextQuery.set('type', type);
  return (
    <main className="admin-main" id="ana-icerik">
      <AdminPageHeader eyebrow="Mobil uygulama" title="Moderasyon" description="Raporları tek kuyruğa al; yalnızca bildirilen içeriği ve gerekli minimum bağlamı incele." />
      <form className="admin-filter-panel is-short">
        <label><span>Durum</span><select defaultValue={status ?? ''} name="status"><option value="">Tümü</option><option value="open">Yeni</option><option value="reviewing">İnceleniyor</option><option value="resolved">İşlem Yapıldı</option><option value="dismissed">Reddedildi</option></select></label>
        <label><span>Rapor türü</span><select defaultValue={type ?? ''} name="type"><option value="">Tümü</option><option value="direct">DM mesajı</option><option value="group">Grup mesajı</option></select></label>
        <div className="admin-filter-actions"><button type="submit">Filtrele</button><Link href="/admin/mobile/moderation">Temizle</Link></div>
      </form>
      <div className="admin-table-wrap">
        <table className="admin-post-table admin-ops-table">
          <thead><tr><th>Rapor</th><th>Tür</th><th>Gerekçe</th><th>Bildiren</th><th>Bildirilen</th><th>Tarih</th><th>Durum</th><th><span className="sr-only">İşlem</span></th></tr></thead>
          <tbody>{reports.map((report) => <tr key={report.id}><td><strong>{report.id}</strong></td><td>{report.conversationType === 'direct' ? 'DM mesajı' : report.conversationType === 'group' ? 'Grup mesajı' : 'Kullanıcı / profil'}</td><td className="admin-table-reason">{report.reason}</td><td>{report.reporterUid || '—'}</td><td>{report.reportedUid || '—'}</td><td>{formatAdminDate(report.createdAt)}</td><td><AdminStatusBadge tone={statusTone(report.status)}>{isReportStatus(report.status) ? reportStatusLabels[report.status] : report.status}</AdminStatusBadge></td><td><Link className="admin-table-link" href={`/admin/mobile/moderation/${encodeURIComponent(report.id)}`}>İncele →</Link></td></tr>)}</tbody>
        </table>
        {!reports.length ? <AdminEmptyState title="Rapor bulunamadı" description="Seçilen filtrede bekleyen moderasyon kaydı yok." /> : null}
      </div>
      <AdminPagination nextCursor={nextCursor} nextHref={`/admin/mobile/moderation${nextQuery.size ? `?${nextQuery}` : ''}`} />
    </main>
  );
}
