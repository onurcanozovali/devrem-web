'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ExternalLink, Search, Shield } from 'lucide-react';
import rankAttributions from '@/src/content/rank-image-attributions.json';
import {
  dictionaryCategories,
  dictionarySources,
  forceRanks,
  glossaryTerms,
  termId,
  type DictionaryCategory,
  type RankGroup,
} from '@/src/content/military-dictionary';

const rankGroups: RankGroup[] = [
  'General / Amiral',
  'Subay',
  'Astsubay',
  'Erbaş / Er',
];

const officialSources = dictionarySources.filter(
  (source) => !source.href.includes('wikipedia.org'),
);

function normalize(value: string) {
  return value
    .toLocaleLowerCase('tr-TR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replaceAll('ı', 'i');
}

export function MilitaryDictionary() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] =
    useState<DictionaryCategory>('Tümü');

  const visibleTerms = useMemo(() => {
    const needle = normalize(query);
    return glossaryTerms.filter(
      (item) =>
        (activeCategory === 'Tümü' || item.category === activeCategory) &&
        (!needle ||
          [item.term, item.definition, item.category, item.usage ?? ''].some(
            (value) => normalize(value).includes(needle),
          )),
    );
  }, [activeCategory, query]);

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
            ? `${visibleTerms.length} eşleşme`
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
              onClick={() => setActiveCategory(category)}
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
            <p>A’dan Z’ye</p>
            <h2>Askerlik terimleri ve anlamları</h2>
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
      ) : (
        <section className="dictionary-empty" aria-live="polite">
          <Search aria-hidden="true" />
          <h2>Bu ifadeyle eşleşen bir terim bulunamadı.</h2>
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
      )}

      <section className="dictionary-rank-teaser">
        <div>
          <p>Görsel rütbe rehberi</p>
          <h2>Rütbe işaretlerini ve sıralamasını ayrı rehberde incele.</h2>
          <Link href="/asker-rutbeleri">
            Tüm askerî rütbeleri incele <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div aria-hidden="true">
          {forceRanks.map((force) => {
            const rank = force.ranks[4];
            return rank.image ? (
              <span key={force.id}>
                <Image
                  alt=""
                  fill
                  sizes="96px"
                  src={rank.image}
                  style={{ objectFit: 'contain' }}
                />
              </span>
            ) : null;
          })}
        </div>
      </section>

      <Sources sources={officialSources} />
    </>
  );
}

export function MilitaryRanks() {
  const [activeForce, setActiveForce] = useState('kara');

  return (
    <>
      <section className="dictionary-section dictionary-ranks" id="rutbeler">
        <div className="dictionary-section-heading">
          <p>Görsel rütbe rehberi</p>
          <h2>Türk Silahlı Kuvvetleri rütbe sıralaması</h2>
          <span>
            İşaretler kuvvete göre değişir. Kartlar, her kuvvet için üstten alta
            rütbe sırasını gösterir.
          </span>
        </div>

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

        {forceRanks.map((force) => (
          <div
            className="dictionary-force-panel"
            hidden={activeForce !== force.id}
            key={force.id}
          >
            <h3>{force.label}</h3>
            {rankGroups.map((group) => {
              const ranks = force.ranks.filter((rank) => rank.group === group);
              return (
                <div className="dictionary-rank-group" key={group}>
                  <p>{group}</p>
                  <div className="dictionary-rank-grid">
                    {ranks.map((rank) => (
                      <article className="dictionary-rank-card" key={rank.id}>
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
        ))}
      </section>

      <Link className="dictionary-inline-cta" href="/asker-sozlugu">
        Askerlik terimleri sözlüğüne dön <ArrowRight aria-hidden="true" />
      </Link>

      <Sources sources={dictionarySources} showAttributions />
    </>
  );
}

function Sources({
  sources,
  showAttributions = false,
}: {
  sources: typeof dictionarySources;
  showAttributions?: boolean;
}) {
  return (
    <section
      className="dictionary-sources"
      aria-labelledby="dictionary-sources-title"
    >
      <div>
        <p>Kaynak ve kapsam</p>
        <h2 id="dictionary-sources-title">Bilginin kaynağını gör</h2>
      </div>
      <ul>
        {sources.map((source) => (
          <li key={source.href}>
            <a href={source.href} rel="noreferrer" target="_blank">
              {source.label} <ExternalLink aria-hidden="true" />
            </a>
          </li>
        ))}
      </ul>
      {showAttributions ? (
        <details className="dictionary-attributions">
          <summary>Rütbe görsellerinin lisans ve atıfları</summary>
          <p>
            Görseller Wikimedia Commons’tan yerel olarak barındırılır. Kaynak,
            üretici ve yeniden kullanım lisansı aşağıdadır.
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
      ) : null}
    </section>
  );
}
