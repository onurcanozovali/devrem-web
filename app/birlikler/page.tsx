import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { MilitaryUnitDirectory } from '@/components/military-units/military-unit-directory';
import { JsonLd } from '@/components/seo/json-ld';
import { Container } from '@/components/site/container';
import { listIndexableMilitaryUnits } from '@/lib/military-units';
import { breadcrumbSchema, graphSchema, webPageSchema } from '@/lib/seo/structured-data';
import { createPageMetadata } from '@/src/config/seo';

export const dynamic = 'force-dynamic';

const path = '/birlikler';
const title = 'Askerî Birlikler: Konum ve Ulaşım Rehberi | Devrem';
const description =
  'Devrem askerî birlik kataloğunda şehir, kuvvet, konum, doğrulama durumu ve ulaşım bilgilerini keşfet.';

export async function generateMetadata(): Promise<Metadata> {
  const units = await listIndexableMilitaryUnits();
  return {
    ...createPageMetadata({ title, description, path, imageAlt: 'Devrem Askerî Birlikler Rehberi' }),
    title: { absolute: title },
    robots: units.length ? undefined : { index: false, follow: true },
  };
}

export default async function MilitaryUnitsPage() {
  const units = await listIndexableMilitaryUnits();
  const updatedAt = units[0]?.updatedAt.slice(0, 10) ?? '2026-09-11';
  const structuredData = graphSchema(
    webPageSchema({ path, name: title, description, dateModified: updatedAt }),
    breadcrumbSchema([
      { name: 'Ana Sayfa', path: '/' },
      { name: 'Askerî Birlikler', path },
    ]),
  );

  return (
    <main className="bg-background py-8 sm:py-12" id="ana-icerik">
      <JsonLd data={structuredData} />
      <Container>
        <nav aria-label="Sayfa yolu" className="flex items-center gap-2 text-sm font-bold text-secondary-foreground">
          <Link className="inline-flex items-center gap-2 hover:text-primary" href="/">
            <ArrowLeft className="size-4" aria-hidden="true" /> Ana sayfa
          </Link>
          <span aria-hidden="true">/</span>
          <span>Askerî Birlikler</span>
        </nav>

        <header className="mt-8 max-w-3xl">
          <p className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-[0.14em] text-primary">
            <ShieldCheck className="size-5" aria-hidden="true" /> Kaynak durumlu katalog
          </p>
          <h1 className="mt-4 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
            Askerî birlikleri keşfet
          </h1>
          <p className="mt-5 text-base leading-8 text-secondary-foreground sm:text-lg">
            Yayın kriterlerini karşılayan birliklerin konum, kuvvet ve ulaşım bilgilerine tek yerden ulaş.
          </p>
        </header>

        {units.length ? (
          <MilitaryUnitDirectory units={units} />
        ) : (
          <section className="mt-10 rounded-3xl border border-border bg-surface p-8 shadow-sm">
            <h2 className="text-xl font-extrabold">Yayınlanmış birlik bulunmuyor</h2>
            <p className="mt-3 max-w-2xl leading-7 text-secondary-foreground">
              Yayında ve arama motorlarına açık bir birlik kaydı henüz bulunmuyor.
            </p>
          </section>
        )}
      </Container>
    </main>
  );
}
