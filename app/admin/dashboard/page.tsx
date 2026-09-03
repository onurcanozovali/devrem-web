import Link from 'next/link';
import { CalendarPlus, FileText, ShieldAlert, Users, UsersRound } from 'lucide-react';
import { AdminPageHeader, AdminStatusBadge } from '@/components/admin/admin-ui';
import { ServicePeriodChart, UserGrowthChart, UserJourney } from '@/components/admin/dashboard-visuals';
import { TurkeyDensityMap } from '@/components/admin/turkey-density-map';
import { getAdminOperationsDashboard } from '@/lib/admin/mobile-repository';
import { requireAdminPage } from '@/lib/admin/session';
import { formatAdminDate } from '@/src/admin/presentation';

export const dynamic = 'force-dynamic';

function formatNumber(value: number) {
  return new Intl.NumberFormat('tr-TR').format(value);
}
function Kpi({
  label,
  value,
  detail,
  icon: Icon,
  tone = 'default',
}: {
  label: string;
  value: number;
  detail: string;
  icon: typeof Users;
  tone?: 'default' | 'attention';
}) {
  return (
    <article className={`admin-primary-kpi ${tone === 'attention' ? 'is-attention' : ''}`}>
      <div><span>{label}</span><Icon aria-hidden="true" /></div>
      <strong>{formatNumber(value)}</strong>
      <small>{detail}</small>
    </article>
  );
}

function reportType(value: string) {
  if (value === 'group') return 'Grup mesajı';
  if (value === 'direct') return 'Direkt mesaj';
  return 'Kullanıcı';
}

export default async function AdminDashboardPage() {
  await requireAdminPage('dashboard.read');
  const data = await getAdminOperationsDashboard();
  const trendDetail = data.kpis.last30TrendPercent === null
    ? `Önceki 30 gün: ${formatNumber(data.kpis.previous30)}`
    : `${data.kpis.last30TrendPercent >= 0 ? '+' : ''}%${new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 1 }).format(data.kpis.last30TrendPercent)} önceki döneme göre`;

  return (
    <main className="admin-main admin-dashboard" id="ana-icerik">
      <AdminPageHeader
        eyebrow="Merkezi yönetim"
        title="Operasyon özeti"
        description="Devrem kullanıcı tabanını, coğrafi yoğunluğu ve müdahale bekleyen işleri tek görünümde izle."
        action={<span className="admin-dashboard-updated">Güncellendi · {formatAdminDate(data.generatedAt)}</span>}
      />

      <section className="admin-primary-kpis" aria-label="Temel operasyon göstergeleri">
        <Kpi label="Toplam kullanıcı" value={data.kpis.users} detail="Kayıtlı Devrem hesabı" icon={Users} />
        <Kpi label="Son 30 gün kayıt" value={data.kpis.last30} detail={trendDetail} icon={CalendarPlus} />
        <Kpi label="Aktif Devre grupları" value={data.kpis.activeGroups} detail="Devre grubu toplamı" icon={UsersRound} />
        <Kpi label="Açık moderasyon raporları" value={data.kpis.openReports} detail={data.kpis.openReports ? 'İnceleme veya işlem bekliyor' : 'Bekleyen rapor yok'} icon={ShieldAlert} tone={data.kpis.openReports ? 'attention' : 'default'} />
      </section>

      <TurkeyDensityMap residence={data.geography.residence} military={data.geography.military} source={data.geography.source} updatedAt={data.geography.updatedAt} />

      <div className="admin-dashboard-two-column admin-dashboard-analytics">
        <UserGrowthChart points={data.growth.points} source={data.growth.source} />
        <UserJourney stages={data.funnel.stages} source={data.funnel.source} />
      </div>

      <div className="admin-dashboard-two-column admin-dashboard-operations">
        <ServicePeriodChart items={data.periods.items} source={data.periods.source} />
        <section className="admin-dashboard-panel admin-moderation-panel" aria-labelledby="moderation-title">
          <div className="admin-dashboard-panel-heading">
            <div><p className="admin-kicker">Moderasyon</p><h2 id="moderation-title">Müdahale bekleyenler</h2></div>
            <Link href="/admin/mobile/moderation">Tüm raporları gör →</Link>
          </div>
          {data.moderation.length ? (
            <div className="admin-dashboard-table-wrap">
              <table className="admin-dashboard-table">
                <thead><tr><th>Tür</th><th>Raporlanan</th><th>Sebep</th><th>Tarih</th><th>Durum</th></tr></thead>
                <tbody>
                  {data.moderation.map((report) => (
                    <tr key={report.id}>
                      <td>{reportType(report.conversationType)}</td>
                      <td><Link href={`/admin/mobile/moderation/${report.id}`}>{report.reportedUid || '—'}</Link></td>
                      <td><span title={report.reason}>{report.reason}</span></td>
                      <td>{formatAdminDate(report.createdAt)}</td>
                      <td><AdminStatusBadge tone={report.status === 'open' ? 'danger' : 'warning'}>{report.status === 'open' ? 'Yeni' : 'İnceleniyor'}</AdminStatusBadge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="admin-moderation-empty"><ShieldAlert aria-hidden="true" /><div><strong>Bekleyen rapor bulunmuyor.</strong><p>Yeni bir rapor geldiğinde operasyon kuyruğunda görünür.</p></div></div>
          )}
        </section>
      </div>

      {!data.groupActivityAvailable ? (
        <aside className="admin-group-availability">
          <UsersRound aria-hidden="true" />
          <div><strong>Aktif grup hareketliliği</strong><p>Güvenilir aktivite özeti bulunmadığı için mesaj koleksiyonları taranmıyor. Üye ve son etkinlik metriği hazır olduğunda bu alan etkinleşecek.</p></div>
          <Link href="/admin/mobile/groups">Grupları yönet →</Link>
        </aside>
      ) : null}

      <section className="admin-content-summary" aria-labelledby="content-summary-title">
        <div className="admin-content-summary-heading">
          <div><p className="admin-kicker">Web / İçerik</p><h2 id="content-summary-title">İçerik özeti</h2></div>
          <div className="admin-content-totals"><strong>{formatNumber(data.content.published)} yayında</strong><span>{formatNumber(data.content.drafts)} taslak</span></div>
          <Link href="/admin/blog">Blog yönetimi →</Link>
        </div>
        {data.content.latest.length ? (
          <ul className="admin-content-list">
            {data.content.latest.map((post) => (
              <li key={post.id}>
                <FileText aria-hidden="true" />
                <Link href={`/admin/blog/${post.id}`}>{post.title}</Link>
                <AdminStatusBadge tone={post.status === 'published' ? 'success' : 'neutral'}>{post.status === 'published' ? 'Yayında' : 'Taslak'}</AdminStatusBadge>
                <time>{formatAdminDate(post.updatedAt, false)}</time>
              </li>
            ))}
          </ul>
        ) : <p className="admin-muted-copy">Henüz içerik bulunmuyor.</p>}
      </section>
    </main>
  );
}
