'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  ExternalLink,
  FileText,
  Search,
  Shield,
} from 'lucide-react';
import rankAttributions from '@/src/content/rank-image-attributions.json';
import {
  barracksGuide,
  dictionaryCategories,
  dictionarySources,
  documentLinks,
  forceRanks,
  glossaryTerms,
  serviceTimeline,
  serviceTypes,
  termId,
  unitHierarchy,
  type ContentCategory,
  type DictionaryCategory,
  type RankGroup,
} from '@/src/content/military-dictionary';

const categoryIds: Record<ContentCategory, string> = {
  Sözlük: 'sozluk',
  Rütbeler: 'rutbeler',
  'Birlik Yapısı': 'birlik-yapisi',
  'Askerlik Süreci': 'askerlik-sureci',
  'Kışla Hayatı': 'kisla-hayati',
  Belgeler: 'belgeler',
  'Askerlik Türleri': 'askerlik-turleri',
};

const rankGroups: RankGroup[] = [
  'General / Amiral',
  'Subay',
  'Astsubay',
  'Erbaş / Er',
];

function normalize(value: string) {
  return value
    .toLocaleLowerCase('tr-TR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replaceAll('ı', 'i');
}

function matchesQuery(query: string, ...values: string[]) {
  if (!query) return true;
  const needle = normalize(query);
  return values.some((value) => normalize(value).includes(needle));
}

export function MilitaryDictionary() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] =
    useState<DictionaryCategory>('Tümü');
  const [activeForce, setActiveForce] = useState('kara');

  const visibleTerms = useMemo(
    () =>
      glossaryTerms.filter(
        (item) =>
          (activeCategory === 'Tümü' || item.category === activeCategory) &&
          matchesQuery(
            query,
            item.term,
            item.definition,
            item.category,
            item.usage ?? '',
          ),
      ),
    [activeCategory, query],
  );

  const visibleRanks = useMemo(
    () =>
      forceRanks.flatMap((force) =>
        force.ranks.filter((rank) =>
          matchesQuery(
            query,
            rank.name,
            rank.group,
            rank.description,
            force.label,
          ),
        ),
      ),
    [query],
  );

  const letters = useMemo(
    () =>
      Array.from(
        new Set(
          visibleTerms.map((item) =>
            item.term.charAt(0).toLocaleUpperCase('tr-TR'),
          ),
        ),
      ).sort((a, b) => a.localeCompare(b, 'tr')),
    [visibleTerms],
  );

  const showSection = (category: ContentCategory, haystack: string[]) => {
    if (activeCategory !== 'Tümü' && activeCategory !== category) return false;
    return matchesQuery(query, ...haystack);
  };

  const unitVisible = showSection(
    'Birlik Yapısı',
    unitHierarchy.flatMap((item) => [item.name, item.note]),
  );
  const processVisible = showSection(
    'Askerlik Süreci',
    serviceTimeline.flatMap((item) => [item.name, item.note]),
  );
  const barracksVisible = showSection(
    'Kışla Hayatı',
    barracksGuide.flatMap((item) => [item.name, item.note]),
  );
  const documentsVisible = showSection(
    'Belgeler',
    documentLinks.flatMap((item) => [item.name, item.note]),
  );
  const typesVisible = showSection(
    'Askerlik Türleri',
    serviceTypes.flatMap((item) => [item.name, item.duration, item.note]),
  );
  const ranksVisible =
    (activeCategory === 'Tümü' || activeCategory === 'Rütbeler') &&
    visibleRanks.length > 0;

  const resultCount =
    visibleTerms.length +
    (ranksVisible ? visibleRanks.length : 0) +
    (unitVisible ? unitHierarchy.length : 0) +
    (processVisible ? serviceTimeline.length : 0) +
    (barracksVisible ? barracksGuide.length : 0) +
    (documentsVisible ? documentLinks.length : 0) +
    (typesVisible ? serviceTypes.length : 0);

  const selectCategory = (category: DictionaryCategory) => {
    setActiveCategory(category);
    if (category !== 'Tümü') {
      window.setTimeout(() => {
        document
          .getElementById(categoryIds[category])
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  };

  return (
    <>
      <section
        className="dictionary-discovery"
        aria-label="Asker sözlüğünde ara"
      >
        <label className="dictionary-search">
          <Search aria-hidden="true" />
          <span className="sr-only">Asker sözlüğünde ara</span>
          <input
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveCategory('Tümü');
            }}
            placeholder="Bir terim ara: devre, celp, içtima..."
            type="search"
            value={query}
          />
        </label>
        <p aria-live="polite">
          {query
            ? `${resultCount} eşleşme`
            : `${glossaryTerms.length} temel terim`}
        </p>
      </section>

      <nav className="dictionary-category-nav" aria-label="Sözlük kategorileri">
        <div>
          {dictionaryCategories.map((category) => (
            <button
              aria-pressed={activeCategory === category}
              className={activeCategory === category ? 'is-active' : undefined}
              key={category}
              onClick={() => selectCategory(category)}
              type="button"
            >
              {category}
            </button>
          ))}
        </div>
      </nav>

      {letters.length > 0 ? (
        <nav className="dictionary-alpha" aria-label="Alfabetik dizin">
          <span>A–Z</span>
          {letters.map((letter) => {
            const firstTerm = visibleTerms.find((item) =>
              item.term.toLocaleUpperCase('tr-TR').startsWith(letter),
            );
            return (
              <a href={`#${termId(firstTerm?.term ?? '')}`} key={letter}>
                {letter}
              </a>
            );
          })}
        </nav>
      ) : null}

      {visibleTerms.length > 0 ? (
        <section className="dictionary-section" id="sozluk">
          <div className="dictionary-section-heading">
            <p>Sade ve hızlı başvuru</p>
            <h2>Terimler ve anlamları</h2>
            <span>
              Resmî tanımlar ile kışlada kullanılan gündelik ifadeler
              birbirinden ayrılmıştır.
            </span>
          </div>
          <dl className="dictionary-term-list">
            {visibleTerms.map((item) => (
              <div id={termId(item.term)} key={item.term}>
                <dt>
                  {item.term}
                  {item.usage ? <small>{item.usage}</small> : null}
                </dt>
                <dd>{item.definition}</dd>
                <a
                  href={`#${termId(item.term)}`}
                  aria-label={`${item.term} bağlantısı`}
                >
                  #
                </a>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {ranksVisible ? (
        <section className="dictionary-section dictionary-ranks" id="rutbeler">
          <div className="dictionary-section-heading">
            <p>Görsel rütbe rehberi</p>
            <h2>Türk Silahlı Kuvvetleri rütbeleri</h2>
            <span>
              İşaretler kuvvete göre değişir. Kart sırası üstten alta
              hiyerarşiyi gösterir; görev ve yetki ayrıca kadroya bağlıdır.
            </span>
          </div>

          {!query ? (
            <div className="dictionary-force-switch" aria-label="Kuvvet seçimi">
              {forceRanks.map((force) => (
                <button
                  aria-pressed={activeForce === force.id}
                  className={activeForce === force.id ? 'is-active' : undefined}
                  key={force.id}
                  onClick={() => setActiveForce(force.id)}
                  type="button"
                >
                  {force.label}
                </button>
              ))}
            </div>
          ) : null}

          {forceRanks.map((force) => {
            const ranks = force.ranks.filter((rank) =>
              matchesQuery(
                query,
                rank.name,
                rank.group,
                rank.description,
                force.label,
              ),
            );
            if (!ranks.length) return null;
            return (
              <div
                className="dictionary-force-panel"
                hidden={!query && activeForce !== force.id}
                key={force.id}
              >
                <h3>{force.label}</h3>
                {rankGroups.map((group) => {
                  const groupedRanks = ranks.filter(
                    (rank) => rank.group === group,
                  );
                  if (!groupedRanks.length) return null;
                  return (
                    <div className="dictionary-rank-group" key={group}>
                      <p>{group}</p>
                      <div className="dictionary-rank-grid">
                        {groupedRanks.map((rank) => (
                          <article
                            className="dictionary-rank-card"
                            key={rank.id}
                          >
                            <div className="dictionary-rank-image">
                              {rank.image ? (
                                <Image
                                  alt={`${force.label} ${rank.name} rütbe işareti`}
                                  fill
                                  sizes="(max-width: 720px) 55vw, (max-width: 1100px) 24vw, 190px"
                                  src={rank.image}
                                  style={{ objectFit: 'contain' }}
                                />
                              ) : (
                                <div className="dictionary-no-insignia">
                                  <Shield aria-hidden="true" />
                                  <span>Rütbe işareti yok</span>
                                </div>
                              )}
                            </div>
                            <div>
                              <small>{rank.position}</small>
                              <h4>{rank.name}</h4>
                              <p>{rank.description}</p>
                            </div>
                          </article>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </section>
      ) : null}

      {unitVisible ? (
        <section className="dictionary-section" id="birlik-yapisi">
          <div className="dictionary-section-heading">
            <p>Birliğin içindeki yerin</p>
            <h2>Birlik yapısı nasıl okunur?</h2>
            <span>
              Aşağıdaki şema yaygın bir genel hiyerarşiyi anlatır; gerçek
              kuruluş kuvvet, sınıf ve göreve göre değişebilir.
            </span>
          </div>
          <ol className="dictionary-hierarchy">
            {unitHierarchy.map((item, index) => (
              <li key={item.name}>
                <span>0{index + 1}</span>
                <strong>{item.name}</strong>
                <p>{item.note}</p>
                {index < unitHierarchy.length - 1 ? (
                  <ChevronRight aria-hidden="true" />
                ) : null}
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {processVisible ? (
        <section className="dictionary-section" id="askerlik-sureci">
          <div className="dictionary-section-heading">
            <p>Başvurudan terhise</p>
            <h2>Askerlik süreci</h2>
            <span>
              Tarih ve kişisel statü için her zaman e-Devlet Askerliğim kaydı
              ile MSB duyuruları esas alınmalıdır.
            </span>
          </div>
          <ol className="dictionary-timeline">
            {serviceTimeline.map((item, index) => (
              <li key={item.name}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <strong>{item.name}</strong>
                  <p>{item.note}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {barracksVisible ? (
        <section className="dictionary-section" id="kisla-hayati">
          <div className="dictionary-section-heading">
            <p>İlk gün için kısa çerçeve</p>
            <h2>Kışla hayatı</h2>
            <span>
              Uygulamalar birliğe göre değişebilir; burada yalnız ortak
              kavramlar özetlenir.
            </span>
          </div>
          <div className="dictionary-info-grid">
            {barracksGuide.map((item) => (
              <article key={item.name}>
                <BookOpen aria-hidden="true" />
                <h3>{item.name}</h3>
                <p>{item.note}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {documentsVisible ? (
        <section className="dictionary-section" id="belgeler">
          <div className="dictionary-section-heading">
            <p>Belgeyi doğru oku</p>
            <h2>Belgeler ve ilgili rehberler</h2>
          </div>
          <div className="dictionary-document-list">
            {documentLinks.map((item) => (
              <Link href={item.href} key={item.href}>
                <FileText aria-hidden="true" />
                <span>
                  <strong>{item.name}</strong>
                  <small>{item.note}</small>
                </span>
                <ArrowRight aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {typesVisible ? (
        <section className="dictionary-section" id="askerlik-turleri">
          <div className="dictionary-section-heading">
            <p>Statüleri karıştırma</p>
            <h2>Askerlik türleri</h2>
            <span>
              Bu tablo genel karşılaştırmadır; başvuru uygunluğu ve güncel
              şartlar resmî kayıttan kontrol edilmelidir.
            </span>
          </div>
          <table className="dictionary-type-table">
            <thead>
              <tr className="dictionary-type-head">
                <th scope="col">Statü</th>
                <th scope="col">Genel süre</th>
                <th scope="col">Açıklama</th>
              </tr>
            </thead>
            <tbody>
              {serviceTypes.map((item) => (
                <tr key={item.name}>
                  <th scope="row">{item.name}</th>
                  <td>{item.duration}</td>
                  <td>{item.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Link className="dictionary-inline-cta" href="/bedelli">
            Bedelli ücretini ve alım gücünü incele{' '}
            <ArrowRight aria-hidden="true" />
          </Link>
        </section>
      ) : null}

      {resultCount === 0 ? (
        <section className="dictionary-empty" aria-live="polite">
          <Search aria-hidden="true" />
          <h2>Bu ifadeyle eşleşen bir başlık bulunamadı.</h2>
          <p>Daha kısa bir kelime dene veya tüm kategorilere dön.</p>
          <button
            onClick={() => {
              setQuery('');
              setActiveCategory('Tümü');
            }}
            type="button"
          >
            Filtreleri temizle
          </button>
        </section>
      ) : null}

      <section className="dictionary-app-cta">
        <div>
          <p>Devrem uygulaması</p>
          <h2>Aynı dönemdeki devrelerini daha gitmeden bul.</h2>
        </div>
        <Link href="/#uygulama">
          Devrem’i keşfet <ArrowRight aria-hidden="true" />
        </Link>
      </section>

      <section
        className="dictionary-sources"
        aria-labelledby="dictionary-sources-title"
      >
        <div>
          <p>Kaynak ve kapsam</p>
          <h2 id="dictionary-sources-title">Bilginin kaynağını gör</h2>
        </div>
        <ul>
          {dictionarySources.map((source) => (
            <li key={source.href}>
              <a href={source.href} rel="noreferrer" target="_blank">
                {source.label} <ExternalLink aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
        <details className="dictionary-attributions">
          <summary>Rütbe görsellerinin lisans ve atıfları</summary>
          <p>
            Görseller Wikimedia Commons’tan yerel olarak barındırılır. Her
            dosyanın kaynak sayfası, üreticisi ve yeniden kullanım lisansı
            aşağıdadır.
          </p>
          <ul>
            {rankAttributions.map((item) => (
              <li key={item.id}>
                <a href={item.sourceUrl} rel="noreferrer" target="_blank">
                  {item.sourceFile.replace('File:', '')}
                </a>
                <span>{item.author}</span>
                <a href={item.licenseUrl} rel="noreferrer" target="_blank">
                  {item.license}
                </a>
              </li>
            ))}
          </ul>
        </details>
      </section>
    </>
  );
}
