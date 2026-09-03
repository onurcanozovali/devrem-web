'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  Coins,
  Euro,
  ExternalLink,
  Scale,
  Share2,
  WalletCards,
} from 'lucide-react';
import type { MarketSnapshot } from '@/lib/evds';
import {
  bedelliPeriods,
  currentBedelliPeriod,
} from '@/src/fixtures/bedelli';
import {
  bedelliComparisonDefinitions,
  bedelliFaqs,
  bedelliPageCopy,
  bedelliRelatedContent,
  bedelliSources,
  type BedelliComparisonDefinition,
  type BedelliComparisonId,
} from '@/src/content/bedelli';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';

type MarketMetric = 'usd' | 'eur' | 'gold';

type AnnualRow = {
  period: (typeof bedelliPeriods)[number];
  market: MarketSnapshot['annual'][number];
  usd: number;
  eur: number;
  gold: number;
  minimumWage: number;
  salaries: number;
};

const currency = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
  maximumFractionDigits: 2,
});

const decimal = new Intl.NumberFormat('tr-TR', {
  maximumFractionDigits: 2,
});

const compact = new Intl.NumberFormat('tr-TR', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

const marketMetricDetails = {
  usd: {
    label: 'ABD doları',
    shortLabel: 'Dolar',
    color: 'var(--primary-ink)',
  },
  eur: {
    label: 'Euro',
    shortLabel: 'Euro',
    color: 'var(--information)',
  },
  gold: {
    label: 'Gram altın',
    shortLabel: 'Gram altın',
    color: 'var(--warning)',
  },
} as const;

const chartConfig = {
  usd: { label: 'ABD doları', color: 'var(--primary-ink)' },
  eur: { label: 'Euro', color: 'var(--information)' },
  gold: { label: 'Gram altın', color: 'var(--warning)' },
} satisfies ChartConfig;

const comparisonIcons = {
  gold: Scale,
  eur: Euro,
  minimumWage: WalletCards,
} satisfies Record<BedelliComparisonId, typeof Scale>;

function formatEvdsPeriod(value: string) {
  if (/^\d{4}-\d{1,2}$/.test(value)) {
    const [year, month] = value.split('-').map(Number);
    return new Intl.DateTimeFormat('tr-TR', {
      month: 'long',
      year: 'numeric',
    }).format(new Date(Date.UTC(year, month - 1, 1)));
  }

  const [day, month, year] = value.split('-').map(Number);
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

function getDelta(current: number, previous: number) {
  return (current / previous - 1) * 100;
}

function getComparisonPrice(
  definition: BedelliComparisonDefinition,
  row: AnnualRow,
) {
  if (definition.priceSeries.kind === 'evds') {
    return row.market[definition.priceSeries.metric].value;
  }

  return definition.priceSeries.yearlyPrices[row.period.year];
}

function formatQuantity(value: number, metric: BedelliComparisonId) {
  return new Intl.NumberFormat('tr-TR', {
    maximumFractionDigits: metric === 'eur' ? 0 : 1,
  }).format(value);
}

function ShareResult({ text }: { text: string }) {
  const [status, setStatus] = useState('');

  const share = async () => {
    const url = `${window.location.origin}/bedelli`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Devrem Bedelli karşılaştırması',
          text,
          url,
        });
        setStatus('Paylaşım ekranı açıldı.');
      } else {
        await navigator.clipboard.writeText(`${text} ${url}`);
        setStatus('Sonuç ve bağlantı kopyalandı.');
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setStatus(
        'Paylaşım açılamadı. Bağlantıyı tarayıcıdan kopyalayabilirsin.',
      );
    }
  };

  return (
    <div className="bedelli-share-wrap">
      <button className="bedelli-share-button" onClick={share} type="button">
        <Share2 className="size-4" aria-hidden="true" /> Sonucu paylaş
      </button>
      <span className="sr-only" aria-live="polite">
        {status}
      </span>
    </div>
  );
}

export function BedelliCalculator({ snapshot }: { snapshot: MarketSnapshot }) {
  const [marketMetric, setMarketMetric] = useState<MarketMetric>('gold');
  const [comparisonMetric, setComparisonMetric] =
    useState<BedelliComparisonId>('gold');
  const [comparisonYear, setComparisonYear] = useState<number>(
    bedelliPeriods[0].year,
  );

  const annualRows = useMemo<AnnualRow[]>(
    () =>
      bedelliPeriods.flatMap((period) => {
        const market = snapshot.annual.find((item) => item.year === period.year);
        const wageDefinition = bedelliComparisonDefinitions.find(
          (item) => item.id === 'minimumWage',
        );

        if (!market || wageDefinition?.priceSeries.kind !== 'yearly') return [];

        const minimumWage =
          wageDefinition.priceSeries.yearlyPrices[period.year];
        if (!minimumWage) return [];

        return [
          {
            period,
            market,
            usd: period.amount / market.usd.value,
            eur: period.amount / market.eur.value,
            gold: period.amount / market.gold.value,
            minimumWage,
            salaries: period.amount / minimumWage,
          },
        ];
      }),
    [snapshot],
  );

  const currentRow = annualRows.at(-1);
  const comparisonRow = annualRows.find(
    (row) => row.period.year === comparisonYear,
  );
  const comparisonDefinition = bedelliComparisonDefinitions.find(
    (item) => item.id === comparisonMetric,
  );
  const marketMetricMeta = marketMetricDetails[marketMetric];

  if (!currentRow || !comparisonRow || !comparisonDefinition) {
    return (
      <section className="bedelli-data-error" aria-live="polite">
        <h2>Karşılaştırma verisi şu anda hazırlanamadı.</h2>
        <p>
          Güncel resmî tutar yukarıda yer alıyor. Piyasa verileri yenilendiğinde
          karşılaştırmalar otomatik olarak geri gelecek.
        </p>
      </section>
    );
  }

  const comparisonPrice = getComparisonPrice(
    comparisonDefinition,
    comparisonRow,
  );
  const currentPrice = getComparisonPrice(comparisonDefinition, currentRow);
  const comparisonQuantity = comparisonRow.period.amount / comparisonPrice;
  const currentQuantity = currentRow.period.amount / currentPrice;
  const purchasingPowerDelta = getDelta(currentQuantity, comparisonQuantity);
  const maxQuantity = Math.max(comparisonQuantity, currentQuantity);
  const feeDelta = getDelta(
    currentBedelliPeriod.amount,
    comparisonRow.period.amount,
  );
  const goldBought =
    comparisonRow.period.amount / comparisonRow.market.gold.value;
  const goldValueToday = goldBought * snapshot.current.gold.value;
  const goldDifference = goldValueToday - currentBedelliPeriod.amount;
  const maximumSalaryCount = Math.max(
    ...annualRows.map((row) => row.salaries),
  );
  const ComparisonIcon = comparisonIcons[comparisonMetric];
  const shareText = `${comparisonYear}'de bedelli askerlik ücreti yaklaşık ${formatQuantity(comparisonQuantity, comparisonMetric)} ${comparisonDefinition.unit} ediyordu; 2026'da bu karşılık ${formatQuantity(currentQuantity, comparisonMetric)} ${comparisonDefinition.unit}.`;

  return (
    <>
      <section
        className="bedelli-section bedelli-purchasing-section"
        id="alim-gucu"
        aria-labelledby="purchasing-title"
      >
        <div className="bedelli-section-heading">
          <p className="bedelli-kicker">Etkileşimli karşılaştırma</p>
          <h2 id="purchasing-title">Bu parayla ne alırdın?</h2>
          <p>{bedelliPageCopy.purchasingIntro}</p>
        </div>

        <div className="bedelli-picker-row">
          <fieldset className="bedelli-year-picker">
            <legend>Karşılaştırma yılı</legend>
            <div>
              {bedelliPeriods.map((period) => (
                <button
                  aria-pressed={comparisonYear === period.year}
                  key={period.year}
                  onClick={() => setComparisonYear(period.year)}
                  type="button"
                >
                  {period.year}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="bedelli-metric-picker">
            <legend>Karşılaştırma ölçüsü</legend>
            <div>
              {bedelliComparisonDefinitions.map((definition) => {
                const Icon = comparisonIcons[definition.id];
                return (
                  <button
                    aria-pressed={comparisonMetric === definition.id}
                    key={definition.id}
                    onClick={() => setComparisonMetric(definition.id)}
                    type="button"
                  >
                    <Icon className="size-4" aria-hidden="true" />
                    {definition.name}
                  </button>
                );
              })}
            </div>
          </fieldset>
        </div>

        <div className="bedelli-comparison-stage">
          <div className="bedelli-comparison-intro">
            <span className="bedelli-comparison-icon">
              <ComparisonIcon className="size-7" aria-hidden="true" />
            </span>
            <div>
              <p>{comparisonDefinition.name}</p>
              <strong>
                {purchasingPowerDelta < 0
                  ? 'Alım gücü azaldı'
                  : 'Alım gücü arttı'}
              </strong>
            </div>
            <span
              className={
                purchasingPowerDelta < 0
                  ? 'bedelli-change is-negative'
                  : 'bedelli-change'
              }
            >
              {purchasingPowerDelta > 0 ? '+' : ''}
              {decimal.format(purchasingPowerDelta)}%
            </span>
          </div>

          <div className="bedelli-bar-comparison">
            <div className="bedelli-bar-row">
              <div className="bedelli-bar-label">
                <span>{comparisonYear}</span>
                <strong>
                  {formatQuantity(comparisonQuantity, comparisonMetric)}{' '}
                  <small>{comparisonDefinition.unit}</small>
                </strong>
              </div>
              <div className="bedelli-bar-track" aria-hidden="true">
                <span
                  style={{
                    width: `${Math.max(12, (comparisonQuantity / maxQuantity) * 100)}%`,
                  }}
                />
              </div>
            </div>
            <div className="bedelli-bar-row is-current">
              <div className="bedelli-bar-label">
                <span>2026</span>
                <strong>
                  {formatQuantity(currentQuantity, comparisonMetric)}{' '}
                  <small>{comparisonDefinition.unit}</small>
                </strong>
              </div>
              <div className="bedelli-bar-track" aria-hidden="true">
                <span
                  style={{
                    width: `${Math.max(12, (currentQuantity / maxQuantity) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="bedelli-comparison-footer">
            <p>
              {comparisonYear} bedeliyle yaklaşık{' '}
              <strong>
                {formatQuantity(comparisonQuantity, comparisonMetric)}{' '}
                {comparisonDefinition.unit}
              </strong>{' '}
              alınabilirken 2026 bedeliyle karşılık{' '}
              <strong>
                {formatQuantity(currentQuantity, comparisonMetric)}{' '}
                {comparisonDefinition.unit}
              </strong>
              .
            </p>
            <ShareResult text={shareText} />
          </div>
        </div>

        <p className="bedelli-data-note">
          {comparisonDefinition.notes}{' '}
          <a
            href={comparisonDefinition.source.url}
            rel="noreferrer"
            target="_blank"
          >
            Kaynağı gör <ExternalLink className="size-3" aria-hidden="true" />
          </a>
        </p>
      </section>

      <section
        className="bedelli-section bedelli-time-machine"
        aria-labelledby="time-machine-title"
      >
        <div className="bedelli-time-machine-copy">
          <p className="bedelli-kicker">Bedelli zaman makinesi</p>
          <h2 id="time-machine-title">
            {comparisonYear}’den bugüne tek bakış.
          </h2>
          <p>
            Aynı dönemin resmî ücretini bugünkü tutarla ve seçtiğin alım gücü
            ölçüsüyle yan yana getir.
          </p>
        </div>
        <div className="bedelli-time-machine-result">
          <div>
            <span>{comparisonYear} bedeli</span>
            <strong>{currency.format(comparisonRow.period.amount)}</strong>
          </div>
          <ArrowRight className="size-5" aria-hidden="true" />
          <div>
            <span>2026 bedeli</span>
            <strong>{currency.format(currentBedelliPeriod.amount)}</strong>
          </div>
          <div className="bedelli-time-delta">
            <span>Nominal değişim</span>
            <strong>+{decimal.format(feeDelta)}%</strong>
          </div>
          <p>
            {comparisonDefinition.name} karşılığı{' '}
            <b>{formatQuantity(comparisonQuantity, comparisonMetric)}</b>’den{' '}
            <b>{formatQuantity(currentQuantity, comparisonMetric)}</b>’e geldi.
          </p>
        </div>
      </section>

      <section
        className="bedelli-section bedelli-gold-story"
        aria-labelledby="gold-story-title"
      >
        <div className="bedelli-gold-visual" aria-hidden="true">
          <span>
            <Coins className="size-10" />
          </span>
          <i>{decimal.format(goldBought)} gr</i>
        </div>
        <div className="bedelli-gold-copy">
          <p className="bedelli-kicker">Geçmişe dönük senaryo</p>
          <h2 id="gold-story-title">Bedelli ücretini altına yatırsaydın?</h2>
          <p>
            {comparisonYear} yılındaki bedelli tutarı o dönemin gram altın
            fiyatıyla yaklaşık <strong>{decimal.format(goldBought)} gram</strong>{' '}
            altın ediyordu.
          </p>
          <div className="bedelli-gold-result">
            <div>
              <span>Bugünkü yaklaşık değeri</span>
              <strong>{currency.format(goldValueToday)}</strong>
            </div>
            <div>
              <span>Bugünkü bedelden farkı</span>
              <strong className={goldDifference < 0 ? 'is-negative' : ''}>
                {goldDifference >= 0 ? '+' : ''}
                {currency.format(goldDifference)}
              </strong>
            </div>
          </div>
          <small>{bedelliPageCopy.goldDisclaimer}</small>
        </div>
      </section>

      <section
        className="bedelli-section bedelli-salary-section"
        aria-labelledby="salary-title"
      >
        <div className="bedelli-section-heading">
          <p className="bedelli-kicker">Gelire göre karşılık</p>
          <h2 id="salary-title">Bedelli kaç maaş?</h2>
          <p>
            Her yılın ikinci yarı bedelini aynı dönemde geçerli aylık net asgari
            ücretle karşılaştır.
          </p>
        </div>
        <div className="bedelli-salary-bars">
          {annualRows.map((row) => (
            <div className="bedelli-salary-row" key={row.period.year}>
              <span>{row.period.year}</span>
              <div aria-hidden="true">
                <i
                  style={{
                    width: `${Math.max(10, (row.salaries / maximumSalaryCount) * 100)}%`,
                  }}
                />
              </div>
              <strong>{decimal.format(row.salaries)} maaş</strong>
            </div>
          ))}
        </div>
        <p className="bedelli-data-note">
          Net asgari ücret verileri Çalışma ve Sosyal Güvenlik Bakanlığı
          kayıtlarından alınır. 2022 ve 2023 için Temmuz–Aralık tutarı kullanılır.
        </p>
      </section>

      <section
        className="bedelli-trend-panel bedelli-section"
        id="piyasa-grafigi"
        aria-labelledby="market-trend-title"
      >
        <div className="bedelli-chart-heading">
          <div>
            <p className="bedelli-kicker">Son beş yıl</p>
            <h2 id="market-trend-title">Piyasa nasıl hareket etti?</h2>
            <p>
              Aylık son değerleri tek grafikte izle. Göstergeyi değiştirerek
              döviz ve gram altının dönem içindeki hareketini karşılaştır.
            </p>
          </div>
          <fieldset className="bedelli-chart-tabs">
            <legend className="sr-only">Piyasa göstergesi</legend>
            {(Object.keys(marketMetricDetails) as MarketMetric[]).map(
              (item) => (
                <button
                  aria-pressed={marketMetric === item}
                  key={item}
                  onClick={() => setMarketMetric(item)}
                  type="button"
                >
                  {marketMetricDetails[item].shortLabel}
                </button>
              ),
            )}
          </fieldset>
        </div>
        <div className="bedelli-chart-shell">
          <div className="bedelli-chart-meta">
            <div>
              <span>Seçili gösterge</span>
              <strong>
                {marketMetricMeta.label} ·{' '}
                {marketMetric === 'gold' ? 'TL/gram' : 'TL'}
              </strong>
            </div>
            <span>EVDS aylık son değer</span>
          </div>
          <ChartContainer
            className="h-[280px] w-full aspect-auto sm:h-[340px]"
            config={chartConfig}
            id="bedelli-market"
            initialDimension={{ width: 760, height: 340 }}
          >
            <AreaChart
              data={snapshot.history}
              margin={{ left: 0, right: 8, top: 10, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="bedelliChartFill"
                  x1="0"
                  x2="0"
                  y1="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={marketMetricMeta.color}
                    stopOpacity={0.28}
                  />
                  <stop
                    offset="95%"
                    stopColor={marketMetricMeta.color}
                    stopOpacity={0.02}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 6" vertical={false} />
              <XAxis
                axisLine={false}
                dataKey="label"
                minTickGap={24}
                tickLine={false}
              />
              <YAxis
                axisLine={false}
                domain={['dataMin - 1', 'dataMax + 1']}
                tickFormatter={(value: number) => compact.format(value)}
                tickLine={false}
                width={46}
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
                cursor={{ stroke: 'var(--border)' }}
              />
              <Area
                activeDot={{ r: 5, fill: marketMetricMeta.color }}
                animationDuration={650}
                dataKey={marketMetric}
                fill="url(#bedelliChartFill)"
                stroke={marketMetricMeta.color}
                strokeWidth={3}
                type="monotone"
              />
            </AreaChart>
          </ChartContainer>
        </div>
      </section>

      <section className="bedelli-context-cta" aria-labelledby="prep-cta-title">
        <div>
          <p className="bedelli-kicker">Sıradaki adım</p>
          <h2 id="prep-cta-title">Ücreti öğrendin, hazırlığı da planla.</h2>
          <p>
            Yanına alacaklarını sadeleştir; celp ve sevk takvimini resmî
            tarihlerle birlikte takip et.
          </p>
        </div>
        <div>
          <Link href="/blog/askere-giderken-canta-nasil-sadelesir">
            Hazırlık rehberine git{' '}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <Link
            className="is-secondary"
            href="/blog/2026-askerlik-celp-sevk-tarihleri"
          >
            Celp ve sevk rehberi
          </Link>
        </div>
      </section>

      <section className="bedelli-data-section" aria-labelledby="data-title">
        <details>
          <summary>
            <span>
              <b id="data-title">Detaylı yıllık verileri göster</b>
              <small>Kesin tutarlar ve karşılıkları tek tabloda incele.</small>
            </span>
            <ChevronDown className="size-5" aria-hidden="true" />
          </summary>
          <div className="bedelli-table-scroll">
            <table>
              <caption>
                Her satır ilgili yılın ikinci yarı bedelini ve aynı aya
                hizalanan piyasa karşılıklarını gösterir.
              </caption>
              <thead>
                <tr>
                  <th scope="col">Yıl</th>
                  <th scope="col">Bedelli ücreti</th>
                  <th scope="col">Euro</th>
                  <th scope="col">Gram altın</th>
                  <th scope="col">Net asgari ücret</th>
                  <th scope="col">Maaş karşılığı</th>
                </tr>
              </thead>
              <tbody>
                {annualRows.map((row) => (
                  <tr key={row.period.year}>
                    <th scope="row">
                      {row.period.year}
                      <small>{formatEvdsPeriod(row.market.gold.date)}</small>
                    </th>
                    <td>
                      <a
                        href={row.period.sourceUrl}
                        rel="noreferrer"
                        target="_blank"
                      >
                        {currency.format(row.period.amount)}
                      </a>
                    </td>
                    <td>{decimal.format(row.eur)} EUR</td>
                    <td>{decimal.format(row.gold)} gr</td>
                    <td>{currency.format(row.minimumWage)}</td>
                    <td>{decimal.format(row.salaries)} maaş</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </section>

      <section
        className="bedelli-section bedelli-related"
        aria-labelledby="related-title"
      >
        <div className="bedelli-section-heading">
          <p className="bedelli-kicker">Devamını keşfet</p>
          <h2 id="related-title">Bunlara da bak</h2>
        </div>
        <div className="bedelli-related-grid">
          {bedelliRelatedContent.map((item) => (
            <Link href={item.href} key={item.href}>
              <span>
                <CalendarDays className="size-4" aria-hidden="true" />
              </span>
              <strong>{item.title}</strong>
              <p>{item.description}</p>
              <i>
                Rehberi oku <ArrowRight className="size-4" aria-hidden="true" />
              </i>
            </Link>
          ))}
        </div>
      </section>

      <section className="bedelli-section bedelli-faq" aria-labelledby="faq-title">
        <div className="bedelli-section-heading">
          <p className="bedelli-kicker">Kısa ve net</p>
          <h2 id="faq-title">Sık sorulan sorular</h2>
        </div>
        <div className="bedelli-faq-list">
          {bedelliFaqs.map((item) => (
            <details key={item.question}>
              <summary>
                {item.question}
                <ChevronDown className="size-5" aria-hidden="true" />
              </summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="bedelli-sources" aria-labelledby="sources-title">
        <div>
          <p className="bedelli-kicker">Şeffaf veri</p>
          <h2 id="sources-title">Veri kaynakları</h2>
          <p>
            Sonuçlar resmî tutarlar ve günlük önbelleklenen piyasa verileriyle
            hesaplanır; etkileşimler yeni ağ isteği oluşturmaz.
          </p>
        </div>
        <ul>
          {[bedelliSources.market, bedelliSources.minimumWage].map((source) => (
            <li key={source.id}>
              <Check className="size-4" aria-hidden="true" />
              <span>
                <b>{source.organization}</b>
                <a href={source.url} rel="noreferrer" target="_blank">
                  {source.title}{' '}
                  <ExternalLink className="size-3" aria-hidden="true" />
                </a>
              </span>
            </li>
          ))}
          <li>
            <Check className="size-4" aria-hidden="true" />
            <span>
              <b>Resmî bedelli askerlik tutarları</b>
              <span className="bedelli-source-links">
                {bedelliPeriods.map((period) => (
                  <a
                    href={period.sourceUrl}
                    key={period.year}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {period.year} <ExternalLink className="size-3" aria-hidden="true" />
                  </a>
                ))}
              </span>
            </span>
          </li>
        </ul>
      </section>

      <section className="bedelli-final-cta" aria-labelledby="final-cta-title">
        <div>
          <p className="bedelli-kicker">Devrem uygulaması</p>
          <h2 id="final-cta-title">Kaç gün kaldı?</h2>
          <p>
            Sevk tarihini Devrem’e ekle; geri sayımını, hazırlığını ve aynı
            birlikteki devrelerini tek yerde takip et.
          </p>
        </div>
        <Link href="/#uygulama">
          Devrem’i keşfet <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </section>
    </>
  );
}
