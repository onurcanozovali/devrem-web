import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowDown, ArrowLeft, BookMarked, Search } from 'lucide-react';
import { MilitaryDictionary } from '@/components/military-dictionary/military-dictionary';
import { JsonLd } from '@/components/seo/json-ld';
import { Container } from '@/components/site/container';
import {
  breadcrumbSchema,
  graphSchema,
  webPageSchema,
} from '@/lib/seo/structured-data';
import { absoluteUrl, createPageMetadata } from '@/src/config/seo';
import { glossaryTerms, termId } from '@/src/content/military-dictionary';

const title = 'Asker Sözlüğü: Askerlik Terimleri ve Anlamları | Devrem';
const description =
  'Askerlikte kullanılan terimleri, resmî kavramları ve kışla ifadelerini alfabetik sözlükte sade açıklamalarıyla öğren.';
const path = '/asker-sozlugu';

export const metadata: Metadata = {
  ...createPageMetadata({
    title,
    description,
    path,
    imageAlt: 'Devrem Asker Sözlüğü',
  }),
  title: { absolute: title },
};

const termSetId = `${absoluteUrl(path)}#asker-sozlugu`;

const structuredData = graphSchema(
  webPageSchema({
    path,
    name: title,
    description,
    dateModified: '2026-09-07',
  }),
  breadcrumbSchema([
    { name: 'Ana Sayfa', path: '/' },
    { name: 'Asker Sözlüğü', path },
  ]),
  {
    '@type': 'DefinedTermSet',
    '@id': termSetId,
    name: 'Devrem Asker Sözlüğü',
    description,
    url: absoluteUrl(path),
    inLanguage: 'tr',
    hasDefinedTerm: glossaryTerms.map((item) => ({
      '@type': 'DefinedTerm',
      name: item.term,
      description: item.definition,
      url: `${absoluteUrl(path)}#${termId(item.term)}`,
      inDefinedTermSet: { '@id': termSetId },
    })),
  },
);

export default function MilitaryDictionaryPage() {
  return (
    <main className="dictionary-page" id="ana-icerik">
      <JsonLd data={structuredData} />
      <Container>
        <nav className="dictionary-breadcrumb" aria-label="Sayfa yolu">
          <Link href="/">
            <ArrowLeft aria-hidden="true" /> Ana sayfa
          </Link>
          <span aria-hidden="true">/</span>
          <span>Asker Sözlüğü</span>
        </nav>

        <section className="dictionary-hero" aria-labelledby="dictionary-title">
          <div>
            <p className="dictionary-kicker">
              <BookMarked aria-hidden="true" /> Devrem bilgi merkezi
            </p>
            <h1 id="dictionary-title">Asker Sözlüğü</h1>
            <p>
              Askerlikte duyacağın terimleri ve resmî kavramları A’dan Z’ye sade
              açıklamalarıyla öğren.
            </p>
            <a href="#sozluk">
              Terimleri keşfet <ArrowDown aria-hidden="true" />
            </a>
          </div>
          <aside aria-label="Sayfada neler var?">
            <Search aria-hidden="true" />
            <strong>Aradığın kavrama doğrudan ulaş</strong>
            <p>
              65 temel terim; resmî tanımlar ve gündelik kışla ifadeleriyle
              alfabetik olarak bir arada.
            </p>
            <div>
              <span>Terimler</span>
              <span>Resmî kavramlar</span>
              <span>Kışla dili</span>
              <span>Belgeler</span>
            </div>
          </aside>
        </section>

        <MilitaryDictionary />
      </Container>
    </main>
  );
}
