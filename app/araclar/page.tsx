import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { platformToolCards } from '@/components/home/platform-sections';
import { Container } from '@/components/site/container';
import { createPageMetadata } from '@/src/config/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'Askerlik Araçları',
  description:
    'Bedelli askerlik hesaplamaları, ücret geçmişi, celp ve sevk takvimi ile hazırlık rehberlerine tek yerden ulaşın.',
  path: '/araclar',
});

export default function ToolsPage() {
  return (
    <main id="ana-icerik">
      <section className="platform-section">
        <Container>
          <header className="page-hero max-w-4xl">
            <p className="page-hero-meta">Devrem araçları</p>
            <h1 className="page-title">Askerlik Araçları</h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-secondary-foreground sm:text-lg">
              Bedelli ücretlerini karşılaştır, celp ve sevk tarihlerini kontrol et
              ve teslim öncesi hazırlığını mevcut Devrem içerikleriyle planla.
            </p>
          </header>

          <section className="mt-12" aria-labelledby="available-tools-title">
            <div className="max-w-3xl">
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary-ink">Kullanılabilir içerikler</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.045em]" id="available-tools-title">İhtiyacın olan bilgiye doğrudan ulaş</h2>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {platformToolCards.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Link className="platform-tool-card" href={tool.href} key={tool.title}>
                    <span><Icon className="size-6" aria-hidden="true" /></span>
                    <h3>{tool.title}</h3>
                    <p>{tool.description}</p>
                    <small>{tool.label}</small>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="mt-12 rounded-3xl border border-border bg-surface p-6 sm:p-8" aria-labelledby="tools-method-title">
            <h2 className="text-2xl font-extrabold" id="tools-method-title">Veriler nasıl kullanılıyor?</h2>
            <ul className="mt-5 grid gap-4 text-sm leading-6 text-secondary-foreground md:grid-cols-3">
              {[
                'Bedelli tutarlarında yayımlanmış resmî dönem verileri esas alınır.',
                'Celp ve sevk bilgileri ilgili rehberlerde kaynaklarıyla açıklanır.',
                'Değişebilen bilgiler için işlem öncesinde MSB ve e-Devlet kayıtları kontrol edilmelidir.',
              ].map((item) => (
                <li className="flex gap-3" key={item}>
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link className="platform-text-link mt-7" href="/blog">
              Askerlik rehberlerini incele <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </section>
        </Container>
      </section>
    </main>
  );
}
