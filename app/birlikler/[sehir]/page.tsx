import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, MapPin } from 'lucide-react';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/seo/json-ld';
import { Container } from '@/components/site/container';
import { getMilitaryUnitCity } from '@/lib/military-units';
import { breadcrumbSchema, graphSchema, webPageSchema } from '@/lib/seo/structured-data';
import { createPageMetadata } from '@/src/config/seo';

export const dynamic = 'force-dynamic';

type PageProps = { params: Promise<{ sehir: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { sehir } = await params;
  const result = await getMilitaryUnitCity(sehir);
  if (!result) return { robots: { index: false, follow: false } };
  const path = `/birlikler/${sehir}`;
  const title = `${result.city} Askerî Birlikleri ve Birlik Rehberi | Devrem`;
  const description = `${result.city} ilindeki doğrulanmış askerî birliklerin konum, kuvvet ve ulaşım bilgilerini incele.`;
  return {
    ...createPageMetadata({ title, description, path, imageAlt: `${result.city} askerî birlikleri` }),
    title: { absolute: title },
  };
}

export default async function MilitaryUnitCityPage({ params }: PageProps) {
  const { sehir } = await params;
  const result = await getMilitaryUnitCity(sehir);
  if (!result) notFound();
  const path = `/birlikler/${sehir}`;
  const title = `${result.city} Askerî Birlikleri ve Birlik Rehberi | Devrem`;
  const description = `${result.city} ilindeki doğrulanmış askerî birliklerin konum, kuvvet ve ulaşım bilgilerini incele.`;
  const updatedAt = result.units.reduce(
    (latest, unit) => (unit.updatedAt > latest ? unit.updatedAt : latest),
    result.units[0].updatedAt,
  );
  const structuredData = graphSchema(
    webPageSchema({ path, name: title, description, dateModified: updatedAt.slice(0, 10) }),
    breadcrumbSchema([
      { name: 'Ana Sayfa', path: '/' },
      { name: 'Askerî Birlikler', path: '/birlikler' },
      { name: result.city, path },
    ]),
  );

  return (
    <main className="bg-background py-8 sm:py-12" id="ana-icerik">
      <JsonLd data={structuredData} />
      <Container>
        <nav aria-label="Sayfa yolu" className="flex flex-wrap items-center gap-2 text-sm font-bold text-secondary-foreground">
          <Link className="inline-flex items-center gap-2 hover:text-primary" href="/birlikler">
            <ArrowLeft className="size-4" aria-hidden="true" /> Askerî Birlikler
          </Link>
          <span aria-hidden="true">/</span>
          <span>{result.city}</span>
        </nav>
        <header className="mt-8 max-w-3xl">
          <p className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-[0.14em] text-primary">
            <MapPin className="size-5" aria-hidden="true" /> Şehir rehberi
          </p>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
            {result.city} askerî birlikleri
          </h1>
          <p className="mt-5 text-lg leading-8 text-secondary-foreground">
            Yayın kriterlerini karşılayan {result.units.length} birlik için doğrulanmış bilgileri incele.
          </p>
        </header>
        <section className="mt-10 grid gap-4 md:grid-cols-2" aria-label={`${result.city} birlikleri`}>
          {result.units.map((unit) => (
            <Link
              className="group rounded-3xl border border-border bg-surface p-6 shadow-sm transition hover:border-primary/35 hover:shadow-md"
              href={`/birlikler/${unit.citySlug}/${unit.slug}`}
              key={unit.id}
            >
              <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-primary">{unit.force}</p>
              <h2 className="mt-2 text-xl font-extrabold leading-snug">{unit.shortName ?? unit.name}</h2>
              <p className="mt-3 text-sm text-secondary-foreground">{unit.district}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-primary">
                Birlik bilgilerini incele <ArrowRight className="size-4 transition group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </section>
      </Container>
    </main>
  );
}
