import { notFound } from 'next/navigation';
import {
  AdminMetricCard,
  AdminPageHeader,
  AdminStatusBadge,
  NotConnected,
} from '@/components/admin/admin-ui';
import { requireAdminPage } from '@/lib/admin/session';
import { listAdminBlogPosts } from '@/lib/blog/repository';
import { isIndexingEnabled, seoConfig } from '@/src/config/seo';
import { pageSitemapEntries, toolSitemapEntries } from '@/src/config/seo-routes';

const sections = {
  categories: ['Kategoriler', 'Blog kategorilerinin kontrollü sözlüğü'],
  pages: ['Sayfalar', 'Kurumsal ve yasal sayfa içerikleri'],
  sponsors: ['Sponsorlar / İş Birlikleri', 'Marka ve iş birliği kayıtları'],
  media: ['Medya', 'Web için yüklenen görsel varlıklar'],
  seo: ['SEO', 'Site geneli arama görünürlüğü ayarları'],
  settings: ['Site Ayarları', 'Landing ve genel site yapılandırması'],
} as const;

export default async function AdminWebSectionPage({ params }: { params: Promise<{ section: string }> }) {
  await requireAdminPage('web.read');
  const { section } = await params;
  const value = sections[section as keyof typeof sections];
  if (!value) notFound();
  if (section === 'seo') {
    let posts: Awaited<ReturnType<typeof listAdminBlogPosts>> = [];
    try {
      posts = await listAdminBlogPosts();
    } catch {
      posts = [];
    }
    const publishedPosts = posts.filter((post) => post.status === 'published');
    const indexablePosts = publishedPosts.filter((post) => !post.noindex);
    const missingSeoTitle = publishedPosts.filter(
      (post) => !post.seoTitle.trim(),
    ).length;
    const missingDescription = publishedPosts.filter(
      (post) => !post.metaDescription.trim(),
    ).length;
    const missingOg = publishedPosts.filter(
      (post) => !post.ogImage && !post.coverImage,
    ).length;
    return (
      <main className="admin-main" id="ana-icerik">
        <AdminPageHeader
          eyebrow="Web / İçerik"
          title="Teknik SEO"
          description="Kanonik alan adı, indeksleme güvenliği ve keşif uç noktalarının üretim durumu."
        />
        <section className="admin-ops-section">
          <div className="admin-ops-section-heading">
            <div>
              <p className="admin-kicker">İndeksleme</p>
              <h2>Yayın ortamı</h2>
            </div>
            <AdminStatusBadge tone={isIndexingEnabled ? 'success' : 'warning'}>
              {isIndexingEnabled ? 'İndeksleme açık' : 'İndeksleme kapalı'}
            </AdminStatusBadge>
          </div>
          <div className="admin-metric-grid is-compact">
            <AdminMetricCard label="Kanonik alan adı" value={seoConfig.origin} />
            <AdminMetricCard
              label="İndekslenebilir sayfa"
              value={
                pageSitemapEntries.length +
                toolSitemapEntries.length +
                indexablePosts.length
              }
            />
            <AdminMetricCard label="Yayınlanmış yazı" value={publishedPosts.length} />
            <AdminMetricCard
              label="Noindex yazı"
              value={publishedPosts.length - indexablePosts.length}
            />
            <AdminMetricCard label="Eksik SEO başlığı" value={missingSeoTitle} />
            <AdminMetricCard
              label="Eksik açıklama"
              value={missingDescription}
            />
            <AdminMetricCard label="Eksik OG / kapak" value={missingOg} />
            <AdminMetricCard label="Sitemap" value="/sitemap.xml" detail="Dinamik" />
            <AdminMetricCard label="RSS" value="/feed.xml" detail="Yayınlanmış yazılar" />
          </div>
        </section>
        {!isIndexingEnabled ? (
          <NotConnected title="Arama motoru indekslemesi güvenli biçimde kapalı">
            Yalnızca kanonik production ortamında SEO_ALLOW_INDEXING=true olarak
            ayarlayın. Preview, staging ve yerel ortamlar robots ile engellenir.
          </NotConnected>
        ) : null}
      </main>
    );
  }
  return (
    <main className="admin-main" id="ana-icerik">
      <AdminPageHeader eyebrow="Web / İçerik" title={value[0]} description={value[1]} />
      <NotConnected title="Bu alan mevcut veri kaynağına bağlı değil">
        Mevcut landing ve blog davranışı değiştirilmedi. Yazılabilir bir içerik şeması tanımlanmadan sahte kontroller sunulmuyor.
      </NotConnected>
    </main>
  );
}
