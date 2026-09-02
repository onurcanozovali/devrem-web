import Link from 'next/link';
import { AdminMetricCard, AdminPageHeader, NotConnected } from '@/components/admin/admin-ui';
import { getAdminDashboardMetrics } from '@/lib/admin/mobile-repository';
import { requireAdminPage } from '@/lib/admin/session';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  await requireAdminPage('dashboard.read');
  const metrics = await getAdminDashboardMetrics();
  return (
    <main className="admin-main" id="ana-icerik">
      <AdminPageHeader
        eyebrow="Merkezi yönetim"
        title="Operasyon özeti"
        description="Web içeriklerini ve mobil uygulamanın güvenli operasyon göstergelerini tek yerden izle."
      />
      <section className="admin-ops-section" aria-labelledby="mobile-metrics">
        <div className="admin-ops-section-heading">
          <div><p className="admin-kicker">Mobil uygulama</p><h2 id="mobile-metrics">Bugünkü görünüm</h2></div>
          <Link href="/admin/mobile/analytics">Tüm istatistikler →</Link>
        </div>
        <div className="admin-metric-grid">
          <AdminMetricCard label="Toplam kullanıcı" value={metrics.users} />
          <AdminMetricCard label="Bugün kayıt" value={metrics.today} />
          <AdminMetricCard label="Son 7 gün" value={metrics.last7} />
          <AdminMetricCard label="Son 30 gün" value={metrics.last30} />
          <AdminMetricCard label="Onboarding tamam" value={metrics.onboarding} />
          <AdminMetricCard label="Devre grupları" value={metrics.groups} detail="Durum kaydı olmayan gruplar aktif kabul edilir." />
          <AdminMetricCard label="Açık rapor" value={metrics.openReports} />
          <AdminMetricCard label="Askıya alınmış" value={metrics.suspended} />
          <AdminMetricCard label="Son 24 saat grup mesajı" value={null} unavailable detail="Güvenilir özet koleksiyonu bulunmuyor." />
          <AdminMetricCard label="Son 24 saat DM mesajı" value={null} unavailable detail="Güvenilir özet koleksiyonu bulunmuyor." />
        </div>
      </section>
      <section className="admin-ops-section" aria-labelledby="web-metrics">
        <div className="admin-ops-section-heading">
          <div><p className="admin-kicker">Web / İçerik</p><h2 id="web-metrics">Yayın durumu</h2></div>
          <Link href="/admin/blog">Blog yönetimi →</Link>
        </div>
        <div className="admin-metric-grid is-compact">
          <AdminMetricCard label="Toplam blog yazısı" value={metrics.blogPosts} />
          <AdminMetricCard label="Yayındaki yazılar" value={metrics.publishedPosts} />
          <AdminMetricCard label="Taslaklar" value={Math.max(0, metrics.blogPosts - metrics.publishedPosts)} />
          <AdminMetricCard label="DM konuşmaları" value={metrics.conversations} />
        </div>
        <NotConnected title="Trafik ve sponsor özetleri">
          Güvenilir bir analytics ya da sponsor veri kaynağı henüz bağlı değil; panel tahmini veri göstermiyor.
        </NotConnected>
      </section>
    </main>
  );
}
