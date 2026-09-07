import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Calculator } from 'lucide-react';
import { JsonLd } from '@/components/seo/json-ld';
import { Container } from '@/components/site/container';
import {
  breadcrumbSchema,
  graphSchema,
  webPageSchema,
} from '@/lib/seo/structured-data';
import { createPageMetadata } from '@/src/config/seo';

const title = 'Askerlik Araçları | Devrem';
const description =
  'Devrem’in askerlik sürecini anlamayı kolaylaştıran mevcut hesaplama ve karşılaştırma araçlarına ulaş.';
const path = '/araclar';

export const metadata: Metadata = {
  ...createPageMetadata({
    title,
    description,
    path,
    imageAlt: 'Devrem askerlik araçları',
  }),
  title: { absolute: title },
};

const structuredData = graphSchema(
  webPageSchema({ path, name: title, description, dateModified: '2026-09-07' }),
  breadcrumbSchema([
    { name: 'Ana Sayfa', path: '/' },
    { name: 'Askerlik Araçları', path },
  ]),
);

export default function ToolsPage() {
  return (
    <main className="dictionary-page" id="ana-icerik">
      <JsonLd data={structuredData} />
      <Container>
        <nav className="dictionary-breadcrumb" aria-label="Sayfa yolu">
          <Link href="/">
            <ArrowLeft aria-hidden="true" /> Ana sayfa
          </Link>
          <span aria-hidden="true">/</span>
          <span>Askerlik Araçları</span>
        </nav>
        <section className="dictionary-hero" aria-labelledby="tools-title">
          <div>
            <p className="dictionary-kicker">
              <Calculator aria-hidden="true" /> Devrem araçları
            </p>
            <h1 id="tools-title">Askerlik Araçları</h1>
            <p>
              Askerlik verilerini daha kolay anlamak için kullanabileceğin
              mevcut Devrem araçları.
            </p>
          </div>
        </section>
        <section className="dictionary-section">
          <div className="dictionary-section-heading">
            <p>Mevcut araçlar</p>
            <h2>Karşılaştır ve planla</h2>
          </div>
          <div className="dictionary-document-list">
            <Link href="/bedelli">
              <Calculator aria-hidden="true" />
              <span>
                <strong>Bedelli askerlik ücret karşılaştırması</strong>
                <small>
                  Güncel bedelli tutarını geçmiş yıllar ve alım gücüyle
                  karşılaştır.
                </small>
              </span>
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </section>
      </Container>
    </main>
  );
}
