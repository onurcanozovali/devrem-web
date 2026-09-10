import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  MapPin,
  Navigation,
  Shield,
} from 'lucide-react';
import { notFound, permanentRedirect } from 'next/navigation';
import { JsonLd } from '@/components/seo/json-ld';
import { Container } from '@/components/site/container';
import {
  listIndexableMilitaryUnits,
  resolveMilitaryUnitRoute,
} from '@/lib/military-units';
import { absoluteUrl, createPageMetadata } from '@/src/config/seo';

export const dynamic = 'force-dynamic';

type PageProps = { params: Promise<{ sehir: string; birlik: string }> };

function unitTitle(name: string) {
  return `${name}: Konum, Ulaşım ve Birlik Bilgileri | Devrem`;
}

function unitDescription(name: string, city: string, district: string | null, force: string) {
  return `${name} için ${city}${district ? ` ${district}` : ''} konumu, ${force} bilgisi, doğrulanmış birlik detayları ve ulaşım rehberi.`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { sehir, birlik } = await params;
  const result = await resolveMilitaryUnitRoute(sehir, birlik);
  if (!result) return { robots: { index: false, follow: false } };
  const { unit } = result;
  const title = unit.seoTitle ?? unitTitle(unit.shortName ?? unit.name);
  const description = unit.metaDescription ?? unitDescription(unit.name, unit.city, unit.district, unit.force);
  return {
    ...createPageMetadata({
      title,
      description,
      path: result.canonicalPath,
      imageAlt: `${unit.name} birlik rehberi`,
    }),
    title: { absolute: title },
  };
}

export default async function MilitaryUnitDetailPage({ params }: PageProps) {
  const { sehir, birlik } = await params;
  const result = await resolveMilitaryUnitRoute(sehir, birlik);
  if (!result) notFound();
  if (!result.isCanonical) permanentRedirect(result.canonicalPath);

  const { unit } = result;
  const allUnits = await listIndexableMilitaryUnits();
  const sameCity = allUnits.filter(
    (item) => item.citySlug === unit.citySlug && item.id !== unit.id,
  );
  const name = unit.shortName ?? unit.name;
  const title = unit.seoTitle ?? unitTitle(name);
  const description = unit.metaDescription ?? unitDescription(unit.name, unit.city, unit.district, unit.force);
  const faq = [
    {
      question: `${name} hangi kuvvete bağlı?`,
      answer: `${unit.name}, katalog kaydına göre ${unit.force} bünyesindedir.`,
    },
    ...(unit.address
      ? [{ question: `${name} nerede?`, answer: `${unit.city}${unit.district ? `, ${unit.district}` : ''}. Adres: ${unit.address}` }]
      : []),
    ...(unit.transportation
      ? [{ question: `${name} birliğine nasıl gidilir?`, answer: unit.transportation }]
      : []),
  ];
  const breadcrumbItems = [
    { name: 'Ana Sayfa', item: absoluteUrl('/') },
    { name: 'Askerî Birlikler', item: absoluteUrl('/birlikler') },
    ...(sameCity.length ? [{ name: unit.city, item: absoluteUrl(`/birlikler/${unit.citySlug}`) }] : []),
    { name: unit.name, item: absoluteUrl(result.canonicalPath) },
  ];
  const breadcrumb = {
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      ...item,
    })),
  };
  const place = {
    '@type': 'Place',
    name: unit.name,
    url: absoluteUrl(result.canonicalPath),
    address: unit.address
      ? {
          '@type': 'PostalAddress',
          streetAddress: unit.address,
          addressLocality: unit.district ?? unit.city,
          addressRegion: unit.city,
          addressCountry: 'TR',
        }
      : undefined,
    geo:
      unit.latitude !== null && unit.longitude !== null
        ? { '@type': 'GeoCoordinates', latitude: unit.latitude, longitude: unit.longitude }
        : undefined,
  };
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        name: title,
        description,
        url: absoluteUrl(result.canonicalPath),
        inLanguage: 'tr',
        dateModified: unit.updatedAt,
      },
      breadcrumb,
      place,
      {
        '@type': 'FAQPage',
        mainEntity: faq.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      },
    ],
  };

  return (
    <main className="bg-background py-8 sm:py-12" id="ana-icerik">
      <JsonLd data={structuredData} />
      <Container>
        <nav aria-label="Sayfa yolu" className="flex flex-wrap items-center gap-2 text-sm font-bold text-secondary-foreground">
          <Link className="inline-flex items-center gap-2 hover:text-primary" href="/birlikler">
            <ArrowLeft className="size-4" aria-hidden="true" /> Birlikler
          </Link>
          <span aria-hidden="true">/</span>
          <span>{unit.city}</span>
          <span aria-hidden="true">/</span>
          <span>{name}</span>
        </nav>

        <header className="mt-8 rounded-[2rem] border border-primary/15 bg-primary/8 p-6 sm:p-10 lg:p-12">
          <div className="flex flex-wrap items-center gap-3 text-sm font-extrabold text-primary">
            <span className="inline-flex items-center gap-2 rounded-full bg-surface px-3 py-2">
              <BadgeCheck className="size-4" aria-hidden="true" /> Kimlik kaydı doğrulandı
            </span>
            <span>{unit.force}</span>
          </div>
          <h1 className="mt-6 max-w-4xl text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl">
            {unit.name}
          </h1>
          <p className="mt-6 flex flex-wrap items-center gap-2 text-base font-semibold text-secondary-foreground">
            <MapPin className="size-5 text-primary" aria-hidden="true" />
            {unit.city}{unit.district ? ` · ${unit.district}` : ''}
            {unit.unitType ? ` · ${unit.unitType}` : ''}
          </p>
        </header>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="space-y-8">
            <section className="rounded-3xl border border-border bg-surface p-6 shadow-sm sm:p-8">
              <h2 className="text-2xl font-extrabold">Birlik özeti</h2>
              {unit.introduction ? <p className="mt-4 leading-7 text-secondary-foreground">{unit.introduction}</p> : null}
              <dl className="mt-6 grid gap-5 sm:grid-cols-2">
                {[
                  ['Kuvvet', unit.force],
                  ['Şehir', unit.city],
                  ['İlçe', unit.district],
                  ['Birlik türü', unit.unitType],
                  ['Hedef kitle', unit.audience],
                  ['Kayıt güncellemesi', new Intl.DateTimeFormat('tr-TR', { dateStyle: 'long' }).format(new Date(unit.updatedAt))],
                ].map(([label, value]) => (
                  <div className="border-b border-border pb-4" key={label}>
                    <dt className="text-xs font-extrabold uppercase tracking-[0.12em] text-primary">{label}</dt>
                    <dd className="mt-2 font-semibold">{value ?? 'Doğrulanmış bilgi bulunmuyor'}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="rounded-3xl border border-border bg-surface p-6 shadow-sm sm:p-8">
              <h2 className="flex items-center gap-3 text-2xl font-extrabold"><Navigation className="size-6 text-primary" aria-hidden="true" /> Konum ve nasıl gidilir</h2>
              <h3 className="mt-6 font-extrabold">Konum</h3>
              <p className="mt-2 leading-7 text-secondary-foreground">{unit.address ?? 'Doğrulanmış bilgi bulunmuyor'}</p>
              {unit.mapSourceUrl ? <a className="mt-3 inline-flex font-bold text-primary underline underline-offset-4" href={unit.mapSourceUrl} rel="noreferrer" target="_blank">Harita referansını aç</a> : null}
              <h3 className="mt-6 font-extrabold">Ulaşım</h3>
              {unit.transportationMethods.length ? <div className="mt-3 space-y-4">{unit.transportationMethods.map((method) => <div key={method.label}><h4 className="font-bold">{method.label}</h4><p className="mt-1 whitespace-pre-line leading-7 text-secondary-foreground">{method.value}</p></div>)}</div> : <p className="mt-2 text-secondary-foreground">Doğrulanmış bilgi bulunmuyor</p>}
            </section>

            <section className="rounded-3xl border border-border bg-surface p-6 shadow-sm sm:p-8">
              <h2 className="flex items-center gap-3 text-2xl font-extrabold"><Shield className="size-6 text-primary" aria-hidden="true" /> Birlik hakkında doğrulanmış bilgiler</h2>
              {unit.verifiedFacts.length ? (
                <ul className="mt-5 space-y-3">
                  {unit.verifiedFacts.map((fact) => <li className="rounded-2xl bg-primary/7 px-4 py-3 leading-7" key={fact}>{fact}</li>)}
                </ul>
              ) : (
                <p className="mt-4 text-secondary-foreground">Doğrulanmış bilgi bulunmuyor.</p>
              )}
              {unit.sources.length ? <div className="mt-6 border-t border-border pt-5 text-sm text-secondary-foreground"><strong className="text-foreground">Kaynaklar</strong><ul className="mt-2 space-y-2">{unit.sources.map((source, index) => <li key={`${source.url ?? source.title}-${index}`}>{source.url ? <a className="font-bold text-primary underline underline-offset-4" href={source.url} rel="noreferrer" target="_blank">{source.title ?? 'Kaynağı görüntüle'}</a> : source.title}</li>)}</ul></div> : null}
            </section>

            {unit.facilities.length ? <section className="rounded-3xl border border-border bg-surface p-6 shadow-sm sm:p-8"><h2 className="text-2xl font-extrabold">Olanaklar</h2><div className="mt-5 grid gap-3 sm:grid-cols-2">{unit.facilities.map((item) => <div className="rounded-2xl border border-border p-4" key={item.label}><div className="flex items-center justify-between gap-3"><strong>{item.label}</strong><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${item.status === 'verified' ? 'bg-primary/10 text-primary' : 'bg-amber-100 text-amber-800'}`}>{item.status === 'verified' ? 'Doğrulandı' : 'Bildirildi'}</span></div>{item.note ? <p className="mt-2 text-sm leading-6 text-secondary-foreground">{item.note}</p> : null}</div>)}</div></section> : null}

            <section className="rounded-3xl border border-border bg-surface p-6 shadow-sm sm:p-8">
              <h2 className="text-2xl font-extrabold">Teslim ve hazırlık</h2>
              <p className="mt-4 leading-7 text-secondary-foreground">
                Teslim tarihi ve saati için sevk belgendeki bilgileri esas al. Birliğe özel güncel kurallar için resmî bildirimleri kontrol et.
              </p>
              {unit.joiningNotes ? <div className="mt-5"><h3 className="font-extrabold">Teslim / katılış notları</h3><p className="mt-2 whitespace-pre-line leading-7 text-secondary-foreground">{unit.joiningNotes}</p></div> : null}
              {unit.preparationNotes ? <div className="mt-5"><h3 className="font-extrabold">Hazırlık notları</h3><p className="mt-2 whitespace-pre-line leading-7 text-secondary-foreground">{unit.preparationNotes}</p></div> : null}
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Link className="group rounded-2xl border border-border p-4 font-extrabold transition hover:border-primary/35" href="/blog/askerde-telefon-serbest-mi">
                  Telefon rehberi <ArrowRight className="ml-2 inline size-4 text-primary transition group-hover:translate-x-1" aria-hidden="true" />
                </Link>
                <Link className="group rounded-2xl border border-border p-4 font-extrabold transition hover:border-primary/35" href="/blog/askere-giderken-canta-nasil-sadelesir">
                  Hazırlık rehberi <ArrowRight className="ml-2 inline size-4 text-primary transition group-hover:translate-x-1" aria-hidden="true" />
                </Link>
              </div>
            </section>

            <section className="rounded-3xl border border-border bg-surface p-6 shadow-sm sm:p-8">
              <h2 className="flex items-center gap-3 text-2xl font-extrabold"><BookOpen className="size-6 text-primary" aria-hidden="true" /> İlgili rehberler</h2>
              <div className="mt-5 grid gap-3">
                {[
                  ['/blog/acemi-birliginde-ilk-gun', 'Acemi birliğinde ilk gün'],
                  ['/blog/askerlik-yol-parasi-ne-kadar-nasil-alinir', 'Askerlik yol parası nasıl alınır?'],
                  ['/blog/sevk-belgesi-nedir-nasil-alinir', 'Sevk belgesi nedir, nasıl alınır?'],
                ].map(([href, label]) => (
                  <Link className="flex items-center justify-between gap-4 rounded-2xl bg-primary/7 px-4 py-3 font-bold hover:text-primary" href={href} key={href}>
                    {label}<ArrowRight className="size-4 shrink-0" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-border bg-surface p-6 shadow-sm sm:p-8">
              <h2 className="text-2xl font-extrabold">Sık sorulan sorular</h2>
              <div className="mt-5 divide-y divide-border">
                {faq.map((item) => (
                  <details className="py-4" key={item.question}>
                    <summary className="cursor-pointer font-extrabold">{item.question}</summary>
                    <p className="mt-3 leading-7 text-secondary-foreground">{item.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
            <section className="rounded-3xl bg-foreground p-6 text-background">
              <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-primary">Devrem uygulaması</p>
              <h2 className="mt-3 text-xl font-extrabold">Bu birliğe mi gidiyorsun?</h2>
              <p className="mt-3 text-sm leading-6 text-background/75">
                Aynı dönem ve aynı birlikteki devrelerini Devrem’de bul.
              </p>
              <Link className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-extrabold text-white" href="/#uygulama">
                Devrem’i keşfet <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </section>
            {sameCity.length ? (
              <section className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
                <h2 className="text-lg font-extrabold">Aynı şehirdeki diğer birlikler</h2>
                <div className="mt-4 space-y-3">
                  {sameCity.map((item) => (
                    <Link className="block border-b border-border pb-3 text-sm font-bold hover:text-primary" href={`/birlikler/${item.citySlug}/${item.slug}`} key={item.id}>
                      {item.shortName ?? item.name}
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}
          </aside>
        </div>
      </Container>
    </main>
  );
}
