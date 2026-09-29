import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BookOpenCheck, Building2, Mail, ShieldCheck } from 'lucide-react';
import { Container } from '@/components/site/container';
import { createPageMetadata } from '@/src/config/seo';
import { siteConfig } from '@/src/config/site';

export const metadata: Metadata = createPageMetadata({
  title: 'Devrem Hakkında',
  description:
    'Devrem’in askerlik bilgilerini, birlik rehberlerini, güncel verileri ve hazırlık araçlarını nasıl sunduğunu öğrenin.',
  path: '/hakkimizda',
});

const offerings = [
  'Askerî birlik, konum ve ulaşım rehberleri',
  'Celp, sevk ve sınıflandırma içerikleri',
  'Bedelli askerlik ücretleri ve karşılaştırmaları',
  'Hazırlık rehberleri ve pratik askerlik araçları',
] as const;

export default function AboutPage() {
  return (
    <main id="ana-icerik">
      <section className="platform-section">
        <Container>
          <header className="page-hero max-w-4xl">
            <p className="page-hero-meta">Bağımsız askerlik bilgi platformu</p>
            <h1 className="page-title">Devrem Hakkında</h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-secondary-foreground sm:text-lg">
              Devrem, askerliğe hazırlanırken ihtiyaç duyulan birlik bilgilerini,
              celp ve sevk tarihlerini, bedelli askerlik verilerini, rehberleri ve
              pratik araçları tek yerde sunan bağımsız bir askerlik bilgi platformudur.
            </p>
          </header>

          <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)]">
            <div className="space-y-6">
              <section className="rounded-3xl border border-border bg-surface p-6 sm:p-8">
                <h2 className="text-2xl font-extrabold">Devrem nedir?</h2>
                <p className="mt-4 leading-7 text-secondary-foreground">Devrem, askerlik sürecindeki dağınık bilgileri anlaşılır bir yapıda bir araya getirir. Birlik araştırmasından teslim hazırlığına kadar kullanıcıların doğru içeriğe daha hızlı ulaşmasını amaçlar.</p>
              </section>

              <section className="rounded-3xl border border-border bg-surface p-6 sm:p-8">
                <h2 className="text-2xl font-extrabold">Neden kuruldu?</h2>
                <p className="mt-4 leading-7 text-secondary-foreground">Celp tarihleri, birlik bilgileri, ulaşım detayları ve hazırlık soruları farklı kaynaklara dağıldığı için araştırma süreci zorlaşır. Devrem bu süreci sade, erişilebilir ve kaynak bağlamı açık içeriklerle kolaylaştırmak için kuruldu.</p>
              </section>

              <section className="rounded-3xl border border-border bg-surface p-6 sm:p-8">
                <h2 className="text-2xl font-extrabold">Neler sunuyor?</h2>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {offerings.map((item) => (
                    <li className="flex gap-3 rounded-2xl bg-primary/7 p-4 text-sm font-semibold leading-6" key={item}>
                      <BookOpenCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="rounded-3xl border border-border bg-surface p-6 sm:p-8">
                <h2 className="text-2xl font-extrabold">Bilgileri nasıl hazırlıyoruz?</h2>
                <p className="mt-4 leading-7 text-secondary-foreground">İçerikler resmî açıklamalar, kamuya açık kaynaklar ve editoryal araştırmalar kullanılarak hazırlanır. Değişebilen bilgiler tarih ve kaynak bağlamıyla sunulur; doğrulanmamış birlik bilgileri kesin bilgi gibi gösterilmez.</p>
              </section>
            </div>

            <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
              <section className="rounded-3xl bg-foreground p-6 text-background sm:p-8">
                <ShieldCheck className="size-7 text-primary" aria-hidden="true" />
                <h2 className="mt-5 text-xl font-extrabold">Resmî kurumlarla ilişkimiz var mı?</h2>
                <p className="mt-4 text-sm leading-6 text-background/75">Devrem, T.C. Millî Savunma Bakanlığı veya herhangi bir kamu kurumu tarafından işletilen resmî bir platform değildir.</p>
                <p className="mt-3 text-sm leading-6 text-background/75">Resmî işlem, tarih ve belge gereken konularda MSB, e-Devlet ve diğer yetkili kamu kaynakları esas alınmalıdır.</p>
              </section>

              <section className="rounded-3xl border border-border bg-surface p-6">
                <Building2 className="size-6 text-primary" aria-hidden="true" />
                <h2 className="mt-4 text-xl font-extrabold">İşletici ve iletişim</h2>
                <p className="mt-3 text-sm leading-6 text-secondary-foreground">{siteConfig.operatorName}</p>
                <p className="mt-3 text-sm leading-6 text-secondary-foreground">{siteConfig.address}</p>
                <a className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-primary-ink" href={`mailto:${siteConfig.contactEmail}`}>
                  <Mail className="size-4" aria-hidden="true" /> {siteConfig.contactEmail}
                </a>
              </section>
            </aside>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link className="platform-primary-button" href="/birlikler">Birlikleri incele <ArrowRight className="size-4" aria-hidden="true" /></Link>
            <Link className="platform-secondary-button" href="/support">İletişim</Link>
          </div>
        </Container>
      </section>
    </main>
  );
}
