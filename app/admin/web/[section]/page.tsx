import { notFound } from 'next/navigation';
import { AdminPageHeader, NotConnected } from '@/components/admin/admin-ui';
import { requireAdminPage } from '@/lib/admin/session';

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
  return (
    <main className="admin-main" id="ana-icerik">
      <AdminPageHeader eyebrow="Web / İçerik" title={value[0]} description={value[1]} />
      <NotConnected title="Bu alan mevcut veri kaynağına bağlı değil">
        Mevcut landing ve blog davranışı değiştirilmedi. Yazılabilir bir içerik şeması tanımlanmadan sahte kontroller sunulmuyor.
      </NotConnected>
    </main>
  );
}
