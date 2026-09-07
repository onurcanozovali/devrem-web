import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';
import { MilitaryRanks } from '@/components/military-dictionary/military-dictionary';
import { JsonLd } from '@/components/seo/json-ld';
import { Container } from '@/components/site/container';
import {
  breadcrumbSchema,
  graphSchema,
  webPageSchema,
} from '@/lib/seo/structured-data';
import { createPageMetadata } from '@/src/config/seo';

const title = 'Askerî Rütbeler: TSK Rütbe Sıralaması ve İşaretleri | Devrem';
const description =
  'Kara, Hava ve Deniz Kuvvetleri askerî rütbelerini; rütbe işaretleri, grupları ve hiyerarşik sıralarıyla incele.';
const path = '/asker-rutbeleri';

export const metadata: Metadata = {
  ...createPageMetadata({
    title,
    description,
    path,
    imageAlt: 'Devrem askerî rütbeler rehberi',
  }),
  title: { absolute: title },
};

const structuredData = graphSchema(
  webPageSchema({ path, name: title, description, dateModified: '2026-09-07' }),
  breadcrumbSchema([
    { name: 'Ana Sayfa', path: '/' },
    { name: 'Asker Sözlüğü', path: '/asker-sozlugu' },
    { name: 'Askerî Rütbeler', path },
  ]),
);

export default function MilitaryRanksPage() {
  return (
    <main className="dictionary-page" id="ana-icerik">
      <JsonLd data={structuredData} />
      <Container>
        <nav className="dictionary-breadcrumb" aria-label="Sayfa yolu">
          <Link href="/asker-sozlugu">
            <ArrowLeft aria-hidden="true" /> Asker Sözlüğü
          </Link>
          <span aria-hidden="true">/</span>
          <span>Askerî Rütbeler</span>
        </nav>
        <section className="dictionary-hero" aria-labelledby="ranks-title">
          <div>
            <p className="dictionary-kicker">
              <Shield aria-hidden="true" /> Devrem bilgi merkezi
            </p>
            <h1 id="ranks-title">Askerî Rütbeler</h1>
            <p>
              Kara, Hava ve Deniz Kuvvetleri rütbelerini işaretleri ve
              hiyerarşik sıralarıyla karşılaştır.
            </p>
            <a href="#rutbeler">Rütbeleri incele</a>
          </div>
          <aside aria-label="Rehber kapsamı">
            <Shield aria-hidden="true" />
            <strong>Üç kuvvet, tek görsel rehber</strong>
            <p>General ve amiralden erbaş ve ere kadar 63 rütbe kartı.</p>
            <div>
              <span>Kara</span>
              <span>Hava</span>
              <span>Deniz</span>
            </div>
          </aside>
        </section>
        <MilitaryRanks />
      </Container>
    </main>
  );
}
