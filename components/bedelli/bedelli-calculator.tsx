'use client';

import { useMemo, useState } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ArrowDownRight, ArrowUpRight, Coins, Euro, Info, Landmark, Scale, Sparkles } from 'lucide-react';
import type { MarketSnapshot } from '@/lib/evds';
import { bedelliPeriods, currentBedelliPeriod, firstBedelliPeriod, quarterGoldPureGrams } from '@/src/fixtures/bedelli';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

type Metric = 'usd' | 'eur' | 'gold';

const currency = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
  maximumFractionDigits: 2,
});

const decimal = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 });
const compact = new Intl.NumberFormat('tr-TR', { notation: 'compact', maximumFractionDigits: 1 });

const metricDetails = {
  usd: { label: 'ABD doları', shortLabel: 'Dolar', symbol: '$', color: 'var(--primary-ink)' },
  eur: { label: 'Euro', shortLabel: 'Euro', symbol: '€', color: 'var(--information)' },
  gold: { label: 'Gram altın', shortLabel: 'Gram altın', symbol: 'gr', color: 'var(--warning)' },
} as const;

const chartConfig = {
  usd: { label: 'ABD doları', color: 'var(--primary-ink)' },
  eur: { label: 'Euro', color: 'var(--information)' },
  gold: { label: 'Gram altın', color: 'var(--warning)' },
} satisfies ChartConfig;

function formatEvdsPeriod(value: string) {
  if (/^\d{4}-\d{1,2}$/.test(value)) {
    const [year, month] = value.split('-').map(Number);
    return new Intl.DateTimeFormat('tr-TR', { month: 'long', year: 'numeric' }).format(
      new Date(Date.UTC(year, month - 1, 1)),
    );
  }
  const [day, month, year] = value.split('-').map(Number);
  return new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }).format(
    new Date(Date.UTC(year, month - 1, day)),
  );
}

function getDelta(current: number, previous: number) {
  return ((current / previous) - 1) * 100;
}

function DeltaBadge({ value, reverse = false }: { value: number; reverse?: boolean }) {
  const positive = reverse ? value <= 0 : value >= 0;
  const Icon = value >= 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${positive ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
      <Icon className="size-3" aria-hidden="true" /> {value >= 0 ? '+' : ''}{decimal.format(value)}%
    </span>
  );
}

function ComparisonCard({
  icon: Icon,
  label,
  current,
  previous,
  currentLabel,
  previousLabel,
  unit,
  note,
}: {
  icon: typeof Landmark;
  label: string;
  current: number;
  previous: number;
  currentLabel: string;
  previousLabel: string;
  unit: string;
  note?: string;
}) {
  const delta = getDelta(current, previous);
  return (
    <article className="bedelli-comparison-card">
      <div className="flex items-start justify-between gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary-subtle text-primary-ink"><Icon className="size-5" aria-hidden="true" /></span>
        <DeltaBadge value={delta} />
      </div>
      <h3 className="mt-5 text-sm font-bold">{label}</h3>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div><p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-secondary-foreground">{currentLabel}</p><p className="mt-1 text-xl font-bold tracking-[-0.04em]">{decimal.format(current)}</p><span className="mt-1 block text-[10px] font-semibold text-secondary-foreground">{unit}</span></div>
        <div className="border-l border-border pl-3"><p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-secondary-foreground">{previousLabel}</p><p className="mt-1 text-xl font-bold tracking-[-0.04em]">{decimal.format(previous)}</p><span className="mt-1 block text-[10px] font-semibold text-secondary-foreground">{unit}</span></div>
      </div>
      {note ? <p className="mt-4 text-[10px] leading-4 text-secondary-foreground">{note}</p> : null}
    </article>
  );
}

export function BedelliCalculator({ snapshot }: { snapshot: MarketSnapshot }) {
  const [amount, setAmount] = useState<number>(currentBedelliPeriod.amount);
  const [metric, setMetric] = useState<Metric>('gold');
  const [comparisonYear, setComparisonYear] = useState<number>(firstBedelliPeriod.year);

  const annualRows = useMemo(() => bedelliPeriods.flatMap((period) => {
    const market = snapshot.annual.find((item) => item.year === period.year);
    if (!market) return [];
    const gold = period.amount / market.gold.value;
    return [{
      period,
      market,
      usd: period.amount / market.usd.value,
      eur: period.amount / market.eur.value,
      gold,
      quarter: gold / quarterGoldPureGrams,
    }];
  }), [snapshot]);

  const currentRow = annualRows.find((row) => row.period.year === currentBedelliPeriod.year);
  const comparisonRow = annualRows.find((row) => row.period.year === comparisonYear);

  const converted = {
    usd: amount / snapshot.current.usd.value,
    eur: amount / snapshot.current.eur.value,
    gold: amount / snapshot.current.gold.value,
    quarter: amount / (snapshot.current.gold.value * quarterGoldPureGrams),
  };

  const feeChange = getDelta(currentBedelliPeriod.amount, firstBedelliPeriod.amount);
  const metricMeta = metricDetails[metric];

  if (!currentRow || !comparisonRow) {
    return <section className="rounded-[2rem] border border-danger/25 bg-danger/5 p-8"><h2 className="text-xl font-bold">Beş yıllık karşılaştırma hazırlanamadı.</h2><p className="mt-2 text-sm text-secondary-foreground">Eksik piyasa dönemi bir sonraki günlük veri yenilemesinde tekrar denenecek.</p></section>;
  }

  return (
    <>
      <section className="bedelli-workspace" aria-labelledby="bedelli-calculator-title">
        <div className="bedelli-fee-panel">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary-ink">Güncel resmî tutar</p>
            <span className="rounded-full bg-primary-subtle px-3 py-1.5 text-[10px] font-bold text-primary-ink">{currentBedelliPeriod.label}</span>
          </div>
          <p className="mt-5 text-[clamp(2.7rem,7vw,5.3rem)] font-extrabold leading-none tracking-[-0.065em]">{currency.format(currentBedelliPeriod.amount)}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-surface-elevated p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-secondary-foreground">Serinin başlangıcı · 2022</p>
              <p className="mt-2 text-lg font-bold">{currency.format(firstBedelliPeriod.amount)}</p>
            </div>
            <div className="rounded-2xl border border-border bg-surface-elevated p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-secondary-foreground">Beş dönemlik tutar değişimi</p>
              <div className="mt-2 flex items-center gap-2"><p className="text-lg font-bold">+{decimal.format(feeChange)}%</p><DeltaBadge value={feeChange} /></div>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3 text-xs">
            <a className="font-bold text-primary-ink underline decoration-primary/35 underline-offset-4 hover:text-primary-dark" href={currentBedelliPeriod.sourceUrl} rel="noreferrer" target="_blank">{currentBedelliPeriod.sourceLabel}</a>
            <a className="font-bold text-primary-ink underline decoration-primary/35 underline-offset-4 hover:text-primary-dark" href="#five-year-data">Beş yılın tamamını gör</a>
          </div>
        </div>

        <div className="bedelli-converter-panel">
          <div className="flex items-start justify-between gap-4">
            <div><p className="text-xs font-bold uppercase tracking-[0.12em] text-primary-ink">Canlı çevirici</p><h2 className="mt-2 text-2xl font-bold tracking-[-0.045em]" id="bedelli-calculator-title">Bu para bugün ne eder?</h2></div>
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground"><Sparkles className="size-5" aria-hidden="true" /></span>
          </div>
          <label className="mt-7 block text-xs font-semibold text-secondary-foreground" htmlFor="bedelli-amount">Karşılaştırmak istediğin tutar</label>
          <div className="relative mt-2"><Input className="h-14 rounded-2xl bg-surface px-4 pr-14 text-xl font-bold tabular-nums" id="bedelli-amount" inputMode="numeric" max={750000} min={50000} onChange={(event) => setAmount(Math.min(750000, Math.max(50000, Number(event.target.value) || 50000)))} step={1000} type="number" value={Math.round(amount)} /><span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-secondary-foreground">TL</span></div>
          <Slider aria-label="Karşılaştırılacak tutar" className="mt-6 py-2" max={750000} min={50000} onValueChange={(value) => setAmount(Array.isArray(value) ? value[0] : value)} step={1000} value={[amount]} />
          <div className="mt-4 flex flex-wrap gap-2">
            {[0.5, 1, 1.25].map((ratio) => <button className={`rounded-full border px-3 py-1.5 text-[10px] font-bold transition ${ratio === 1 && Math.abs(amount - currentBedelliPeriod.amount) < 1000 ? 'border-primary bg-primary-subtle text-primary-ink' : 'border-border bg-surface hover:border-primary/50'}`} key={ratio} onClick={() => setAmount(currentBedelliPeriod.amount * ratio)} type="button">{ratio === 1 ? 'Güncel bedel' : `%${ratio * 100}`}</button>)}
          </div>
          <div className="mt-7 grid grid-cols-2 gap-3">
            <div className="bedelli-conversion-result"><span>$</span><p>{decimal.format(converted.usd)}</p><small>ABD doları</small></div>
            <div className="bedelli-conversion-result"><span>€</span><p>{decimal.format(converted.eur)}</p><small>Euro</small></div>
            <div className="bedelli-conversion-result"><span>gr</span><p>{decimal.format(converted.gold)}</p><small>Gram altın</small></div>
            <div className="bedelli-conversion-result"><span>¼</span><p>≈ {decimal.format(converted.quarter)}</p><small>Çeyrek altın*</small></div>
          </div>
        </div>
      </section>

      <section className="mt-20 sm:mt-24" id="five-year-data" aria-labelledby="purchasing-power-title">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary-ink">Alım gücü karşılaştırması</p>
          <h2 className="mt-3 text-3xl font-bold tracking-[-0.05em] sm:text-5xl" id="purchasing-power-title">Beş yılda ne değişti?</h2>
          <p className="mt-4 text-sm leading-7 text-secondary-foreground sm:text-base">2022–2026 arasındaki her resmî bedeli, aynı ayın dolar, euro ve altın karşılığıyla incele. Bir yıl seçerek bugünkü dönemle doğrudan kıyasla.</p>
          </div>
          <fieldset className="flex w-fit flex-wrap gap-2">
            <legend className="sr-only">Karşılaştırma yılı</legend>
            {bedelliPeriods.slice(0, -1).map((period) => <button aria-pressed={comparisonYear === period.year} className={`rounded-full border px-4 py-2 text-xs font-bold transition ${comparisonYear === period.year ? 'border-primary bg-primary text-primary-foreground shadow-sm' : 'border-border bg-surface hover:border-primary/50 hover:text-primary-ink'}`} key={period.year} onClick={() => setComparisonYear(period.year)} type="button">{period.year}</button>)}
          </fieldset>
        </div>
        <div className="mt-9 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <ComparisonCard current={currentRow.usd} currentLabel="2026" icon={Landmark} label="ABD doları karşılığı" previous={comparisonRow.usd} previousLabel={String(comparisonYear)} unit="USD" />
          <ComparisonCard current={currentRow.eur} currentLabel="2026" icon={Euro} label="Euro karşılığı" previous={comparisonRow.eur} previousLabel={String(comparisonYear)} unit="EUR" />
          <ComparisonCard current={currentRow.gold} currentLabel="2026" icon={Scale} label="Gram altın karşılığı" previous={comparisonRow.gold} previousLabel={String(comparisonYear)} unit="gram" />
          <ComparisonCard current={currentRow.quarter} currentLabel="2026" icon={Coins} label="Çeyrek altın karşılığı" note="*1,6065 gr saf altın üzerinden yaklaşık metal değeri; kuyumcu satış fiyatı değildir." previous={comparisonRow.quarter} previousLabel={String(comparisonYear)} unit="adet" />
        </div>

        <div className="mt-6 overflow-hidden rounded-[1.6rem] border border-border bg-surface">
          <Table className="min-w-[820px]">
            <TableCaption className="px-5 pb-5 text-left">Her satır, ilgili yılın ikinci yarı bedelini güncel veri ayıyla eşleşen EVDS aylık son değerleriyle gösterir.</TableCaption>
            <TableHeader className="bg-surface-elevated">
              <TableRow>
                <TableHead className="px-5">Dönem</TableHead>
                <TableHead>Resmî bedel</TableHead>
                <TableHead>ABD doları</TableHead>
                <TableHead>Euro</TableHead>
                <TableHead>Gram altın</TableHead>
                <TableHead>Çeyrek*</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {annualRows.map((row) => (
                <TableRow className={row.period.year === currentBedelliPeriod.year ? 'bg-primary-subtle/55' : undefined} key={row.period.year}>
                  <TableCell className="px-5 py-4"><strong className="block text-base">{row.period.year}</strong><span className="mt-1 block text-[10px] text-secondary-foreground">{formatEvdsPeriod(row.market.gold.date)}</span></TableCell>
                  <TableCell><strong>{currency.format(row.period.amount)}</strong><a className="mt-1 block text-[10px] font-bold text-primary-ink hover:underline" href={row.period.sourceUrl} rel="noreferrer" target="_blank">{row.period.sourceLabel}</a></TableCell>
                  <TableCell>{decimal.format(row.usd)} USD</TableCell>
                  <TableCell>{decimal.format(row.eur)} EUR</TableCell>
                  <TableCell>{decimal.format(row.gold)} gr</TableCell>
                  <TableCell>≈ {decimal.format(row.quarter)} adet</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <section className="bedelli-trend-panel mt-20 sm:mt-24" aria-labelledby="market-trend-title">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.14em] text-primary-ink">Son 5 yıl</p><h2 className="mt-3 text-3xl font-bold tracking-[-0.05em] sm:text-4xl" id="market-trend-title">Piyasa nasıl hareket etti?</h2><p className="mt-3 text-sm leading-6 text-secondary-foreground">Aylık son değerleri tek grafikte izle; gösterge geçişleri akıcı biçimde güncellenir.</p></div>
          <Tabs onValueChange={(value) => setMetric(value as Metric)} value={metric}>
            <TabsList className="h-11 w-full rounded-full bg-secondary p-1 sm:w-auto">
              {(Object.keys(metricDetails) as Metric[]).map((item) => <TabsTrigger className="h-9 rounded-full px-4 data-active:bg-surface" key={item} value={item}>{metricDetails[item].shortLabel}</TabsTrigger>)}
            </TabsList>
          </Tabs>
        </div>
        <div className="mt-8 rounded-[1.6rem] border border-border bg-surface p-4 sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs text-secondary-foreground">Seçili gösterge</p><p className="mt-1 text-lg font-bold">{metricMeta.label} · {metric === 'gold' ? 'TL/gram' : 'TL'}</p></div><span className="rounded-full bg-primary-subtle px-3 py-1.5 text-[10px] font-bold text-primary-ink">EVDS aylık son değer</span></div>
          <ChartContainer className="h-[280px] w-full aspect-auto sm:h-[340px]" config={chartConfig} initialDimension={{ width: 760, height: 340 }}>
            <AreaChart data={snapshot.history} margin={{ left: 0, right: 8, top: 10, bottom: 0 }}>
              <defs><linearGradient id="bedelliChartFill" x1="0" x2="0" y1="0" y2="1"><stop offset="5%" stopColor={metricMeta.color} stopOpacity={0.3} /><stop offset="95%" stopColor={metricMeta.color} stopOpacity={0.02} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="4 6" vertical={false} />
              <XAxis axisLine={false} dataKey="label" minTickGap={24} tickLine={false} />
              <YAxis axisLine={false} domain={['dataMin - 1', 'dataMax + 1']} tickFormatter={(value: number) => compact.format(value)} tickLine={false} width={46} />
              <ChartTooltip content={<ChartTooltipContent />} cursor={{ stroke: 'var(--border)' }} />
              <Area activeDot={{ r: 5, fill: metricMeta.color }} animationDuration={650} dataKey={metric} fill="url(#bedelliChartFill)" stroke={metricMeta.color} strokeWidth={3} type="monotone" />
            </AreaChart>
          </ChartContainer>
        </div>
      </section>

      <section className="mt-10 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[1.5rem] border border-border bg-surface p-6"><div className="flex gap-3"><Info className="mt-0.5 size-5 shrink-0 text-primary-ink" aria-hidden="true" /><div><h2 className="font-bold">Veriyi nasıl okumalısın?</h2><p className="mt-2 text-xs leading-6 text-secondary-foreground">Kurlar TCMB döviz alış, gram altın BİST altın kapanış TL/kg serisinin 1.000’e bölünmüş değeridir. Beş yıllık seri, EVDS’nin aylık “bitiş” yöntemiyle tek istekte alınır. Yıllık karşılaştırmalar aynı aya hizalanır. Çeyrek altın hesabı yalnızca yaklaşık saf altın karşılığıdır; işçilik, makas ve kuyumcu primi içermez.</p></div></div></div>
        <div className="rounded-[1.5rem] border border-border bg-surface-elevated p-6"><p className="text-[10px] font-bold uppercase tracking-[0.1em] text-secondary-foreground">Son veri dönemleri</p><div className="mt-4 space-y-2 text-xs"><p className="flex justify-between gap-3"><span>Dolar / Euro</span><strong>{formatEvdsPeriod(snapshot.current.usd.date)}</strong></p><p className="flex justify-between gap-3"><span>Gram altın</span><strong>{formatEvdsPeriod(snapshot.current.gold.date)}</strong></p><p className="flex justify-between gap-3"><span>Günlük cache</span><strong>{snapshot.source === 'live' ? 'Güncel' : 'Önceki başarılı veri'}</strong></p></div></div>
      </section>
    </>
  );
}
