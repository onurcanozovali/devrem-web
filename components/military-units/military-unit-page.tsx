import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Check,
  ExternalLink,
  MapPin,
  Navigation,
  Shield,
} from 'lucide-react';
import { Container } from '@/components/site/container';
import type {
  PublicMilitaryUnit,
  UnitFieldVerification,
  UnitVerification,
} from '@/lib/military-units';

const verificationLabels: Record<UnitFieldVerification, string> = {
  unknown: 'Doğrulanmadı',
  reported: 'Bildirildi',
  verified: 'Doğrulandı',
};

const unitVerificationLabels: Record<UnitVerification, string> = {
  unverified: 'Doğrulanmadı',
  reviewing: 'İnceleniyor',
  partially_verified: 'Kısmen doğrulandı',
  verified: 'Doğrulandı',
};

function VerificationBadge({ status }: { status: UnitFieldVerification }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${status === 'verified' ? 'bg-primary/10 text-primary' : status === 'reported' ? 'bg-amber-100 text-amber-800' : 'bg-muted text-secondary-foreground'}`}>
      {verificationLabels[status]}
    </span>
  );
}

function FieldSource({ href }: { href: string | null }) {
  return href ? (
    <a className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-primary underline underline-offset-4" href={href} rel="noreferrer" target="_blank">
      Alan kaynağı <ExternalLink className="size-3" aria-hidden="true" />
    </a>
  ) : null;
}

function LocationMap({
  title,
  location,
  embedUrl,
  openUrl,
}: {
  title: string;
  location: string;
  embedUrl: string;
  openUrl: string | null;
}) {
  return (
    <div className="mt-5 overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
      <div className="aspect-[16/10] w-full sm:aspect-[16/7]">
        <iframe
          allowFullScreen
          className="h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={embedUrl}
          title={`${title} konum haritası`}
        />
      </div>
      {openUrl ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3">
          <span className="text-sm font-semibold text-secondary-foreground">{location}</span>
          <a className="inline-flex items-center gap-2 text-sm font-extrabold text-primary" href={openUrl} rel="noreferrer" target="_blank">
            Büyük haritada aç <ExternalLink className="size-4" aria-hidden="true" />
          </a>
        </div>
      ) : null}
    </div>
  );
}

export function MilitaryUnitPage({
  unit,
  sameCity,
  preview = false,
}: {
  unit: PublicMilitaryUnit;
  sameCity: PublicMilitaryUnit[];
  preview?: boolean;
}) {
  const name = unit.shortName ?? unit.name;
  const hasLocation = Boolean(unit.address || unit.locationDescription || unit.mapSourceUrl || (unit.latitude !== null && unit.longitude !== null));
  const hasPreparation = Boolean(unit.joining.length || unit.preparationNotes || unit.preparationFacts.length);
  const hasContact = Boolean(unit.contact.officialPhone || unit.contact.officialWebsite || unit.contact.note);
  const mapQuery = unit.latitude !== null && unit.longitude !== null
    ? `${unit.latitude},${unit.longitude}`
    : unit.address
      ? `${unit.address}, ${unit.city}`
      : null;
  const mapUrl = unit.mapSourceUrl ?? (mapQuery
    ? `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}`
    : null);
  const mapEmbedUrl = mapQuery
    ? `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=15&output=embed`
    : null;

  return (
    <main className="bg-background py-8 sm:py-12" id="ana-icerik">
      <Container>
        {preview ? (
          <div className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 px-5 py-4 text-sm font-bold text-amber-900">
            Admin önizlemesi · Taslak ve noindex içerikler burada görülebilir; bu görünüm public sayfayla aynı renderer’ı kullanır.
          </div>
        ) : null}
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
              <BadgeCheck className="size-4" aria-hidden="true" /> {unitVerificationLabels[unit.verificationStatus]}
            </span>
            <span>{unit.force}</span>
          </div>
          <h1 className="mt-6 max-w-4xl text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl">{unit.name}</h1>
          {unit.standfirst ? <p className="mt-5 max-w-3xl text-base leading-8 text-secondary-foreground sm:text-lg">{unit.standfirst}</p> : null}
          <p className="mt-6 flex flex-wrap items-center gap-2 text-base font-semibold text-secondary-foreground">
            <MapPin className="size-5 text-primary" aria-hidden="true" />
            {unit.city}{unit.district ? ` · ${unit.district}` : ''}{unit.unitType ? ` · ${unit.unitType}` : ''}
          </p>
        </header>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="space-y-8">
            <section className="rounded-3xl border border-border bg-surface p-6 shadow-sm sm:p-8">
              <h2 className="text-2xl font-extrabold">Birlik özeti</h2>
              {unit.introduction ? <p className="mt-4 whitespace-pre-line leading-7 text-secondary-foreground">{unit.introduction}</p> : null}
              {unit.highlights.length ? (
                <div className="mt-6">
                  <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary">Öne çıkan kısa bilgiler</p>
                  <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                    {unit.highlights.map((item) => (
                      <li className="flex min-h-24 items-start gap-3 rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/10 via-primary/5 to-surface p-4 shadow-[0_8px_24px_rgba(18,92,68,0.06)]" key={item}>
                        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
                          <Check className="size-4" strokeWidth={3} aria-hidden="true" />
                        </span>
                        <span className="font-bold leading-6">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <dl className="mt-6 grid gap-5 sm:grid-cols-2">
                {[
                  ['Kuvvet', unit.force], ['Şehir', unit.city], ['İlçe', unit.district],
                  ['Birlik türü', unit.unitType], ['Hedef grup', unit.audiences.join(', ') || null],
                  ['Son güncelleme', new Intl.DateTimeFormat('tr-TR', { dateStyle: 'long' }).format(new Date(unit.updatedAt))],
                ].flatMap(([label, value]) => value ? [
                  <div className="border-b border-border pb-4" key={label}>
                    <dt className="text-xs font-extrabold uppercase tracking-[0.12em] text-primary">{label}</dt>
                    <dd className="mt-2 font-semibold">{value}</dd>
                  </div>,
                ] : [])}
              </dl>
            </section>

            {hasLocation || unit.transportationMethods.length ? (
              <section className="rounded-3xl border border-border bg-surface p-6 shadow-sm sm:p-8">
                <h2 className="flex items-center gap-3 text-2xl font-extrabold"><Navigation className="size-6 text-primary" aria-hidden="true" /> Konum ve ulaşım</h2>
                {hasLocation ? (
                  <div className="mt-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="font-extrabold">Konum</h3>
                      <VerificationBadge status={unit.locationVerificationStatus} />
                    </div>
                    {unit.address ? <p className="mt-2 whitespace-pre-line leading-7 text-secondary-foreground">{unit.address}</p> : null}
                    {unit.locationDescription ? <p className="mt-2 whitespace-pre-line leading-7 text-secondary-foreground">{unit.locationDescription}</p> : null}
                    {mapEmbedUrl ? (
                      <LocationMap
                        embedUrl={mapEmbedUrl}
                        location={`${unit.city}${unit.district ? ` · ${unit.district}` : ''}`}
                        openUrl={mapUrl}
                        title={unit.name}
                      />
                    ) : mapUrl ? (
                      <a className="mt-3 inline-flex items-center gap-2 font-bold text-primary underline underline-offset-4" href={mapUrl} rel="noreferrer" target="_blank">
                        Haritada aç <ExternalLink className="size-4" aria-hidden="true" />
                      </a>
                    ) : null}
                  </div>
                ) : null}
                {unit.transportationMethods.length ? <div className="mt-7 space-y-5 border-t border-border pt-6">{unit.transportationMethods.map((method) => <div key={method.key}><div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-extrabold">{method.label}</h3><VerificationBadge status={method.verificationStatus} /></div><p className="mt-2 whitespace-pre-line leading-7 text-secondary-foreground">{method.value}</p><FieldSource href={method.sourceUrl} /></div>)}</div> : null}
              </section>
            ) : null}

            {unit.verifiedFacts.length ? (
              <section className="rounded-3xl border border-border bg-surface p-6 shadow-sm sm:p-8">
                <h2 className="flex items-center gap-3 text-2xl font-extrabold"><Shield className="size-6 text-primary" aria-hidden="true" /> Bilinmesi gerekenler</h2>
                <ul className="mt-5 space-y-3">{unit.verifiedFacts.map((fact) => <li className="rounded-2xl bg-primary/7 px-4 py-3 leading-7" key={fact}>{fact}</li>)}</ul>
              </section>
            ) : null}

            {unit.facilities.length ? (
              <section className="rounded-3xl border border-border bg-surface p-6 shadow-sm sm:p-8">
                <h2 className="text-2xl font-extrabold">Olanaklar</h2>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">{unit.facilities.map((item) => <div className="rounded-2xl border border-border p-4" key={item.label}><div className="flex items-center justify-between gap-3"><strong>{item.label}</strong><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${item.availability === 'available' ? 'bg-primary/10 text-primary' : 'bg-rose-50 text-rose-800'}`}>{item.availability === 'available' ? 'Var' : 'Yok'}</span></div><div className="mt-2"><VerificationBadge status={item.verificationStatus} /></div>{item.note ? <p className="mt-2 text-sm leading-6 text-secondary-foreground">{item.note}</p> : null}</div>)}</div>
              </section>
            ) : null}

            {hasPreparation ? (
              <section className="rounded-3xl border border-border bg-surface p-6 shadow-sm sm:p-8">
                <h2 className="text-2xl font-extrabold">Teslim ve hazırlık</h2>
                {unit.joining.length ? <div className="mt-5 space-y-5">{unit.joining.map((item) => <div key={item.key}><div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-extrabold">{item.label}</h3><VerificationBadge status={item.verificationStatus} /></div><p className="mt-2 whitespace-pre-line leading-7 text-secondary-foreground">{item.value}</p><FieldSource href={item.sourceUrl} /></div>)}</div> : null}
                {unit.preparationNotes ? <div className="mt-6 border-t border-border pt-5"><div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-extrabold">Birlik özel hazırlık notları</h3><VerificationBadge status={unit.preparationNotes.verificationStatus} /></div><p className="mt-2 whitespace-pre-line leading-7 text-secondary-foreground">{unit.preparationNotes.value}</p><FieldSource href={unit.preparationNotes.sourceUrl} /></div> : null}
                {unit.preparationFacts.length ? <ul className="mt-5 list-disc space-y-2 pl-5 text-secondary-foreground">{unit.preparationFacts.map((fact) => <li key={fact}>{fact}</li>)}</ul> : null}
                <div className="mt-6 grid gap-3 sm:grid-cols-2"><Link className="group rounded-2xl border border-border p-4 font-extrabold transition hover:border-primary/35" href="/blog/askerde-telefon-serbest-mi">Telefon rehberi <ArrowRight className="ml-2 inline size-4 text-primary transition group-hover:translate-x-1" aria-hidden="true" /></Link><Link className="group rounded-2xl border border-border p-4 font-extrabold transition hover:border-primary/35" href="/blog/askere-giderken-canta-nasil-sadelesir">Hazırlık rehberi <ArrowRight className="ml-2 inline size-4 text-primary transition group-hover:translate-x-1" aria-hidden="true" /></Link></div>
              </section>
            ) : null}

            {hasContact ? <section className="rounded-3xl border border-border bg-surface p-6 shadow-sm sm:p-8"><h2 className="text-2xl font-extrabold">İletişim</h2><div className="mt-5 space-y-3">{unit.contact.officialPhone ? <p><strong>Resmî telefon:</strong> {unit.contact.officialPhone}</p> : null}{unit.contact.officialWebsite ? <a className="inline-flex items-center gap-2 font-bold text-primary underline underline-offset-4" href={unit.contact.officialWebsite} rel="noreferrer" target="_blank">Resmî web sayfası <ExternalLink className="size-4" aria-hidden="true" /></a> : null}{unit.contact.note ? <p className="whitespace-pre-line leading-7 text-secondary-foreground">{unit.contact.note}</p> : null}</div></section> : null}

            {unit.faqs.length ? <section className="rounded-3xl border border-border bg-surface p-6 shadow-sm sm:p-8"><h2 className="text-2xl font-extrabold">Sık sorulan sorular</h2><div className="mt-5 divide-y divide-border">{unit.faqs.map((item) => <details className="py-4" key={item.id}><summary className="cursor-pointer font-extrabold">{item.question}</summary><p className="mt-3 whitespace-pre-line leading-7 text-secondary-foreground">{item.answer}</p><div className="mt-3 flex flex-wrap items-center gap-3"><VerificationBadge status={item.verificationStatus} /><FieldSource href={item.sourceUrl} /></div></details>)}</div></section> : null}

            {unit.sources.length ? <section className="rounded-3xl border border-border bg-surface p-6 shadow-sm sm:p-8"><h2 className="text-2xl font-extrabold">Kaynaklar</h2><ul className="mt-5 space-y-4">{unit.sources.map((source, index) => <li className="border-b border-border pb-4" key={`${source.url ?? source.title}-${index}`}>{source.url ? <a className="font-bold text-primary underline underline-offset-4" href={source.url} rel="noreferrer" target="_blank">{source.title ?? 'Kaynağı görüntüle'}</a> : <strong>{source.title}</strong>}<p className="mt-1 text-xs text-secondary-foreground">{source.type === 'official' ? 'Resmî kaynak' : source.type === 'map' ? 'Harita kaynağı' : source.type === 'institutional' ? 'Kurumsal kaynak' : source.type === 'community' ? 'Kullanıcı bildirimi' : 'Diğer kaynak'}{source.accessedAt ? ` · ${source.accessedAt.slice(0, 10)}` : ''}</p>{source.note ? <p className="mt-2 text-sm text-secondary-foreground">{source.note}</p> : null}</li>)}</ul>{unit.sourceNote ? <p className="mt-4 whitespace-pre-line text-sm leading-6 text-secondary-foreground">{unit.sourceNote}</p> : null}</section> : null}

            <section className="rounded-3xl border border-border bg-surface p-6 shadow-sm sm:p-8"><h2 className="flex items-center gap-3 text-2xl font-extrabold"><BookOpen className="size-6 text-primary" aria-hidden="true" /> İlgili rehberler</h2><div className="mt-5 grid gap-3">{[['/blog/acemi-birliginde-ilk-gun', 'Acemi birliğinde ilk gün'], ['/blog/askerlik-yol-parasi-ne-kadar-nasil-alinir', 'Askerlik yol parası nasıl alınır?'], ['/blog/sevk-belgesi-nedir-nasil-alinir', 'Sevk belgesi nedir, nasıl alınır?']].map(([href, label]) => <Link className="flex items-center justify-between gap-4 rounded-2xl bg-primary/7 px-4 py-3 font-bold hover:text-primary" href={href} key={href}>{label}<ArrowRight className="size-4 shrink-0" aria-hidden="true" /></Link>)}</div></section>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
            <section className="rounded-3xl bg-foreground p-6 text-background"><p className="text-xs font-extrabold uppercase tracking-[0.12em] text-primary">Devrem rehberleri</p><h2 className="mt-3 text-xl font-extrabold">Bu birliğe mi gidiyorsun?</h2><p className="mt-3 text-sm leading-6 text-background/75">Birlik rehberini, celp bilgilerini ve ilgili hazırlık içeriklerini incele.</p><Link className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-extrabold text-white" href="/blog">Hazırlık rehberlerini incele <ArrowRight className="size-4" aria-hidden="true" /></Link></section>
            {sameCity.length ? <section className="rounded-3xl border border-border bg-surface p-6 shadow-sm"><h2 className="text-lg font-extrabold">Aynı şehirdeki diğer birlikler</h2><div className="mt-4 space-y-3">{sameCity.map((item) => <Link className="block border-b border-border pb-3 text-sm font-bold hover:text-primary" href={`/birlikler/${item.citySlug}/${item.slug}`} key={item.id}>{item.shortName ?? item.name}</Link>)}</div></section> : null}
          </aside>
        </div>
      </Container>
    </main>
  );
}
