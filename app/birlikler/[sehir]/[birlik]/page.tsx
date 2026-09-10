import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { MilitaryUnitPage } from '@/components/military-units/military-unit-page';
import { JsonLd } from '@/components/seo/json-ld';
import {
  listIndexableMilitaryUnits,
  listPublishedMilitaryUnits,
  resolveMilitaryUnitRoute,
} from '@/lib/military-units';
import { absoluteUrl, createPageMetadata } from '@/src/config/seo';

export const dynamic = 'force-dynamic';

type PageProps = { params: Promise<{ sehir: string; birlik: string }> };

function unitTitle(name: string) {
  return `${name}: Konum, Ulaşım ve Birlik Bilgileri | Devrem`;
}

function unitDescription(name: string, city: string, district: string | null, force: string) {
  return `${name} için ${city}${district ? ` ${district}` : ''} konumu, ${force} bilgisi, birlik detayları ve ulaşım rehberi.`;
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
      image: unit.ogImage,
      imageAlt: `${unit.name} birlik rehberi`,
      index: unit.indexable,
      modifiedTime: unit.updatedAt,
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
  const [publishedUnits, indexableUnits] = await Promise.all([
    listPublishedMilitaryUnits(),
    listIndexableMilitaryUnits(),
  ]);
  const sameCity = publishedUnits.filter((item) => item.citySlug === unit.citySlug && item.id !== unit.id);
  const hasCityHub = indexableUnits.filter((item) => item.citySlug === unit.citySlug).length >= 2;
  const title = unit.seoTitle ?? unitTitle(unit.shortName ?? unit.name);
  const description = unit.metaDescription ?? unitDescription(unit.name, unit.city, unit.district, unit.force);
  const breadcrumbItems = [
    { name: 'Ana Sayfa', item: absoluteUrl('/') },
    { name: 'Askerî Birlikler', item: absoluteUrl('/birlikler') },
    ...(hasCityHub ? [{ name: unit.city, item: absoluteUrl(`/birlikler/${unit.citySlug}`) }] : []),
    { name: unit.name, item: absoluteUrl(result.canonicalPath) },
  ];
  const graph: Record<string, unknown>[] = [
    {
      '@type': 'WebPage',
      name: title,
      description,
      url: absoluteUrl(result.canonicalPath),
      inLanguage: 'tr',
      dateModified: unit.updatedAt,
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbItems.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        ...item,
      })),
    },
    {
      '@type': 'Place',
      name: unit.name,
      url: absoluteUrl(result.canonicalPath),
      address: unit.address ? {
        '@type': 'PostalAddress',
        streetAddress: unit.address,
        addressLocality: unit.district ?? unit.city,
        addressRegion: unit.city,
        addressCountry: 'TR',
      } : undefined,
      geo: unit.latitude !== null && unit.longitude !== null ? {
        '@type': 'GeoCoordinates',
        latitude: unit.latitude,
        longitude: unit.longitude,
      } : undefined,
    },
  ];
  if (unit.faqs.length) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: unit.faqs.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: { '@type': 'Answer', text: item.answer },
      })),
    });
  }

  return (
    <>
      <JsonLd data={{ '@context': 'https://schema.org', '@graph': graph }} />
      <MilitaryUnitPage sameCity={sameCity} unit={unit} />
    </>
  );
}
