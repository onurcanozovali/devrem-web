import Image from 'next/image';
import Link from 'next/link';
import {
  BadgeTurkishLira,
  BookOpenCheck,
  Building2,
  CalendarClock,
  CalendarDays,
  CheckSquare2,
  Clock3,
  Coins,
  Compass,
  Landmark,
  MapPin,
  Newspaper,
  Search,
  TrendingUp,
} from 'lucide-react';
import { BedelliTeaser } from '@/components/home/bedelli-teaser';
import { Container } from '@/components/site/container';
import type { PublicMilitaryUnit } from '@/lib/military-units';
import { currentBedelliPeriod } from '@/src/fixtures/bedelli';
import type { BlogPost } from '@/src/fixtures/content';

const currency = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
  maximumFractionDigits: 2,
});

export const platformToolCards = [
  {
    title: 'Bedelli hesaplama',
    description: 'Güncel resmî tutarı ve alım gücü karşılıklarını incele.',
    label: 'Hesaplamayı aç',
    href: '/bedelli#alim-gucu',
    icon: BadgeTurkishLira,
  },
  {
    title: 'Ücret geçmişi',
    description: 'Son beş yıldaki bedelli tutarlarını yan yana karşılaştır.',
    label: 'Geçmişi karşılaştır',
    href: '/bedelli#piyasa-grafigi',
    icon: TrendingUp,
  },
  {
    title: 'Altın ve döviz karşılaştırması',
    description: 'Ücretin gram altın, dolar ve euro karşılığını gör.',
    label: 'Alım gücünü gör',
    href: '/bedelli#alim-gucu',
    icon: Coins,
  },
  {
    title: 'Askerlik geri sayımı',
    description: 'Yaklaşan sevk dönemlerini takvim üzerinden planla.',
    label: 'Tarihleri incele',
    href: '/blog/2026-askerlik-celp-sevk-tarihleri',
    icon: CalendarClock,
  },
  {
    title: 'Celp ve sevk takvimi',
    description: 'Sonuç açıklama ve sevk tarihlerini tek yerde kontrol et.',
    label: 'Takvimi aç',
    href: '/blog/2026-askerlik-celp-sevk-tarihleri',
    icon: CalendarDays,
  },
  {
    title: 'Hazırlık listesi',
    description: 'Yanına alacaklarını sade ve uygulanabilir bir rehberle planla.',
    label: 'Hazırlık rehberine git',
    href: '/blog/askere-giderken-canta-nasil-sadelesir',
    icon: CheckSquare2,
  },
] as const;

function SectionHeading({
  id,
  eyebrow,
  title,
  description,
}: {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <header className="max-w-3xl">
      <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary-ink">{eyebrow}</p>
      <h2 className="mt-3 text-balance text-3xl font-extrabold leading-[1.03] tracking-[-0.055em] sm:text-5xl" id={id}>{title}</h2>
      <p className="mt-4 max-w-2xl text-base leading-7 text-secondary-foreground sm:text-lg">{description}</p>
    </header>
  );
}

function AdPlaceholder({ compact = false }: { compact?: boolean }) {
  return (
    <aside aria-label="Reklam alanı" className={compact ? 'platform-ad platform-ad-sidebar' : 'platform-ad'}>
      <span>Reklam Alanı</span>
    </aside>
  );
}

function PostCover({ post }: { post: BlogPost }) {
  if (post.coverImage?.src) {
    return (
      <Image
        alt={post.coverImage.alt}
        className="object-cover"
        fill
        sizes="(max-width: 768px) 100vw, 33vw"
        src={post.coverImage.src}
      />
    );
  }

  return (
    <span className="flex h-full w-full items-center justify-center bg-primary-subtle text-primary-ink">
      <BookOpenCheck className="size-8" aria-hidden="true" />
    </span>
  );
}

function uniquePosts(posts: Array<BlogPost | undefined | null>) {
  const used = new Set<string>();
  return posts.filter((post): post is BlogPost => {
    if (!post || used.has(post.slug)) return false;
    used.add(post.slug);
    return true;
  });
}

function findPost(posts: BlogPost[], terms: string[]) {
  return posts.find((post) => {
    const value = `${post.title} ${post.category}`.toLocaleLowerCase('tr-TR');
    return terms.some((term) => value.includes(term));
  });
}

function agendaPosts(posts: BlogPost[]) {
  return uniquePosts([
    findPost(posts, ['2027 bedelli']),
    findPost(posts, ['celp', 'sevk tarih']),
    findPost(posts, ['sınıflandırma']),
    findPost(posts, ['sevk belgesi']),
    ...posts,
  ]).slice(0, 4);
}

function guidePosts(posts: BlogPost[]) {
  return uniquePosts([
    findPost(posts, ['askere giderken', 'çanta']),
    findPost(posts, ['acemi birliğinde ilk gün']),
    findPost(posts, ['sevk belgesi']),
    findPost(posts, ['telefon']),
    findPost(posts, ['usta birliği']),
    findPost(posts, ['yol parası']),
    ...posts,
  ]).slice(0, 6);
}

export function HomePlatformSections({ posts, units }: { posts: BlogPost[]; units: PublicMilitaryUnit[] }) {
  const agenda = agendaPosts(posts);
  const guides = guidePosts(posts);
  const celpPost = findPost(posts, ['celp', 'sevk tarih']);
  const estimatePost = findPost(posts, ['2027 bedelli']);
  const visibleUnits = units.slice(0, 6);
  const publishedCities = Array.from(
    units.reduce((cities, unit) => {
      const current = cities.get(unit.citySlug);
      cities.set(unit.citySlug, {
        city: unit.city,
        citySlug: unit.citySlug,
        count: (current?.count ?? 0) + 1,
      });
      return cities;
    }, new Map<string, { city: string; citySlug: string; count: number }>()),
  )
    .map(([, city]) => city)
    .sort((a, b) => b.count - a.count || a.city.localeCompare(b.city, 'tr-TR'));

  return (
    <>
      <section className="platform-section bg-surface" id="gundem" aria-labelledby="agenda-title">
        <Container>
          <SectionHeading
            id="agenda-title"
            eyebrow="Şimdi ne oluyor?"
            title="Askerlik gündemi"
            description="Ücret, celp, sevk ve sınıflandırma sürecindeki güncel başlıklara hızlıca ulaş."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Link className="platform-agenda-card platform-agenda-card-lead lg:col-span-2" href="/bedelli">
              <span className="platform-card-icon"><BadgeTurkishLira className="size-5" aria-hidden="true" /></span>
              <small>Güncel resmî tutar</small>
              <strong>{currency.format(currentBedelliPeriod.amount)}</strong>
              <p>2026 bedelli askerlik ücreti ve karşılaştırmalı veriler</p>
            </Link>
            {agenda.slice(0, 3).map((post) => (
              <Link className="platform-agenda-card" href={`/blog/${post.slug}`} key={post.slug}>
                <span className="platform-card-icon"><Newspaper className="size-5" aria-hidden="true" /></span>
                <small>{post.category}</small>
                <h3>{post.cardTitle?.trim() || post.title}</h3>
                <time dateTime={post.publishedIso}>{post.publishedAt}</time>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <Container><AdPlaceholder /></Container>

      <section className="platform-section" id="birligini-arastir" aria-labelledby="unit-home-title">
        <Container>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              id="unit-home-title"
              eyebrow="Birlik rehberi"
              title="Birliğini araştır"
              description="Teslim olacağın birliğin konumunu, ulaşım bilgisini ve doğrulanmış detaylarını önceden incele."
            />
            <Link className="platform-text-link" href="/birlikler">Tüm birlikleri gör</Link>
          </div>
          <form action="/birlikler" className="platform-directory-search mt-9" method="get">
            <Search className="size-5 text-primary-ink" aria-hidden="true" />
            <label className="sr-only" htmlFor="home-directory-search">Birlik adı veya şehir ara</label>
            <input id="home-directory-search" name="ara" placeholder="Birlik adı veya şehir ara…" type="search" />
            <button type="submit">Birlik ara</button>
          </form>
          {visibleUnits.length ? (
            <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {visibleUnits.map((unit) => (
                <Link className="platform-unit-card" href={`/birlikler/${unit.citySlug}/${unit.slug}`} key={unit.id}>
                  <span><MapPin className="size-5" aria-hidden="true" /></span>
                  <div>
                    <small>{unit.force}</small>
                    <h3>{unit.shortName ?? unit.name}</h3>
                    <p>{unit.city}{unit.district ? ` · ${unit.district}` : ''}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-3xl border border-border bg-surface p-6 text-sm leading-6 text-secondary-foreground">
              Yayın kriterlerini karşılayan birlikler katalogda görünür. Arama alanından güncel kataloğu kontrol edebilirsin.
            </div>
          )}
          {publishedCities.length ? <div className="mt-6 flex flex-wrap gap-2" aria-label="Yayınlanmış birlik şehirleri">
            {publishedCities.slice(0, 5).map((city) => (
              <Link className="platform-city-chip" href={`/birlikler?ara=${encodeURIComponent(city.city)}`} key={city.citySlug}>{city.city}</Link>
            ))}
          </div> : null}
        </Container>
      </section>

      <section className="platform-section bg-surface" id="araclar" aria-labelledby="tools-title">
        <Container>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              id="tools-title"
              eyebrow="Devrem araçları"
              title="İşine yarayacak askerlik araçları"
              description="Ücretleri karşılaştır, tarihleri kontrol et ve hazırlığını gerçek içeriklerle planla."
            />
            <Link className="platform-text-link" href="/araclar">Tüm araçlar</Link>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
        </Container>
      </section>

      <BedelliTeaser />

      <Container><AdPlaceholder /></Container>

      {guides.length ? (
        <section className="platform-section" id="rehberler" aria-labelledby="guides-title">
          <Container>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <SectionHeading
                id="guides-title"
                eyebrow="Popüler rehberler"
                title="Askere gitmeden önce bilmen gerekenler"
                description="Teslimden ilk güne, belgelerden çanta hazırlığına kadar en çok ihtiyaç duyulan rehberler."
              />
              <Link className="platform-text-link" href="/blog">Tüm rehberler</Link>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {guides.map((post) => (
                <article className="platform-guide-card" key={post.slug}>
                  <Link className="platform-guide-cover" href={`/blog/${post.slug}`}>
                    <PostCover post={post} />
                  </Link>
                  <div>
                    <p className="platform-guide-meta"><span>{post.category}</span><small><Clock3 className="size-3" aria-hidden="true" /> {post.readingTime}</small></p>
                    <h3><Link href={`/blog/${post.slug}`}>{post.cardTitle?.trim() || post.title}</Link></h3>
                    <p>{post.excerpt}</p>
                    <Link className="platform-text-link" href={`/blog/${post.slug}`}>Rehberi oku</Link>
                  </div>
                </article>
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      {celpPost ? (
        <section className="platform-section bg-surface" id="celp-sevk" aria-labelledby="celp-title">
          <Container>
            <div className="platform-celp-panel">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary-ink">Celp &amp; sevk takvimi</p>
                <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-[-0.05em] sm:text-5xl" id="celp-title">Tarihleri kaçırma, sürecini önceden planla.</h2>
                <p className="mt-5 max-w-2xl text-base leading-7 text-secondary-foreground">Yaklaşan celp dönemi, sevk tarihleri, sınıflandırma sonuçları ve askerlik yerinin açıklanma sürecini tek rehberde takip et.</p>
                <Link className="platform-primary-button mt-7" href={`/blog/${celpPost.slug}`}>Tüm Celp ve Sevk Tarihleri</Link>
              </div>
              <div className="platform-celp-points">
                {['Sınıflandırma sonucu', 'Sevk grupları', 'Askerlik yeri açıklaması', 'Belge ve teslim süreci'].map((item) => (
                  <span key={item}><CalendarDays className="size-5" aria-hidden="true" />{item}</span>
                ))}
              </div>
            </div>
          </Container>
        </section>
      ) : null}

      {units.length >= 3 ? <section className="platform-section" id="populer-birlikler" aria-labelledby="cities-title">
        <Container>
          <SectionHeading
            id="cities-title"
            eyebrow="Şehirlere göre birlikler"
            title="Yayınlanmış askerî birlik şehirleri"
            description="Güncel birlik rehberi bulunan şehirlerdeki yayınlanmış kayıtlara hızlıca ulaş."
          />
          <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {publishedCities.map((city) => (
              <Link className="platform-city-card" href={`/birlikler?ara=${encodeURIComponent(city.city)}`} key={city.citySlug}>
                <MapPin className="size-5" aria-hidden="true" />
                <strong>{city.city}</strong>
                <small>{city.count} birlik rehberi</small>
              </Link>
            ))}
          </div>
        </Container>
      </section> : null}

      {posts.length ? (
        <section className="platform-section bg-surface" id="haberler" aria-labelledby="news-title">
          <Container>
            <SectionHeading
              id="news-title"
              eyebrow="Tarihli içerik akışı"
              title="Askerlik gündemi"
              description="MSB duyuruları, bedelli güncellemeleri ve celp-sevk gelişmelerini yayın tarihleriyle takip et."
            />
            <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
              <div className="divide-y divide-border overflow-hidden rounded-3xl border border-border bg-background">
                {posts.slice(0, 6).map((post) => (
                  <Link className="platform-news-row" href={`/blog/${post.slug}`} key={post.slug}>
                    <span><Newspaper className="size-5" aria-hidden="true" /></span>
                    <div>
                      <small>{post.category}</small>
                      <h3>{post.cardTitle?.trim() || post.title}</h3>
                    </div>
                    <time dateTime={post.publishedIso}>{post.publishedAt}</time>
                  </Link>
                ))}
              </div>
              <div className="hidden lg:block"><AdPlaceholder compact /></div>
            </div>
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <Link className="platform-secondary-button" href="/haberler">Tüm haberler</Link>
              {estimatePost ? <Link className="platform-text-link" href={`/blog/${estimatePost.slug}`}>2027 bedelli tahminini incele</Link> : null}
            </div>
          </Container>
        </section>
      ) : null}

      <section className="platform-section" id="hakkimizda" aria-labelledby="platform-about-title">
        <Container>
          <div className="platform-about-panel">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary">Devrem platformu</p>
              <h2 className="mt-3 max-w-3xl text-balance text-3xl font-extrabold leading-[1.04] tracking-[-0.055em] text-white sm:text-5xl" id="platform-about-title">Birlik bilgisinden sevk takvimine, askerliğe hazırlanmanın bilgi merkezi.</h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/65">Devrem; resmî kaynakları, karşılaştırmalı verileri, doğrulanmış birlik kayıtlarını ve anlaşılır rehberleri tek yerde toplar.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <Link href="/birlikler"><Building2 className="size-5" aria-hidden="true" /><span>Birlikler</span></Link>
              <Link href="/bedelli"><Landmark className="size-5" aria-hidden="true" /><span>Bedelli</span></Link>
              <Link href="/blog"><Compass className="size-5" aria-hidden="true" /><span>Rehberler</span></Link>
            </div>
          </div>
        </Container>
      </section>

      <Container className="pb-12 sm:pb-16"><AdPlaceholder /></Container>
    </>
  );
}
